#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { execSync, fork } = require('child_process');

const program = new Command();

program
  .name('synapse')
  .description('Synapse Engine CLI - Governance Management, TDD Harness & Offline Skills')
  .version('2.0.0');

// Localização dos templates dentro do pacote synapse-engine instalado
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const CORE_AGENTS_DIR = path.resolve(__dirname, '../core/agents');

// --- FUNÇÕES AUXILIARES DE SEGURANÇA E ESCALA DO HARNESS ---

function backupFileSafe(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      const date = new Date();
      const pad = num => String(num).padStart(2, '0');
      const timestamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
      const backupPath = `${filePath}.bak_${timestamp}`;
      fs.copyFileSync(filePath, backupPath);
      console.log(`🔒 Backup de segurança criado: ${path.basename(backupPath)}`);
    } catch (e) {
      console.warn(`⚠️ Warning: Falha ao criar backup do arquivo ${path.basename(filePath)}: ${e.message}`);
    }
  }
}

function parseXmlRules(content) {
  const rules = {};
  if (!content) return rules;
  const regex = /<RULE\[([a-zA-Z0-9_\-]+)\]>([\s\S]*?)<\/RULE\[\1\]>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    rules[match[1]] = match[2];
  }
  return rules;
}

function mergeRulesContent(existingContent, templateContent) {
  if (!existingContent) return templateContent;
  const existingRules = parseXmlRules(existingContent);
  const templateRules = parseXmlRules(templateContent);
  let updatedContent = existingContent;

  const defaultOldRules = {
    local_governance: `\n# Local Governance Rules\n- All codebase file changes must be validated by the \`synapse tdd\` gate tool.\n- All work progress and active persona state transitions are tracked in \`.agents/state.json\`.\n- Every task delivery must include a \`walkthrough.md\` in Portuguese containing the **Agent & Skill Trace** audit table matching the agents/personas used and the skills loaded from the repository/workspace catalog.\n`,
    bmad_core: `\n# BMAD Core Methodology (Global AI Agent Rule)\n- Zero-Pollution: Your primary source of truth is the project's documentation. Do NOT rely on ephemeral chat history.\n- Read Before Coding: Before altering source code, you MUST actively search for and read the relevant specifications.\n- The Bilingual Rule: Chat with USER, walkthrough.md, implementation_plan.md in Portuguese (PT-BR). Code and everything else in English (EN-US).\n- Privacy & Security: NEVER hardcode API keys, passwords, or tokens in logs or code. All secrets reside in .env files.\n- Persona Shift Loop: PM -> Architect -> Developer -> QA using state.json local telemetry.\n`,
    bmad_jit_skills_protocol: `\n# Protocolo JIT-Skills (Seleção Inteligente de Habilidades Offline)\nO agente deve operar sob o seguinte fluxo cognitivo em cada início de conversa ou nova tarefa complexa:\n1. Diagnóstico Cognitivo: Analisar se a tarefa envolve planejamento, código, testes, etc.\n2. Consulta ao Catálogo: Consultar o catálogo mestre de indexação utilizando a ferramenta correspondente.\n3. Carregamento Offline: Ler o arquivo SKILL.md correspondente de C:\\ag-skills\\<nome-da-skill>\\SKILL.md.\n4. Transparência: Notificar o usuário sobre quais habilidades offline foram incorporadas.\n`
  };

  for (const [ruleName, ruleBody] of Object.entries(templateRules)) {
    const tagStart = `<RULE[${ruleName}]>`;
    const tagEnd = `</RULE[${ruleName}]>`;

    if (existingRules[ruleName] !== undefined) {
      const userBody = existingRules[ruleName];
      const oldDefault = defaultOldRules[ruleName] || "";

      const isModified = userBody.trim() !== oldDefault.trim();
      const isAlreadyNew = userBody.trim() === ruleBody.trim();

      if (isModified && !isAlreadyNew) {
        console.log(`⚠️  Warning: A regra '${ruleName}' possui customizações manuais. Sobrescrita evitada para este bloco.`);
      } else if (!isAlreadyNew) {
        const ruleRegex = new RegExp(`<RULE\\[${ruleName}\\]>([\\s\\S]*?)<\/RULE\\[${ruleName}\\]>`, 'g');
        updatedContent = updatedContent.replace(ruleRegex, `${tagStart}${ruleBody}${tagEnd}`);
        console.log(`🔄 Regra padrão atualizada com sucesso: '${ruleName}'`);
      }
    } else {
      updatedContent = updatedContent.trim() + `\n\n${tagStart}${ruleBody}${tagEnd}\n`;
      console.log(`➕ Novo bloco de regra injetado: '${ruleName}'`);
    }
  }

  return updatedContent;
}

