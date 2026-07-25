#!/usr/bin/env node

/**
 * ⚡ Synapse Engine V2 - Lightweight Stdio MCP Server
 * Fast, zero-dependency MCP server providing Graphify AST queries, TDD status checks,
 * secret scanning, JIT skills search, context health, and CPU/GPU hardware selection.
 * Optimized for maximum token efficiency and sub-millisecond local stdio IPC performance.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { execSync } = require('child_process');
const { getHardwareStatus } = require('./hardware-selector');

// Operational paths
const ROOT_DIR = process.cwd();
const GRAPH_PATH = path.join(ROOT_DIR, 'graphify-out', 'graph.json');
const STATE_PATH = path.join(ROOT_DIR, '.agents', 'state.json');

let loadedGraph = null;
let loadedState = null;

// Variáveis de controle de cache e estado para o auto-update do Graphify
let lastGitHead = null;
let lastCheckTime = 0;
let lastGitIndexMtime = 0;
let detectedGraphifyCmd = null;

/**
 * Autodetecta a localização do executável graphify no ambiente atual
 */
function detectGraphifyCommand() {
  if (detectedGraphifyCmd) return detectedGraphifyCmd;

  try {
    execSync('graphify --version', { stdio: 'ignore' });
    detectedGraphifyCmd = 'graphify';
    return detectedGraphifyCmd;
  } catch (e) {}

  const homeDir = os.homedir();
  const localBinGraphify = path.join(homeDir, '.local', 'bin', os.platform() === 'win32' ? 'graphify.exe' : 'graphify');
  if (fs.existsSync(localBinGraphify)) {
    detectedGraphifyCmd = `"${localBinGraphify}"`;
    return detectedGraphifyCmd;
  }

  const uvCmd = os.platform() === 'win32' ? '.venv\\Scripts\\uv.exe' : '.venv/bin/uv';
  const localUv = path.join(ROOT_DIR, uvCmd);
  if (fs.existsSync(localUv)) {
    detectedGraphifyCmd = `"${localUv}" tool run --from graphifyy graphify`;
    return detectedGraphifyCmd;
  }

  detectedGraphifyCmd = 'graphify';
  return detectedGraphifyCmd;
}

/**
 * Reads and parses graphify-out/graph.json safely (cached in memory and auto-updated)
 */
function loadGraph(forceReload = false) {
  const now = Date.now();
  
  // Limita verificações de arquivos a no máximo uma vez a cada 10 segundos
  if (now - lastCheckTime > 10000 || forceReload) {
    lastCheckTime = now;
    try {
      const gitIndexPath = path.join(ROOT_DIR, '.git', 'index');
      let indexMtime = 0;
      if (fs.existsSync(gitIndexPath)) {
        indexMtime = fs.statSync(gitIndexPath).mtimeMs;
      }

      // Só executa subprocessos git se a data de modificação do index for alterada
      if (indexMtime !== lastGitIndexMtime || forceReload) {
        lastGitIndexMtime = indexMtime;
        const currentGitHead = execSync('git rev-parse HEAD', { encoding: 'utf8', cwd: ROOT_DIR }).trim();
        const hasLocalChanges = execSync('git status --porcelain', { encoding: 'utf8', cwd: ROOT_DIR }).trim().length > 0;

        if (currentGitHead !== lastGitHead || hasLocalChanges || forceReload) {
          const cmd = detectGraphifyCommand();
          execSync(`${cmd} update .`, { stdio: 'ignore', cwd: ROOT_DIR });
          lastGitHead = currentGitHead;
          forceReload = true;
        }
      }
    } catch (err) {
      // Ignora caso falhe a execução do Git ou do comando local
    }
  }

  if (loadedGraph && !forceReload) {
    return loadedGraph;
  }
  if (!fs.existsSync(GRAPH_PATH)) {
    return { nodes: [], edges: [] };
  }
  try {
    const raw = fs.readFileSync(GRAPH_PATH, 'utf8');
    loadedGraph = JSON.parse(raw);
    return loadedGraph;
  } catch (err) {
    return { nodes: [], edges: [], error: err.message };
  }
}

