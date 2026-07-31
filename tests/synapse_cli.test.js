const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('Synapse Engine CLI Integration Tests', () => {
  const cliPath = path.resolve(__dirname, '../bin/synapse-cli.js');
  const testProjectDir = path.resolve(__dirname, 'temp_test_project');

  beforeEach(() => {
    // Garantir que a pasta de testes temporária esteja limpa antes de cada teste
    if (fs.existsSync(testProjectDir)) {
      fs.rmSync(testProjectDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testProjectDir, { recursive: true });
  });

  afterAll(() => {
    // Limpeza final das pastas temporárias
    if (fs.existsSync(testProjectDir)) {
      fs.rmSync(testProjectDir, { recursive: true, force: true });
    }
  });

  test('should successfully initialize a new project with synapse init', () => {
    console.log('Running synapse init in temporary test project...');
    
    // Executar a CLI em Node.js apontando o diretório de trabalho atual (cwd) para o testProjectDir
    try {
      execSync(`node "${cliPath}" init`, { cwd: testProjectDir, stdio: 'pipe' });
    } catch (err) {
      fail(`synapse init failed to execute: ${err.message}`);
    }

    // Verificar se a pasta local .agents foi criada
    const agentsDir = path.resolve(testProjectDir, '.agents');
    expect(fs.existsSync(agentsDir)).toBe(true);

    // Verificar state.json
    const stateFile = path.resolve(agentsDir, 'state.json');
    expect(fs.existsSync(stateFile)).toBe(true);
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    expect(state.active_persona).toBe('PM');
    expect(state.validation_status.gears_validated).toBe(false);
    const localAgentsDir = path.resolve(agentsDir, 'agents');
    expect(fs.existsSync(path.resolve(localAgentsDir, 'bmad-master.md'))).toBe(true);
    expect(fs.existsSync(path.resolve(localAgentsDir, 'local-guardrails-policy.md'))).toBe(true);

    // Verificar GEMINI.md e AGENTS.md locais
    expect(fs.existsSync(path.resolve(testProjectDir, 'GEMINI.md'))).toBe(true);
    expect(fs.existsSync(path.resolve(testProjectDir, 'AGENTS.md'))).toBe(true);

    // Verificar se adicionou os scripts no package.json local
    const packageJsonPath = path.resolve(testProjectDir, 'package.json');
    expect(fs.existsSync(packageJsonPath)).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    expect(pkg.scripts['harness:tdd']).toBe('synapse tdd');
    expect(pkg.scripts['harness:status']).toBe('synapse status');

    // Verificar pastas semânticas do 00_docs/
    expect(fs.existsSync(path.resolve(testProjectDir, '00_docs/01_prd'))).toBe(true);
    expect(fs.existsSync(path.resolve(testProjectDir, '00_docs/02_tech_specs'))).toBe(true);
    expect(fs.existsSync(path.resolve(testProjectDir, '00_docs/04_adrs'))).toBe(true);
    expect(fs.existsSync(path.resolve(testProjectDir, '00_docs/04_adrs/0001-template-madr.md'))).toBe(true);
  });

  test('should successfully execute synapse doctor diagnostic command', () => {
    let output = '';
    try {
      output = execSync(`node "${cliPath}" doctor`, { cwd: testProjectDir, encoding: 'utf8', stdio: 'pipe' });
    } catch (err) {
      fail(`synapse doctor failed to execute: ${err.message}`);
    }

    expect(output).toContain('autodiagnóstico');
    expect(output).toContain('Graphify CLI');
    expect(output).toContain('IDE MCP Server');
    expect(output).toContain('Estado Local');
  });
});

