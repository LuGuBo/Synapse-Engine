const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

describe('Aevum Kyber CLI Integration Tests', () => {
  const cliPath = path.resolve(__dirname, '../bin/kyber-cli.js');
  const baseTestDir = path.resolve(os.tmpdir(), `kyber_test_proj_${Date.now()}`);

  function cleanDir(dir) {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      } catch (e) {
        try {
          execSync(`powershell -Command "Remove-Item -LiteralPath '${dir}' -Recurse -Force"`, { stdio: 'ignore' });
        } catch (err) {}
      }
    }
  }

  beforeAll(() => {
    cleanDir(baseTestDir);
    fs.mkdirSync(baseTestDir, { recursive: true });
  });

  afterAll(() => {
    cleanDir(baseTestDir);
  });

  test('should successfully initialize a new project with kyber init', () => {
    const testDir = path.resolve(baseTestDir, 'init_full');
    fs.mkdirSync(testDir, { recursive: true });

    execSync(`node "${cliPath}" init`, { cwd: testDir, stdio: 'pipe' });

    // Verificar se a pasta local .agents foi criada
    const agentsDir = path.resolve(testDir, '.agents');
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
    expect(fs.existsSync(path.resolve(testDir, 'GEMINI.md'))).toBe(true);
    expect(fs.existsSync(path.resolve(testDir, 'AGENTS.md'))).toBe(true);

    // Verificar se adicionou os scripts no package.json local
    const packageJsonPath = path.resolve(testDir, 'package.json');
    expect(fs.existsSync(packageJsonPath)).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    expect(pkg.scripts['harness:tdd']).toBe('kyber tdd');
    expect(pkg.scripts['harness:status']).toBe('kyber status');

    // Verificar pastas semânticas do 00_docs/
    expect(fs.existsSync(path.resolve(testDir, '00_docs/01_prd'))).toBe(true);
    expect(fs.existsSync(path.resolve(testDir, '00_docs/02_tech_specs'))).toBe(true);
    expect(fs.existsSync(path.resolve(testDir, '00_docs/04_adrs'))).toBe(true);
    expect(fs.existsSync(path.resolve(testDir, '00_docs/04_adrs/0001-template-madr.md'))).toBe(true);
  });

  test('should successfully initialize quota preset with kyber init --preset=quota', () => {
    const quotaDir = path.resolve(baseTestDir, 'quota_subproject');
    fs.mkdirSync(quotaDir, { recursive: true });

    execSync(`node "${cliPath}" init --preset=quota`, { cwd: quotaDir, stdio: 'pipe' });

    expect(fs.existsSync(path.resolve(quotaDir, '.agents/state.json'))).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(path.resolve(quotaDir, 'package.json'), 'utf8'));
    expect(pkg.scripts['quota:dashboard']).toBe('kyber quota dashboard');
    expect(pkg.scripts['quota:status']).toBe('kyber quota status');
    expect(fs.existsSync(path.resolve(quotaDir, 'GEMINI.md'))).toBe(false);
  });

  test('should successfully initialize mcp preset with kyber init --preset=mcp', () => {
    const mcpDir = path.resolve(baseTestDir, 'mcp_subproject');
    fs.mkdirSync(mcpDir, { recursive: true });

    execSync(`node "${cliPath}" init --preset=mcp`, { cwd: mcpDir, stdio: 'pipe' });

    expect(fs.existsSync(path.resolve(mcpDir, '.cursor/mcp.json'))).toBe(true);
    expect(fs.existsSync(path.resolve(mcpDir, '.vscode/mcp.json'))).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(path.resolve(mcpDir, 'package.json'), 'utf8'));
    expect(pkg.scripts['harness:mcp']).toBe('kyber mcp');
  });

  test('should successfully initialize tdd preset with kyber init --preset=tdd', () => {
    const tddDir = path.resolve(baseTestDir, 'tdd_subproject');
    fs.mkdirSync(tddDir, { recursive: true });

    execSync(`node "${cliPath}" init --preset=tdd`, { cwd: tddDir, stdio: 'pipe' });

    expect(fs.existsSync(path.resolve(tddDir, '.agents/state.json'))).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(path.resolve(tddDir, 'package.json'), 'utf8'));
    expect(pkg.scripts['harness:tdd']).toBe('kyber tdd');
  });

  test('should successfully execute kyber doctor diagnostic command', () => {
    const doctorDir = path.resolve(baseTestDir, 'doctor_subproject');
    fs.mkdirSync(doctorDir, { recursive: true });
    execSync(`node "${cliPath}" init`, { cwd: doctorDir, stdio: 'pipe' });

    const output = execSync(`node "${cliPath}" doctor`, { cwd: doctorDir, encoding: 'utf8', stdio: 'pipe' });

    expect(output).toContain('autodiagnostics');
    expect(output).toContain('Graphify CLI');
    expect(output).toContain('IDE MCP Server');
    expect(output).toContain('Local State');
  });
});