/**
 * Reads .agents/state.json safely (cached in memory)
 */
function loadState(forceReload = false) {
  if (loadedState && !forceReload) {
    return loadedState;
  }
  if (!fs.existsSync(STATE_PATH)) {
    return { active_persona: 'DEVELOPER', surgical_target: null };
  }
  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf8');
    loadedState = JSON.parse(raw);
    return loadedState;
  } catch (err) {
    return { active_persona: 'DEVELOPER', error: err.message };
  }
}

/**
 * Tool 1: Get direct dependencies and callers for a given file/node
 */
function handleGetDeps(targetFile) {
  const graph = loadGraph();
  if (!targetFile) {
    return { error: 'targetFile argument is required' };
  }

  const normalizedTarget = path.normalize(targetFile).replace(/\\/g, '/');

  const matchedNodes = (graph.nodes || []).filter(n => {
    const nodeName = (n.name || n.id || '').replace(/\\/g, '/');
    return nodeName.includes(normalizedTarget) || normalizedTarget.includes(nodeName);
  });

  if (matchedNodes.length === 0) {
    return {
      target: targetFile,
      found: false,
      message: 'Node not found in graphify-out/graph.json. Run synapse init or graphify first.'
    };
  }

  const matchedIds = new Set(matchedNodes.map(n => n.id || n.name));

  const dependencies = [];
  const callers = [];

  (graph.edges || []).forEach(edge => {
    if (matchedIds.has(edge.source)) {
      dependencies.push(edge.target);
    }
    if (matchedIds.has(edge.target)) {
      callers.push(edge.source);
    }
  });

  return {
    target: targetFile,
    found: true,
    nodesCount: matchedNodes.length,
    dependencies: Array.from(new Set(dependencies)),
    callers: Array.from(new Set(callers))
  };
}

/**
 * Tool 2: Get impact radius / test files for a changed file
 */
function handleGetImpactedTests(targetFile) {
  const deps = handleGetDeps(targetFile);
  if (!deps.found) {
    return deps;
  }

  const testFiles = (deps.callers || []).filter(c => c.includes('test') || c.includes('spec'));

  return {
    target: targetFile,
    impactedCallersCount: deps.callers.length,
    relatedTestFiles: testFiles.length > 0 ? testFiles : [`tests/${path.basename(targetFile, path.extname(targetFile))}.test.js`]
  };
}

/**
 * Tool 3: Check for circular dependencies in graph
 */
function handleCheckCircular() {
  const graph = loadGraph();
  const adj = {};

  (graph.nodes || []).forEach(n => {
    adj[n.id || n.name] = [];
  });

  (graph.edges || []).forEach(e => {
    if (adj[e.source]) {
      adj[e.source].push(e.target);
    }
  });

  const visited = {};
  const recStack = {};
  const cycles = [];

  function isCyclic(node, pathArr) {
    visited[node] = true;
    recStack[node] = true;
    pathArr.push(node);

    const neighbors = adj[node] || [];
    for (const neighbor of neighbors) {
      if (!visited[neighbor]) {
        if (isCyclic(neighbor, pathArr)) return true;
      } else if (recStack[neighbor]) {
        cycles.push([...pathArr, neighbor]);
        return true;
      }
    }

    recStack[node] = false;
    pathArr.pop();
    return false;
  }

  Object.keys(adj).forEach(node => {
    if (!visited[node]) {
      isCyclic(node, []);
    }
  });

  return {
    hasCircular: cycles.length > 0,
    cycleCount: cycles.length,
    detectedCycles: cycles.slice(0, 5)
  };
}

/**
 * Tool 4: Get TDD status from state.json
 */