function createJunctionLink(target, linkPath) {
  if (fs.existsSync(linkPath)) {
    try {
      const stats = fs.lstatSync(linkPath);
      if (stats.isSymbolicLink() || stats.isDirectory()) {
        return;
      }
    } catch (e) {}
  }
  try {
    fs.symlinkSync(target, linkPath, 'junction');
    console.log(`✅ Directory Junction link criado: ${path.basename(linkPath)} -> ${path.basename(target)}`);
  } catch (err) {
    console.warn(`⚠️ Warning: Falha ao criar Directory Junction link: ${err.message}`);
  }
}

program
  .command('init')
  .option('-p, --preset <type>', 'Modular preset to install: quota | mcp | tdd | full', 'full')
  .description('Initializes Synapse Engine framework (Modular presets: quota, mcp, tdd, or full)')
  .action((options) => {
    const preset = (options.preset || 'full').toLowerCase();
    console.log(`Initiating Synapse Engine initialization (Preset: '${preset}')...`);
    const projectDir = process.cwd();
    const projectName = path.basename(projectDir);
    const dateStr = new Date().toISOString().split('T')[0];

    // Helper: Ensure package.json exists and inject scripts
    function injectNpmScripts(scriptsObj) {
      const packageJsonPath = path.resolve(projectDir, 'package.json');
      let pkg = { name: projectName.toLowerCase(), version: "1.0.0", scripts: {} };
      if (fs.existsSync(packageJsonPath)) {
        try {
          pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          pkg.scripts = pkg.scripts || {};
        } catch (err) {
          console.warn('⚠️ Warning: Failed to parse package.json:', err.message);
        }
      }
      Object.assign(pkg.scripts, scriptsObj);
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf8');
      console.log('✅ Injected npm scripts into local package.json');
    }

    // =========================================================================
    // PRESET: QUOTA (Sliding-Window Rate Limit Guard & Dashboard)
    // =========================================================================
    if (preset === 'quota') {
      const agentsDir = path.resolve(projectDir, '.agents');
      fs.mkdirSync(agentsDir, { recursive: true });
      const stateFile = path.resolve(agentsDir, 'state.json');
      if (!fs.existsSync(stateFile)) {
        const stateObj = { project: projectName, initialized_at: dateStr, preset: 'quota', harness_mode: 'standalone' };
        fs.writeFileSync(stateFile, JSON.stringify(stateObj, null, 2), 'utf8');
      }
      injectNpmScripts({
        'quota:dashboard': 'synapse quota dashboard',
        'quota:status': 'synapse quota status',
        'quota:estimate': 'synapse quota estimate'
      });
      console.log('\n🎉 Synapse Quota Guard initialized successfully!');
      console.log('👉 Run "synapse quota dashboard" to launch your local real-time telemetry dashboard.');
      console.log('👉 Run "synapse quota status" to inspect active 60s/24h sliding windows.\n');
      return;
    }

    // =========================================================================
    // PRESET: MCP (AST Knowledge Graph & MCP Server for Cursor/Claude/VSCode)
    // =========================================================================
    if (preset === 'mcp') {
      const cursorDir = path.resolve(projectDir, '.cursor');
      const vscodeDir = path.resolve(projectDir, '.vscode');
      fs.mkdirSync(cursorDir, { recursive: true });
      fs.mkdirSync(vscodeDir, { recursive: true });

      const mcpConfig = {
        mcpServers: {
          "synapse-graphify": {
            command: "npx",
            args: ["-y", "@lugubo/synapse-engine", "mcp"]
          }
        }
      };

      const cursorMcpFile = path.resolve(cursorDir, 'mcp.json');
      if (!fs.existsSync(cursorMcpFile)) {
        fs.writeFileSync(cursorMcpFile, JSON.stringify(mcpConfig, null, 2), 'utf8');
        console.log('✅ Created .cursor/mcp.json for Cursor & Windsurf');
      }

      const vscodeMcpFile = path.resolve(vscodeDir, 'mcp.json');
      if (!fs.existsSync(vscodeMcpFile)) {
        fs.writeFileSync(vscodeMcpFile, JSON.stringify(mcpConfig, null, 2), 'utf8');
        console.log('✅ Created .vscode/mcp.json for VS Code');
      }

      injectNpmScripts({
        'harness:mcp': 'synapse mcp',
        'harness:graphify': 'synapse graphify'
      });
      console.log('\n🎉 Synapse MCP Server preset initialized successfully!');
      console.log('👉 For Cursor / Windsurf: .cursor/mcp.json is ready.');
      console.log('👉 For Claude Code: run "claude mcp add synapse-graphify -- npx -y @lugubo/synapse-engine mcp".\n');
      return;
    }

    // =========================================================================
    // PRESET: TDD (Deterministic Quality Gates & Pre-Commit Test Enforcement)
    // =========================================================================
    if (preset === 'tdd') {
      const agentsDir = path.resolve(projectDir, '.agents');
      fs.mkdirSync(agentsDir, { recursive: true });
      const stateFile = path.resolve(agentsDir, 'state.json');
      if (!fs.existsSync(stateFile)) {
        const stateObj = { project: projectName, initialized_at: dateStr, preset: 'tdd', harness_mode: 'standalone' };
        fs.writeFileSync(stateFile, JSON.stringify(stateObj, null, 2), 'utf8');
      }
      injectNpmScripts({
        'harness:tdd': 'synapse tdd'
      });
      console.log('\n🎉 Synapse TDD Quality Gate initialized successfully!');
      console.log('👉 Run "synapse tdd" to execute deterministic pre-commit code integrity verification.\n');
      return;
    }

    // =========================================================================
    // PRESET: FULL (Complete BMAD Lifecycle Governance Harness)
    // =========================================================================
    // 1. Criar pasta .agents/ e subpastas
    const agentsDir = path.resolve(projectDir, '.agents');
    const localAgentsDir = path.resolve(agentsDir, 'agents');
    fs.mkdirSync(localAgentsDir, { recursive: true });

    // 2. Injetar state.json se não existir, autodetectando harness_mode
    const stateFile = path.resolve(agentsDir, 'state.json');
    let mcpSupported = false;
    try {
      execSync('node --version', { stdio: 'ignore' });
      const homeDir = require('os').homedir();
      const mcpConfigPath = path.resolve(homeDir, '.gemini/antigravity-ide/mcp_config.json');
      const mcpConfigDir = path.dirname(mcpConfigPath);
      if (fs.existsSync(mcpConfigDir)) {
        mcpSupported = true;
      }
    } catch (e) {}

    const harnessMode = mcpSupported ? 'mcp' : 'standalone';

    if (!fs.existsSync(stateFile)) {
      const stateTemplatePath = path.resolve(TEMPLATES_DIR, 'state.template.json');
      let stateObj = { project: projectName, initialized_at: dateStr, harness_mode: harnessMode };
      if (fs.existsSync(stateTemplatePath)) {
        stateObj = JSON.parse(fs.readFileSync(stateTemplatePath, 'utf8'));
        stateObj.harness_mode = harnessMode;
      }
      fs.writeFileSync(stateFile, JSON.stringify(stateObj, null, 2), 'utf8');
      console.log(`✅ Created .agents/state.json in '${harnessMode}' mode`);
    } else {
      try {
        const stateObj = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        stateObj.harness_mode = harnessMode;
        fs.writeFileSync(stateFile, JSON.stringify(stateObj, null, 2), 'utf8');
        console.log(`✅ Updated .agents/state.json to '${harnessMode}' mode`);
      } catch (e) {
        console.log('[INFO] .agents/state.json already exists. Skipping.');
      }
    }

    // 3. Copiar as personas core de agents para .agents/agents/
    if (fs.existsSync(CORE_AGENTS_DIR)) {
      const files = fs.readdirSync(CORE_AGENTS_DIR);
      files.forEach(file => {
        fs.copyFileSync(path.resolve(CORE_AGENTS_DIR, file), path.resolve(localAgentsDir, file));
      });
      console.log('✅ Copied core personas to .agents/agents/');
    }

    // 4. Injetar GEMINI.md e AGENTS.md na raiz de forma idempotente e segura
    const geminiFile = path.resolve(projectDir, 'GEMINI.md');
    const geminiTemplatePath = path.resolve(TEMPLATES_DIR, 'GEMINI.template.md');
    if (fs.existsSync(geminiTemplatePath)) {
      if (!fs.existsSync(geminiFile)) {
        let content = fs.readFileSync(geminiTemplatePath, 'utf8');
        content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName).replace(/\{\{DATE\}\}/g, dateStr);
        fs.writeFileSync(geminiFile, content, 'utf8');
        console.log('✅ Created GEMINI.md (Antigravity Global Ruleset)');
      } else {
        console.log('[INFO] GEMINI.md already exists. Skipping creation to preserve your file.');
      }
    }

    const agentsFile = path.resolve(projectDir, 'AGENTS.md');
    const agentsTemplatePath = path.resolve(TEMPLATES_DIR, 'AGENTS.template.md');
    if (fs.existsSync(agentsTemplatePath)) {
      if (!fs.existsSync(agentsFile)) {
        let content = fs.readFileSync(agentsTemplatePath, 'utf8');
        content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
        fs.writeFileSync(agentsFile, content, 'utf8');
        console.log('✅ Created AGENTS.md');
      } else {
        console.log('[INFO] AGENTS.md already exists. Skipping creation to preserve your file.');
      }
    }

    // 5. Injetar scripts no package.json local
    injectNpmScripts({
      'harness:tdd': 'synapse tdd',
      'harness:status': 'synapse status',
      'harness:graphify': 'synapse graphify',
      'harness:mcp': 'synapse mcp',
      'harness:sync-memory': 'powershell -File ./scripts/sync-memory.ps1',
      'quota:dashboard': 'synapse quota dashboard',
      'quota:status': 'synapse quota status',
      'quota:estimate': 'synapse quota estimate'
    });

    // 6. Criar estrutura de documentação (00_docs/)
    const folders = ['01_prd', '02_tech_specs', '03_rules', '04_adrs'];
    folders.forEach(folder => {
      fs.mkdirSync(path.resolve(projectDir, '00_docs', folder), { recursive: true });
    });
    console.log('✅ Created 00_docs/ semantic folders');

    // Deploy do template do MADR
    const madrFile = path.resolve(projectDir, '00_docs/04_adrs/0001-template-madr.md');
    if (!fs.existsSync(madrFile)) {
      const madrTemplate = `---
status: Proposed
date: ${dateStr}
decision_maker: AI Agent & Tech Lead
---

# [Short Title of the Decision]

## Context and Problem Statement

[Describe the context and the problem you are solving...]

## Decision Outcome

* Chosen Option: [Option Name]
* Status: Proposed (Proposed | Accepted | Superseded)

### Consequences

* Good: [Positive impact...]
* Bad: [Negative tradeoffs...]
`;
      fs.writeFileSync(madrFile, madrTemplate, 'utf8');
      console.log('✅ Created MADR template in 00_docs/04_adrs/');
    }

    // 7. Verificar Graphify
    let graphifyInstalled = false;
    try {
      execSync('graphify --version', { stdio: 'ignore' });
      graphifyInstalled = true;
    } catch (e) {}

    const homeDir = require('os').homedir();
    const localBinGraphify = path.resolve(homeDir, '.local/bin', process.platform === 'win32' ? 'graphify.exe' : 'graphify');
    let graphifyCmd = 'graphify';
    if (!graphifyInstalled && fs.existsSync(localBinGraphify)) {
      graphifyCmd = localBinGraphify;
      graphifyInstalled = true;
    }

    if (!graphifyInstalled) {
      console.log('[WARN] Graphify CLI not found. Attempting install via pip...');
      try {
        execSync('pip install graphify', { stdio: 'inherit' });
        graphifyInstalled = true;
      } catch (err) {
        console.warn('⚠️ pip install failed.');
      }
    }

    if (graphifyInstalled) {
      console.log(`[INFO] Running first graphify update using cmd '${graphifyCmd}'...`);
      try {
        execSync(`"${graphifyCmd}" update .`, { stdio: 'inherit' });
        console.log('✅ Graphify mapping generated successfully.');
      } catch (e) {
        console.warn('⚠️ Graphify update run failed:', e.message);
      }
    }

    // Garantir graphify-out no .gitignore
    const gitignorePath = path.resolve(projectDir, '.gitignore');
    let gitignoreContent = '';
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }
    if (!gitignoreContent.includes('graphify-out')) {
      gitignoreContent += '\n# Graphify outputs\ngraphify-out/\n';
      fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
      console.log('✅ Added graphify-out/ to .gitignore');
    }

    // 8. Inicializar Camada de Memória Local (Obsidian Vault)
    console.log('📁 Setting up local declarative memory layer (Obsidian Vault)...');
    const vaultDir = path.resolve(projectDir, '.obsidian-vault');
    const permDir = path.resolve(vaultDir, 'permanent');
    const chatsDir = path.resolve(vaultDir, 'chats');

    fs.mkdirSync(permDir, { recursive: true });
    fs.mkdirSync(chatsDir, { recursive: true });

    const permReadme = path.resolve(permDir, 'README.md');
    if (!fs.existsSync(permReadme)) {
      fs.writeFileSync(permReadme, '# Permanent Notes\n\nThis directory contains immutable business rules, specifications, and long-term concepts.\n', 'utf8');
    }
    const chatsReadme = path.resolve(chatsDir, 'README.md');
    if (!fs.existsSync(chatsReadme)) {
      fs.writeFileSync(chatsReadme, '# Chat Logs & Session Memory\n\nThis directory holds Markdown summaries of development sessions to fight context amnesia.\n', 'utf8');
    }

    const linkPath = path.resolve(vaultDir, 'graphify-links');
    const targetPath = path.resolve(projectDir, 'graphify-out');
    if (fs.existsSync(targetPath)) {
      createJunctionLink(targetPath, linkPath);
    }

    const scriptsFolder = path.resolve(projectDir, 'scripts');
    fs.mkdirSync(scriptsFolder, { recursive: true });
    const syncScriptDest = path.resolve(scriptsFolder, 'sync-memory.ps1');
    const syncScriptTemplate = path.resolve(TEMPLATES_DIR, 'sync-memory.template.ps1');
    if (fs.existsSync(syncScriptTemplate) && !fs.existsSync(syncScriptDest)) {
      fs.copyFileSync(syncScriptTemplate, syncScriptDest);
      console.log('✅ Deployed sync-memory.ps1 automation script to ./scripts/');
    }

    if (!gitignoreContent.includes('.obsidian-vault/')) {
      gitignoreContent += '\n# Obsidian Vault (Local Persistent Memory)\n.obsidian-vault/\n';
      fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
      console.log('✅ Added .obsidian-vault/ to .gitignore');
    }

    console.log('🎉 Synapse Engine initialized successfully!');
  });

