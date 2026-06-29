const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('synapse_forge.py integration tests', () => {
  const scriptPath = path.join(__dirname, '..', 'src', 'synapse_forge.py');

  const runPythonScript = (args = '') => {
    // Try virtual environment python executable first
    const venvWin = path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe');
    const venvUnix = path.join(__dirname, '..', '.venv', 'bin', 'python');
    let pythonCmd = '';

    if (fs.existsSync(venvWin)) {
      pythonCmd = `"${venvWin}"`;
    } else if (fs.existsSync(venvUnix)) {
      pythonCmd = `"${venvUnix}"`;
    } else {
      try {
        execSync('python --version', { stdio: 'ignore' });
        pythonCmd = 'python';
      } catch {
        pythonCmd = 'python3';
      }
    }

    try {
      const output = execSync(`${pythonCmd} "${scriptPath}" ${args}`, { encoding: 'utf8', stdio: 'pipe' });
      return { status: 0, stdout: output, stderr: '' };
    } catch (error) {
      return {
        status: error.status,
        stdout: error.stdout || '',
        stderr: error.stderr || ''
      };
    }
  };

  test('should execute synapse_forge.py successfully and generate all scaffolding', () => {
    // Run the synapse_forge.py provisioner
    const result = runPythonScript();
    
    // It should run without error (exit code 0)
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Created Semantic Taxonomy Directories');
    expect(result.stdout).toContain('Deployed skill: qa');
    
    // Verify that the document taxonomy folders exist
    expect(fs.existsSync(path.join(__dirname, '..', '00_docs', '01_prd'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '..', '00_docs', '02_tech_specs'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '..', '00_docs', '03_rules'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '..', '00_docs', '04_adrs'))).toBe(true);
    
    // Verify the MADR template existence
    expect(fs.existsSync(path.join(__dirname, '..', '00_docs', '04_adrs', '0001-template-madr.md'))).toBe(true);
    
    // Verify local skills exist
    expect(fs.existsSync(path.join(__dirname, '..', '.agents', 'skills', 'qa', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '..', '.agents', 'skills', 'sm', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '..', '.agents', 'skills', 'ux-expert', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '..', '.agents', 'skills', 'local-guardrails-policy', 'SKILL.md'))).toBe(true);
  });
});