function handleGetTddStatus() {
  const state = loadState();
  const tddValid = state.validation_status ? state.validation_status.gears_validated : false;
  return {
    active_persona: state.active_persona || 'DEVELOPER',
    surgical_target: state.surgical_target || null,
    tdd_valid: tddValid,
    last_updated: state.last_updated || new Date().toISOString()
  };
}

/**
 * Tool 5: Shift Persona
 */
function handleShiftPersona(activePersona) {
  const validPersonas = ['PM', 'ARCHITECT', 'DEVELOPER', 'QA', 'BOSS'];
  const newPersona = (activePersona || '').toUpperCase();
  if (!validPersonas.includes(newPersona)) {
    return { success: false, error: `Invalid persona '${activePersona}'. Valid: ${validPersonas.join(', ')}` };
  }
  const state = loadState();
  state.active_persona = newPersona;
  delete state.persona;
  state.last_updated = new Date().toISOString();
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  loadedState = state;
  return { success: true, active_persona: newPersona, timestamp: state.last_updated };
}

/**
 * Tool 6: Set Surgical Target
 */
function handleSetTarget(filePath, startLine, endLine) {
  if (!filePath) {
    return { success: false, error: 'filePath argument is required' };
  }
  const state = loadState();
  state.surgical_target = {
    file_path: filePath,
    line_range_start: startLine || 0,
    line_range_end: endLine || 0
  };
  delete state.target;
  state.last_updated = new Date().toISOString();
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  loadedState = state;
  return { success: true, surgical_target: state.surgical_target };
}

/**
 * Tool 7: Generate Audit Tables for Walkthrough
 */
function handleGenerateAuditTables(activePersona, skillsUsed = []) {
  const persona = activePersona || loadState().active_persona || 'DEVELOPER';
  const skillsList = Array.isArray(skillsUsed) && skillsUsed.length > 0 
    ? skillsUsed.map(s => `| ${s} | Global / Local | Invocado durante a tarefa |`).join('\n')
    : '| Nenhum | N/A | Nenhuma skill invocada nesta execução |';

  const tablesMarkdown = `## 🤖 Agentes Utilizados & Skills Invocadas

### 🎭 Agentes Mobilizados (Personas)
| Agente / Persona | Papel Desempenhado | Fase da Tarefa |
| :--- | :--- | :--- |
| **${persona}** | Execução e governança da tarefa | Fase Ativa |

### 🛠️ Skills Invocadas (Globais, Locais e Offline)
| Nome da Skill | Tipo de Escopo | Propósito da Invocação |
| :--- | :--- | :--- |
${skillsList}`;

  return { success: true, markdown: tablesMarkdown };
}

/**
 * Tool 8: Scan Secrets (OWASP)
 */
function handleScanSecrets(responseFormat = 'markdown') {
  const secretPatterns = [
    { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g },
    { name: 'GitHub Token', regex: /gh[pous]_[A-Za-z0-9_]{36,}/g },
    { name: 'Generic Secret/Key', regex: /(api_key|secret_key|private_key|jwt_secret)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/gi }
  ];

  const violations = [];
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (['node_modules', '.git', '.venv', 'graphify-out', 'dist', 'build'].includes(file)) continue;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (stat.isFile() && /\.(js|py|json|md|env|yml|yaml|ts)$/i.test(file)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          secretPatterns.forEach(p => {
            let match;
            while ((match = p.regex.exec(content)) !== null) {
              violations.push({
                file: path.relative(ROOT_DIR, fullPath),
                type: p.name,
                snippet: match[0].substring(0, 15) + '...'
              });
            }
          });
        } catch (e) {}
      }
    }
  }

  scanDir(ROOT_DIR);

  const rawResult = {
    clean: violations.length === 0,
    violationCount: violations.length,
    violations: violations.slice(0, 10)
  };

  if (responseFormat === 'json') {
    return rawResult;
  }

  if (rawResult.clean) {
    return `### 🛡️ OWASP Secret Scan Result\n\n✅ No secrets or credentials leaked in tracked codebase files. Context is clean!`;
  }

  const tableHeader = `### 🚨 OWASP Secret Scan Violations Detected!\n\n| File | Leak Type | Sneak Peek |\n| :--- | :--- | :--- |\n`;
  const tableRows = rawResult.violations.map(v => `| [${v.file}](file:///${path.resolve(ROOT_DIR, v.file).replace(/\\/g, '/')}) | **${v.type}** | \`${v.snippet}\` |`).join('\n');
  
  return `${tableHeader}${tableRows}\n\nTotal Violations: **${rawResult.violationCount}** (showing top 10). Please remove these hardcoded secrets immediately and use a \`.env\` file.`;
}