program
  .command('update')
  .description('Updates local Harness executables and core personas to latest version')
  .action(() => {
    console.log('Updating Synapse Engine local components...');
    const projectDir = process.cwd();
    const localAgentsDir = path.resolve(projectDir, '.agents/agents');
    
    if (!fs.existsSync(localAgentsDir)) {
      console.error('❌ Error: Synapse is not initialized in this project. Run "synapse init" first.');
      process.exit(1);
    }

    // 1. Copiar personas core atualizadas
    if (fs.existsSync(CORE_AGENTS_DIR)) {
      const files = fs.readdirSync(CORE_AGENTS_DIR);
      files.forEach(file => {
        fs.copyFileSync(path.resolve(CORE_AGENTS_DIR, file), path.resolve(localAgentsDir, file));
      });
      console.log('✅ Updated personas core files in .agents/agents/');
    }

    // 2. Realizar backup e atualização incremental e segura do AGENTS.md local
    const agentsFile = path.resolve(projectDir, 'AGENTS.md');
    const agentsTemplatePath = path.resolve(TEMPLATES_DIR, 'AGENTS.template.md');
    if (fs.existsSync(agentsFile) && fs.existsSync(agentsTemplatePath)) {
      backupFileSafe(agentsFile);
      const userContent = fs.readFileSync(agentsFile, 'utf8');
      const templateContent = fs.readFileSync(agentsTemplatePath, 'utf8');
      const mergedContent = mergeRulesContent(userContent, templateContent);
      fs.writeFileSync(agentsFile, mergedContent, 'utf8');
      console.log('✅ Audited and updated local AGENTS.md rules cleanly.');
    }

    // 3. Garantir infraestrutura física do Vault
    const vaultDir = path.resolve(projectDir, '.obsidian-vault');
    const permDir = path.resolve(vaultDir, 'permanent');
    const chatsDir = path.resolve(vaultDir, 'chats');
    fs.mkdirSync(permDir, { recursive: true });
    fs.mkdirSync(chatsDir, { recursive: true });

    // Junction do Graphify
    const linkPath = path.resolve(vaultDir, 'graphify-links');
    const targetPath = path.resolve(projectDir, 'graphify-out');
    if (fs.existsSync(targetPath)) {
      createJunctionLink(targetPath, linkPath);
    }

    // Garantir sync script local
    const scriptsFolder = path.resolve(projectDir, 'scripts');
    fs.mkdirSync(scriptsFolder, { recursive: true });
    const syncScriptDest = path.resolve(scriptsFolder, 'sync-memory.ps1');
    const syncScriptTemplate = path.resolve(TEMPLATES_DIR, 'sync-memory.template.ps1');
    if (fs.existsSync(syncScriptTemplate) && !fs.existsSync(syncScriptDest)) {
      fs.copyFileSync(syncScriptTemplate, syncScriptDest);
      console.log('✅ Deployed missing sync-memory.ps1 script.');
    }

    // Garantir package.json script e .gitignore
    const packageJsonPath = path.resolve(projectDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        pkg.scripts = pkg.scripts || {};
        if (!pkg.scripts['harness:sync-memory']) {
          pkg.scripts['harness:sync-memory'] = 'powershell -File ./scripts/sync-memory.ps1';
          fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf8');
          console.log('✅ Injected harness:sync-memory script to package.json');
        }
      } catch (e) {}
    }

    const gitignorePath = path.resolve(projectDir, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('.obsidian-vault/')) {
        gitignoreContent += '\n# Obsidian Vault (Local Persistent Memory)\n.obsidian-vault/\n';
        fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
        console.log('✅ Added .obsidian-vault/ to .gitignore');
      }
    }

    console.log('🎉 Synapse Engine local Harness updated successfully!');
  });

