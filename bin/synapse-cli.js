#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { execSync, fork } = require('child_process');

const program = new Command();

program
  .name('synapse')
  .description('Synapse Engine CLI - Gestão de Governança, TDD Harness e Skills Offline')
  .version('2.0.0');

// Localização dos templates dentro do pacote synapse-engine instalado
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const CORE_AGENTS_DIR = path.resolve(__dirname, '../core/agents');

program
  .command('init')
  .description('Inicializa o framework Synapse Engine no projeto atual')
  .action(() => {
    console.log('Initiating Synapse Engine initialization in current directory...');
    const projectDir = process.cwd();
    const projectName = path.basename(projectDir);
    const dateStr = new Date().toISOString().split('T')[0];

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
      const stateObj = JSON.parse(fs.readFileSync(stateTemplatePath, 'utf8'));
      stateObj.harness_mode = harnessMode;
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

    // 4. Injetar CLAUDE.md e AGENTS.md na raiz do projeto consumidor
    const claudeFile = path.resolve(projectDir, 'CLAUDE.md');
    const claudeTemplatePath = path.resolve(TEMPLATES_DIR, 'CLAUDE.template.md');
    if (fs.existsSync(claudeTemplatePath)) {
      let content = fs.readFileSync(claudeTemplatePath, 'utf8');
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName).replace(/\{\{DATE\}\}/g, dateStr);
      fs.writeFileSync(claudeFile, content, 'utf8');
      console.log('✅ Created CLAUDE.md');
    }

    const agentsFile = path.resolve(projectDir, 'AGENTS.md');
    const agentsTemplatePath = path.resolve(TEMPLATES_DIR, 'AGENTS.template.md');
    if (fs.existsSync(agentsTemplatePath)) {
      let content = fs.readFileSync(agentsTemplatePath, 'utf8');
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
      fs.writeFileSync(agentsFile, content, 'utf8');
      console.log('✅ Created AGENTS.md');
    }

    // 5. Injetar scripts no package.json local
    const packageJsonPath = path.resolve(projectDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts['harness:tdd'] = 'synapse tdd';
        pkg.scripts['harness:status'] = 'synapse status';
        pkg.scripts['harness:graphify'] = 'graphify update .';
        fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf8');
        console.log('✅ Injected npm scripts into local package.json');
      } catch (err) {
        console.warn('⚠️ Warning: Failed to parse or write package.json:', err.message);
      }
    } else {
      // Se não existir package.json, criar um básico
      const basePkg = {
        name: projectName.toLowerCase(),
        version: "1.0.0",
        scripts: {
          "harness:tdd": "synapse tdd",
          "harness:status": "synapse status",
          "harness:graphify": "graphify update ."
        }
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(basePkg, null, 2), 'utf8');
      console.log('✅ Generated new package.json with Synapse scripts');
    }

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

    // Check local bin fallback
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
        console.warn('⚠️ pip install failed. Attempting install via uv...');
        try {
          const uvCmd = process.platform === 'win32' ? '.venv\\Scripts\\uv.exe' : '.venv/bin/uv';
          if (fs.existsSync(path.resolve(projectDir, uvCmd))) {
            execSync(`"${path.resolve(projectDir, uvCmd)}" tool install graphifyy`, { stdio: 'inherit' });
            if (fs.existsSync(localBinGraphify)) {
              graphifyCmd = localBinGraphify;
              graphifyInstalled = true;
            }
          }
        } catch (ex) {
          console.error('❌ Failed to install graphify via uv. Please install manually using: uv tool install graphifyy');
        }
      }
    }

    // Rodar primeiro map
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
      const entry = '\n# Graphify outputs\ngraphify-out/\n';
      fs.writeFileSync(gitignorePath, gitignoreContent + entry, 'utf8');
      console.log('✅ Added graphify-out/ to .gitignore');
    }

    console.log('🎉 Synapse Engine initialized successfully!');
  });

program
  .command('update')
  .description('Atualiza os executáveis e personas do Harness local para a versão mais recente')
  .action(() => {
    console.log('Updating Synapse Engine local components...');
    const projectDir = process.cwd();
    const localAgentsDir = path.resolve(projectDir, '.agents/agents');
    
    if (!fs.existsSync(localAgentsDir)) {
      console.error('❌ Error: Synapse is not initialized in this project. Run "synapse init" first.');
      process.exit(1);
    }

    // Copiar personas core atualizadas
    if (fs.existsSync(CORE_AGENTS_DIR)) {
      const files = fs.readdirSync(CORE_AGENTS_DIR);
      files.forEach(file => {
        fs.copyFileSync(path.resolve(CORE_AGENTS_DIR, file), path.resolve(localAgentsDir, file));
      });
      console.log('✅ Updated personas core files in .agents/agents/');
    }

    console.log('🎉 Synapse Engine local Harness updated successfully!');
  });

program
  .command('setup')
  .description('Configura as dependências globais e a governança global na IDE')
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

    // 1. Injetar/atualizar AGENTS.md global
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
3. Carregamento Offline: Ler o arquivo SKILL.md correspondente de C:\\AG SKILLS\\<nome-da-skill>\\SKILL.md.
4. Transparência: Notificar o usuário sobre quais habilidades offline foram incorporadas.
</RULE[bmad_jit_skills_protocol]>
`;
    fs.writeFileSync(globalAgentsFile, bmadGlobalRules, 'utf8');
    console.log('✅ Updated global AGENTS.md rules in ' + globalAgentsFile);

    // 2. Configurar skills.json global para registrar C:\AG SKILLS
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
    const hasPath = skillsJson.entries.some(entry => 
      entry && entry.path && entry.path.replace(/\\/g, '/').toLowerCase() === 'c:/ag skills'
    );

    if (!hasPath) {
      skillsJson.entries.push({ path: 'C:\\AG SKILLS' });
      fs.writeFileSync(skillsJsonPath, JSON.stringify(skillsJson, null, 2), 'utf8');
      console.log('✅ Added C:\\AG SKILLS registry to global skills.json configuration.');
    } else {
      console.log('[INFO] C:\\AG SKILLS registry already exists in global skills.json. Skipping.');
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
  .description('Inicia o servidor MCP stdio local ou roda o benchmark de economia de tokens (start | benchmark)')
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
  .description('Exibe o diagnóstico e a seleção dinâmica de hardware (CPU vs. GPU)')
  .option('-w, --workload <type>', 'Tipo de carga de trabalho (mcp_ipc, ast_query, batch_embeddings, neural_inference, auto)', 'auto')
  .option('-s, --size <kb>', 'Tamanho do payload em KB', parseFloat, 0.0)
  .option('-o, --override <device>', 'Sobrescrita manual (cpu ou gpu)', null)
  .action((options) => {
    const { getHardwareStatus } = require('./hardware-selector');
    const result = getHardwareStatus(options.workload, options.size, options.override);
    console.log('⚡ Synapse Engine - Diagnóstico & Seleção Dinâmica de Hardware:');
    console.log(JSON.stringify(result, null, 2));
  });

program.parse(process.argv);