/**
 * Tool 9: Get Clean Git Diff
 */
function handleGetCleanDiff() {
  try {
    const rawDiff = execSync('git diff --cached --stat', { encoding: 'utf8', cwd: ROOT_DIR });
    const lines = rawDiff.trim().split('\n');
    const summary = lines.slice(-1)[0] || 'No changes staged';
    const changedFiles = lines.slice(0, -1).map(l => l.trim());
    return {
      staged: true,
      summary,
      changedFilesCount: changedFiles.length,
      changedFiles
    };
  } catch (err) {
    return { staged: false, error: err.message, changedFilesCount: 0, changedFiles: [] };
  }
}

/**
 * Tool 10: Search Skills JIT
 */
function handleSearchSkills(query) {
  const searchTerm = (query || '').toLowerCase();
  const searchDirs = [
    'C:\\AG SKILLS',
    path.join(os.homedir(), '.gemini', 'config', 'skills'),
    path.join(ROOT_DIR, '.agents', 'skills')
  ];

  const matchedSkills = [];

  searchDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    try {
      const entries = fs.readdirSync(dir);
      entries.forEach(entry => {
        const skillPath = path.join(dir, entry);
        const manifest = path.join(skillPath, 'SKILL.md');
        if (fs.existsSync(manifest)) {
          try {
            const content = fs.readFileSync(manifest, 'utf8');
            if (!searchTerm || entry.toLowerCase().includes(searchTerm) || content.toLowerCase().includes(searchTerm)) {
              matchedSkills.push({
                name: entry,
                path: manifest,
                scope: dir.includes('.agents') ? 'local' : 'global'
              });
            }
          } catch (e) {}
        }
      });
    } catch (e) {}
  });

  return {
    query: searchTerm,
    foundCount: matchedSkills.length,
    skills: matchedSkills
  };
}

/**
 * Tool 11: Context Health Check
 */
function handleContextHealthCheck(responseFormat = 'markdown') {
  const largeFiles = [];
  function checkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (['node_modules', '.git', '.venv', 'graphify-out', 'dist', 'build', 'package-lock.json'].includes(file)) continue;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        checkDir(fullPath);
      } else if (stat.isFile() && /\.(js|py|ts|json|md)$/i.test(file)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lineCount = content.split('\n').length;
          if (lineCount > 500) {
            largeFiles.push({
              file: path.relative(ROOT_DIR, fullPath),
              lineCount
            });
          }
        } catch (e) {}
      }
    }
  }

  checkDir(ROOT_DIR);

  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  const hasGitignore = fs.existsSync(gitignorePath);
  let gitignoreCompliant = false;
  if (hasGitignore) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    gitignoreCompliant = content.includes('.env') && content.includes('graphify-out');
  }

  const rawResult = {
    healthy: largeFiles.length === 0 && gitignoreCompliant,
    largeFilesCount: largeFiles.length,
    largeFiles: largeFiles.slice(0, 10),
    gitignoreStatus: {
      exists: hasGitignore,
      protectsEnvAndGraphify: gitignoreCompliant
    }
  };

  if (responseFormat === 'json') {
    return rawResult;
  }

  const statusStr = rawResult.healthy ? '🟢 healthy' : '🔴 unhealthy';
  const gitignoreCheck = rawResult.gitignoreStatus.exists 
    ? (rawResult.gitignoreStatus.protectsEnvAndGraphify ? '✅ Exists and blocks .env / graphify-out' : '⚠️ Exists but misses .env or graphify-out entries') 
    : '❌ Missing .gitignore!';

  let md = `### 🩺 Workspace Context Health Check: **${statusStr.toUpperCase()}**\n\n`;
  md += `- **.gitignore status**: ${gitignoreCheck}\n`;
  md += `- **Large files count (>500 lines)**: **${rawResult.largeFilesCount}**\n\n`;

  if (rawResult.largeFilesCount > 0) {
    md += `| File | Line Count |\n| :--- | :--- |\n`;
    rawResult.largeFiles.forEach(f => {
      md += `| [${f.file}](file:///${path.resolve(ROOT_DIR, f.file).replace(/\\/g, '/')}) | ${f.lineCount} lines |\n`;
    });
    md += `\n*Tip: Split these large files to keep agent context window load to a minimum.*`;
  } else {
    md += `✅ All source files are under 500 lines. Clean context chunking!`;
  }

  return md;
}