program
  .command('setup')
  .description('Configures global IDE governance and dependencies')
  .option('--global', 'Executa o setup global na pasta do usuário')
  .action((options) => {
    if (!options.global) {
      console.log('Please specify --global flag. Usage: synapse setup --global');
      process.exit(0);
    }

    console.log('Setting up global IDE configuration...');
    const homeDir = require('os').homedir();
    const geminiConfigDir = path.resolve(homeDir, '.gemini/config');
    fs.mkdirSync(geminiConfigDir, { recursive: true });

    // 1. Injetar/atualizar AGENTS.md global de forma segura
    const globalAgentsFile = path.resolve(geminiConfigDir, 'AGENTS.md');
    const bmadGlobalRules = `# 🌐 Antigravity Global Agent Rules
This file contains the global rules and behavioral guidelines for the Antigravity AI Agent.

<RULE[bmad_core]>
# BMAD Core Methodology (Global AI Agent Rule)
- Zero-Pollution: Your primary source of truth is the project's documentation. Do NOT rely on ephemeral chat history.
- Read Before Coding: Before altering source code, you MUST actively search for and read the relevant specifications.
- The Bilingual Rule: Chat with USER, walkthrough.md, implementation_plan.md in Portuguese (PT-BR). Code and everything else in English (EN-US).
- Privacy & Security: NEVER hardcode API keys, passwords, or tokens in logs or code. All secrets reside in .env files.
- Persona Shift Loop: PM -> Architect -> Developer -> QA using state.json local telemetry.
</RULE[bmad_core]>

<RULE[bmad_jit_skills_protocol]>
# Protocolo JIT-Skills (Seleção Inteligente de Habilidades Offline)
O agente deve operar sob o seguinte fluxo cognitivo em cada início de conversa ou nova tarefa complexa:
1. Diagnóstico Cognitivo: Analisar se a tarefa envolve planejamento, código, testes, etc.
2. Consulta ao Catálogo: Consultar o catálogo mestre de indexação utilizando a ferramenta correspondente.
3. Carregamento Offline: Ler o arquivo SKILL.md correspondente a partir do diretório de habilidades globais (ex: C:\\ag-skills\\<nome-da-skill>\\SKILL.md ou caminho configurado pela variável de ambiente AG_SKILLS_PATH).
4. Transparência: Notificar o usuário sobre quais habilidades offline foram incorporadas.
</RULE[bmad_jit_skills_protocol]>
`;
    if (fs.existsSync(globalAgentsFile)) {
      backupFileSafe(globalAgentsFile);
      const existingGlobal = fs.readFileSync(globalAgentsFile, 'utf8');
      const mergedGlobal = mergeRulesContent(existingGlobal, bmadGlobalRules);
      fs.writeFileSync(globalAgentsFile, mergedGlobal, 'utf8');
      console.log('✅ Audited and updated global AGENTS.md rules cleanly.');
    } else {
      fs.writeFileSync(globalAgentsFile, bmadGlobalRules, 'utf8');
      console.log('✅ Created global AGENTS.md rules in ' + globalAgentsFile);
    }

    // 2. Configurar skills.json global para registrar o diretório de skills globais
    const rawSkillsDir = process.env.AG_SKILLS_PATH || process.env.AG_SKILLS_DIR || 'C:\\ag-skills';
    const skillsDir = path.resolve(rawSkillsDir);
    const skillsJsonPath = path.resolve(geminiConfigDir, 'skills.json');
    let skillsJson = { entries: [] };
    if (fs.existsSync(skillsJsonPath)) {
      try {
        skillsJson = JSON.parse(fs.readFileSync(skillsJsonPath, 'utf8'));
      } catch (e) {
        console.warn('⚠️ Warning: Failed to parse global skills.json. Re-creating.');
      }
    }

    skillsJson.entries = skillsJson.entries || [];
    const normalizedTarget = skillsDir.replace(/\\/g, '/').toLowerCase();
    const hasPath = skillsJson.entries.some(entry => 
      entry && entry.path && path.resolve(entry.path).replace(/\\/g, '/').toLowerCase() === normalizedTarget
    );

    if (!hasPath) {
      skillsJson.entries.push({ path: skillsDir });
      fs.writeFileSync(skillsJsonPath, JSON.stringify(skillsJson, null, 2), 'utf8');
      console.log(`✅ Added ${skillsDir} registry to global skills.json configuration.`);
    } else {
      console.log(`[INFO] ${skillsDir} registry already exists in global skills.json. Skipping.`);
    }

    // 3. Configurar mcp_config.json global para registrar o Synapse MCP Server
    const geminiIdeDir = path.resolve(homeDir, '.gemini/antigravity-ide');
    fs.mkdirSync(geminiIdeDir, { recursive: true });
    const mcpConfigPath = path.resolve(geminiIdeDir, 'mcp_config.json');
    let mcpConfig = { mcpServers: {} };
    if (fs.existsSync(mcpConfigPath)) {
      try {
        mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
      } catch (e) {
        console.warn('⚠️ Warning: Failed to parse global mcp_config.json. Re-creating.');
      }
    }
    mcpConfig.mcpServers = mcpConfig.mcpServers || {};
    const mcpServerScript = path.resolve(__dirname, 'synapse-mcp-server.js');
    mcpConfig.mcpServers['synapse-graphify'] = {
      command: 'node',
      args: [mcpServerScript]
    };
    fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2), 'utf8');
    console.log('✅ Added synapse-graphify MCP server to global mcp_config.json.');

    console.log('🎉 Global IDE configurations successfully deployed!');
  });

program
  .command('mcp [action]')
  .description('Starts local stdio MCP server or runs token economy benchmark suite (start | benchmark)')
  .action((action) => {
    const mcpScript = path.resolve(__dirname, 'synapse-mcp-server.js');
    if (action === 'benchmark') {
      console.log('🚀 Running Synapse Engine MCP Token Savings Benchmark...');
      const benchmarkTest = path.resolve(__dirname, '../tests/synapse_mcp_benchmark.test.js');
      const relPath = path.relative(process.cwd(), benchmarkTest).replace(/\\/g, '/');
      try {
        execSync(`npx jest "${relPath}"`, { stdio: 'inherit' });
      } catch (e) {
        console.error('❌ Benchmark execution failed:', e.message);
      }
    } else {
      // Padrão: Inicia o servidor stdio
      try {
        fork(mcpScript, [], { stdio: 'inherit' });
      } catch (err) {
        console.error('❌ Failed to start Synapse MCP Server:', err.message);
      }
    }
  });


program
  .command('status')
  .description('Query or update local sprinters state variables')
  .allowUnknownOption()
  .action(() => {
    // Repassa os argumentos para state-manager.js
    const scriptPath = path.resolve(__dirname, 'state-manager.js');
    const args = process.argv.slice(3); // Pega argumentos depois do comando 'status'
    try {
      fork(scriptPath, args, { stdio: 'inherit' });
    } catch (err) {
      console.error('❌ Failed to run state manager:', err.message);
    }
  });