/**
 * Tool 12 & 13: Hardware Status & Select Device
 */
function handleHardwareStatus() {
  return getHardwareStatus('auto', 0.0);
}

function handleSelectDevice(workloadType, payloadSizeKb, override) {
  return getHardwareStatus(workloadType || 'auto', payloadSizeKb || 0.0, override);
}

/**
 * Resolves the global offline skills directory dynamically.
 */
function getGlobalSkillsDir() {
  const envPath = process.env.AG_SKILLS_PATH || process.env.AG_SKILLS_DIR;
  if (envPath) {
    return path.resolve(envPath);
  }
  if (os.platform() === 'win32') {
    return 'C:\\AG SKILLS';
  } else {
    return path.join(os.homedir(), 'ag-skills');
  }
}

/**
 * Resource Helper: List available skills in global offline skills directory
 */
function handleListResources() {
  const skillsDir = getGlobalSkillsDir();
  if (!fs.existsSync(skillsDir)) return [];
  try {
    const folders = fs.readdirSync(skillsDir);
    const resources = [];
    folders.forEach(folder => {
      const skillPath = path.join(skillsDir, folder);
      const manifest = path.join(skillPath, 'SKILL.md');
      if (fs.existsSync(manifest)) {
        resources.push({
          uri: `skills://${folder}`,
          name: folder,
          mimeType: 'text/markdown',
          description: `Dynamic offline skill ${folder} loaded from ${skillsDir}`
        });
      }
    });
    return resources;
  } catch (e) {
    return [];
  }
}

/**
 * Resource Helper: Minify markdown prompts to save tokens
 */
function minifySkillPrompt(content) {
  if (!content) return '';
  let cleaned = content.replace(/<!--[\s\S]*?-->/g, '');
  cleaned = cleaned.split('\n')
    .map(line => line.trimEnd())
    .filter((line, index, arr) => {
      if (line === '' && arr[index - 1] === '') return false;
      return true;
    })
    .join('\n');
  return cleaned;
}

/**
 * Resource Helper: Read specific skill content from global skills, config, or local workspace
 */
function handleReadResource(id, uri) {
  if (!uri || !uri.startsWith('skills://')) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32602, message: `Invalid resource URI: ${uri}` }
    };
  }

  const skillName = uri.replace('skills://', '');
  const searchPaths = [
    path.join(getGlobalSkillsDir(), skillName, 'SKILL.md'),
    path.join(os.homedir(), '.gemini', 'config', 'skills', skillName, 'SKILL.md'),
    path.join(ROOT_DIR, '.agents', 'skills', skillName, 'SKILL.md')
  ];

  let fileContent = null;
  for (const p of searchPaths) {
    if (fs.existsSync(p)) {
      try {
        fileContent = fs.readFileSync(p, 'utf8');
        break;
      } catch (e) {}
    }
  }

  if (fileContent === null) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32602, message: `Skill resource not found: ${skillName}` }
    };
  }

  const optimizedText = minifySkillPrompt(fileContent);

  return {
    jsonrpc: '2.0',
    id,
    result: {
      contents: [
        {
          uri,
          mimeType: 'text/markdown',
          text: optimizedText
        }
      ]
    }
  };
}