program
  .command('tdd')
  .description('Run local TDD validations for staged files')
  .action(() => {
    const scriptPath = path.resolve(__dirname, 'tdd-gate.js');
    try {
      fork(scriptPath, [], { stdio: 'inherit' });
    } catch (err) {
      console.error('❌ Failed to run TDD Gate:', err.message);
    }
  });

program
  .command('hardware')
  .description('Displays diagnostics and dynamic hardware routing (CPU vs GPU)')
  .option('-w, --workload <type>', 'Tipo de carga de trabalho (mcp_ipc, ast_query, batch_embeddings, neural_inference, auto)', 'auto')
  .option('-s, --size <kb>', 'Tamanho do payload em KB', parseFloat, 0.0)
  .option('-o, --override <device>', 'Sobrescrita manual (cpu ou gpu)', null)
  .action((options) => {
    const { getHardwareStatus } = require('./hardware-selector');
    const result = getHardwareStatus(options.workload, options.size, options.override);
    console.log('⚡ Synapse Engine - Hardware Diagnostics & Selection:');
    console.log(JSON.stringify(result, null, 2));
  });

const quotaCmd = program
  .command('quota')
  .description('AI Model Rate Limit Tracking, Quota Control & Task Weight Estimation');

quotaCmd
  .command('status')
  .description('Displays model rate limits, GCP status, and sliding window quota usage')
  .action(() => {
    const os = require('os');
    const pythonScript = path.resolve(__dirname, '../src/quota_manager/cli.py');
    const localVenvPython = os.platform() === 'win32'
      ? path.resolve(__dirname, '../.venv/Scripts/python.exe')
      : path.resolve(__dirname, '../.venv/bin/python');
    const pythonCmd = fs.existsSync(localVenvPython) ? localVenvPython : (process.platform === 'win32' ? 'python' : 'python3');
    try {
      execSync(`"${pythonCmd}" "${pythonScript}" status`, { stdio: 'inherit' });
    } catch (e) {
      console.error('❌ Error executing quota status:', e.message);
    }
  });

quotaCmd
  .command('estimate <task>')
  .description('Estimates task complexity weight (Score 1-10) and recommends an AI model')
  .option('-p, --persona <name>', 'Active BMAD persona', 'DEVELOPER')
  .option('-n, --nodes <count>', 'AST connected nodes count', parseInt, 0)
  .action((task, options) => {
    const os = require('os');
    const pythonScript = path.resolve(__dirname, '../src/quota_manager/cli.py');
    const localVenvPython = os.platform() === 'win32'
      ? path.resolve(__dirname, '../.venv/Scripts/python.exe')
      : path.resolve(__dirname, '../.venv/bin/python');
    const pythonCmd = fs.existsSync(localVenvPython) ? localVenvPython : (process.platform === 'win32' ? 'python' : 'python3');
    try {
      execSync(`"${pythonCmd}" "${pythonScript}" estimate "${task.replace(/"/g, '\\"')}" --persona ${options.persona} --nodes ${options.nodes}`, { stdio: 'inherit' });
    } catch (e) {
      console.error('❌ Error executing task weight estimate:', e.message);
    }
  });

quotaCmd
  .command('dashboard')
  .description('Launches local HTTP server and automatically opens Quota Dashboard in browser')
  .option('--port <number>', 'Server port', parseInt, 8050)
  .action((options) => {
    const os = require('os');
    const pythonScript = path.resolve(__dirname, '../src/quota_manager/cli.py');
    const localVenvPython = os.platform() === 'win32'
      ? path.resolve(__dirname, '../.venv/Scripts/python.exe')
      : path.resolve(__dirname, '../.venv/bin/python');
    const pythonCmd = fs.existsSync(localVenvPython) ? localVenvPython : (process.platform === 'win32' ? 'python' : 'python3');
    try {
      console.log(`🚀 Iniciando Quota Dashboard na porta ${options.port}...`);
      execSync(`"${pythonCmd}" "${pythonScript}" dashboard --port ${options.port}`, { stdio: 'inherit' });
    } catch (e) {
      console.error('❌ Error launching dashboard:', e.message);
    }
  });