// Available Tool Definitions
const TOOLS = [
  {
    name: 'graphify_get_deps',
    description: 'Get direct dependencies and caller files for a specific node/file using AST topology.',
    inputSchema: {
      type: 'object',
      properties: { targetFile: { type: 'string', description: 'Relative file path or node name' } },
      required: ['targetFile']
    },
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: 'graphify_get_impacted_tests',
    description: 'Get tests and callers affected when a file is modified.',
    inputSchema: {
      type: 'object',
      properties: { targetFile: { type: 'string', description: 'Relative file path' } },
      required: ['targetFile']
    },
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: 'graphify_check_circular',
    description: 'Check AST graph for circular dependencies.',
    inputSchema: { type: 'object', properties: {} },
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: 'synapse_tdd_status',
    description: 'Get current TDD state, active persona, and surgical target.',
    inputSchema: { type: 'object', properties: {} },
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: 'synapse_shift_persona',
    description: 'Shift current active persona in .agents/state.json.',
    inputSchema: {
      type: 'object',
      properties: { active_persona: { type: 'string', description: 'Persona: PM, ARCHITECT, DEVELOPER, QA, BOSS' } },
      required: ['active_persona']
    },
    annotations: {
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: 'synapse_set_target',
    description: 'Set surgical target scope in .agents/state.json.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Relative path of the target file to edit' },
        line_range_start: { type: 'number', description: 'Starting line number of the edit scope (1-indexed)' },
        line_range_end: { type: 'number', description: 'Ending line number of the edit scope (1-indexed)' }
      },
      required: ['file_path']
    },
    annotations: {
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: 'synapse_generate_audit_tables',
    description: 'Generate markdown audit tables for walkthrough.md compliance.',
    inputSchema: {
      type: 'object',
      properties: {
        activePersona: { type: 'string', description: 'Persona name to display in the audit tables' },
        skillsUsed: { type: 'array', items: { type: 'string' }, description: 'Array of skill names invoked during execution' }
      }
    },
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: 'synapse_scan_secrets',
    description: 'Scan workspace for OWASP secret leaks (API keys, tokens, hardcoded passwords).',
    inputSchema: {
      type: 'object',
      properties: {
        response_format: {
          type: 'string',
          enum: ['markdown', 'json'],
          default: 'markdown',
          description: "Format of the response: 'markdown' for formatted text tables or 'json' for raw structured JSON"
        }
      }
    },
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: 'synapse_get_clean_diff',
    description: 'Get compact staged Git diff summary.',
    inputSchema: { type: 'object', properties: {} },
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: 'synapse_search_skills',
    description: 'Search offline SKILL.md manifests in C:\\AG SKILLS and local directory.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Search term or keyword' } }
    },
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: 'synapse_context_health_check',
    description: 'Check workspace context health (large files >500 lines and .gitignore status).',
    inputSchema: {
      type: 'object',
      properties: {
        response_format: {
          type: 'string',
          enum: ['markdown', 'json'],
          default: 'markdown',
          description: "Format of the response: 'markdown' for formatted text tables or 'json' for raw structured JSON"
        }
      }
    },
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: 'synapse_hardware_status',
    description: 'Get CPU/GPU hardware specs and active acceleration provider.',
    inputSchema: { type: 'object', properties: {} },
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: 'synapse_select_device',
    description: 'Select execution device (CPU vs GPU) dynamically based on workload and payload size.',
    inputSchema: {
      type: 'object',
      properties: {
        workloadType: { type: 'string', description: 'mcp_ipc, ast_query, batch_embeddings, neural_inference, auto' },
        payloadSizeKb: { type: 'number', description: 'Payload size in KB' },
        override: { type: 'string', description: 'Explicit override: cpu or gpu' }
      }
    },
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  }
];