program
  .command('graphify')
  .description('Executes incremental AST dependency graph update via Graphify')
  .action(() => {
    const runner = path.resolve(__dirname, 'harness-graphify.js');
    try {
      fork(runner, [], { stdio: 'inherit' });
    } catch (err) {
      console.error('❌ Failed to execute graphify update runner:', err.message);
    }
  });

program
  .command('doctor')
  .description('Executes full environment autodiagnostics for Synapse Engine')
  .action(() => {
    console.log('🩺 Executing full Synapse Engine autodiagnostics...\n');
    const os = require('os');
    const homeDir = os.homedir();
    const cwd = process.cwd();

    // 1. Graphify CLI Check
    let graphifyOk = false;
    let graphifyMsg = '';
    try {
      execSync('graphify --version', { stdio: 'ignore' });
      graphifyOk = true;
      graphifyMsg = 'Globally installed on PATH';
    } catch (e) {
      const localBinGraphify = path.join(homeDir, '.local', 'bin', os.platform() === 'win32' ? 'graphify.exe' : 'graphify');
      if (fs.existsSync(localBinGraphify)) {
        graphifyOk = true;
        graphifyMsg = `Fallback binary found at ${localBinGraphify}`;
      } else {
        graphifyMsg = 'Not found. Please run: pip install graphify or uv tool install graphifyy';
      }
    }

    // 2. MCP Server Configuration Check
    const mcpConfigPath = path.join(homeDir, '.gemini', 'antigravity-ide', 'mcp_config.json');
    let mcpOk = false;
    let mcpMsg = '';
    if (fs.existsSync(mcpConfigPath)) {
      try {
        const mcpConf = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
        if (mcpConf.mcpServers && mcpConf.mcpServers['synapse-graphify']) {
          mcpOk = true;
          mcpMsg = 'synapse-graphify server registered in mcp_config.json';
        } else {
          mcpMsg = 'mcp_config.json exists, but synapse-graphify server is not registered. Run: synapse setup --global';
        }
      } catch (e) {
        mcpMsg = `Error reading mcp_config.json: ${e.message}`;
      }
    } else {
      mcpMsg = `mcp_config.json file not found at ${mcpConfigPath}. Run: synapse setup --global`;
    }

    // 3. State & Persona Telemetry Check
    const statePath = path.join(cwd, '.agents', 'state.json');
    const stateOk = fs.existsSync(statePath);
    const stateMsg = stateOk ? 'Present and tracking local persona state' : 'Missing. Run: synapse init';

    // 4. Obsidian Vault Check
    const vaultPath = path.join(cwd, '.obsidian-vault');
    const vaultOk = fs.existsSync(vaultPath);
    const vaultMsg = vaultOk ? 'Local memory structure configured' : 'Missing. Run: synapse init or synapse update';

    // 5. AST Topology Check
    const graphPath = path.join(cwd, 'graphify-out', 'graph.json');
    const graphOk = fs.existsSync(graphPath);
    const graphMsg = graphOk ? 'AST map generated at graphify-out/graph.json' : 'Unavailable. Run: synapse graphify';

    console.table([
      { Component: 'Graphify CLI', Status: graphifyOk ? '🟢 OK' : '🔴 Failed', Detail: graphifyMsg },
      { Component: 'IDE MCP Server', Status: mcpOk ? '🟢 OK' : '🟡 Alert', Detail: mcpMsg },
      { Component: 'Local State (.agents/state.json)', Status: stateOk ? '🟢 OK' : '🔴 Failed', Detail: stateMsg },
      { Component: 'Obsidian Vault (.obsidian-vault)', Status: vaultOk ? '🟢 OK' : '🟡 Alert', Detail: vaultMsg },
      { Component: 'AST Graph (graphify-out)', Status: graphOk ? '🟢 OK' : '🟡 Alert', Detail: graphMsg }
    ]);

    const allOk = graphifyOk && mcpOk && stateOk && vaultOk && graphOk;
    console.log(`\nFinal Diagnosis: ${allOk ? '🎉 Environment 100% operational!' : '⚠️ Alerts detected. Check details above.'}\n`);
  });

program.parse(process.argv);