/**
 * Handle JSON-RPC request over stdio
 */
function processRPCRequest(request) {
  const { id, method, params } = request;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: 'synapse-mcp-server', version: '2.0.0' }
      }
    };
  }

  if (method === 'notifications/initialized') {
    return null;
  }

  if (method === 'resources/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        resources: handleListResources()
      }
    };
  }

  if (method === 'resources/read') {
    const { uri } = params || {};
    return handleReadResource(id, uri);
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { tools: TOOLS }
    };
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params || {};
    let resultData = {};

    try {
      switch (name) {
        case 'graphify_get_deps':
          resultData = handleGetDeps(args?.targetFile);
          break;
        case 'graphify_get_impacted_tests':
          resultData = handleGetImpactedTests(args?.targetFile);
          break;
        case 'graphify_check_circular':
          resultData = handleCheckCircular();
          break;
        case 'synapse_tdd_status':
          resultData = handleGetTddStatus();
          break;
        case 'synapse_shift_persona':
          resultData = handleShiftPersona(args?.active_persona);
          break;
        case 'synapse_set_target':
          resultData = handleSetTarget(args?.file_path, args?.line_range_start, args?.line_range_end);
          break;
        case 'synapse_generate_audit_tables':
          resultData = handleGenerateAuditTables(args?.activePersona, args?.skillsUsed);
          break;
        case 'synapse_scan_secrets':
          resultData = handleScanSecrets(args?.response_format);
          break;
        case 'synapse_get_clean_diff':
          resultData = handleGetCleanDiff();
          break;
        case 'synapse_search_skills':
          resultData = handleSearchSkills(args?.query);
          break;
        case 'synapse_context_health_check':
          resultData = handleContextHealthCheck(args?.response_format);
          break;
        case 'synapse_hardware_status':
          resultData = handleHardwareStatus();
          break;
        case 'synapse_select_device':
          resultData = handleSelectDevice(args?.workloadType, args?.payloadSizeKb, args?.override);
          break;
        default:
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Tool not found: ${name}` }
          };
      }
    } catch (err) {
      resultData = { success: false, error: err.message };
    }

    const isStringResult = typeof resultData === 'string';
    const isError = resultData && (resultData.error !== undefined || resultData.success === false);
    
    let responseText = '';
    if (isError) {
      if (args?.response_format === 'json') {
        responseText = JSON.stringify(resultData);
      } else {
        responseText = resultData.error ? `Error: ${resultData.error}` : 'Error: Operation failed';
      }
    } else if (isStringResult) {
      responseText = resultData;
    } else {
      responseText = JSON.stringify(resultData);
    }

    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: [
          {
            type: 'text',
            text: responseText
          }
        ],
        ...(isError ? { isError: true } : {})
      }
    };
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` }
  };
}

/**
 * Start Stdio JSON-RPC Listener
 */
function startServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', line => {
    if (!line.trim()) return;
    try {
      const request = JSON.parse(line);
      const response = processRPCRequest(request);
      if (response) {
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    } catch (err) {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: `Parse error: ${err.message}` }
        }) + '\n'
      );
    }
  });
}

// Export internal functions for direct unit testing & benchmarking
module.exports = {
  processRPCRequest,
  handleGetDeps,
  handleGetImpactedTests,
  handleCheckCircular,
  handleGetTddStatus,
  handleShiftPersona,
  handleSetTarget,
  handleGenerateAuditTables,
  handleScanSecrets,
  handleGetCleanDiff,
  handleSearchSkills,
  handleContextHealthCheck,
  handleHardwareStatus,
  handleSelectDevice,
  handleListResources,
  minifySkillPrompt,
  handleReadResource,
  TOOLS
};

if (require.main === module) {
  startServer();
}
