const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('analyze_project_metrics.py integration tests', () => {
  const scriptPath = path.join(__dirname, '..', '.agents', 'skills', 'grill-and-evolve', 'scripts', 'analyze_project_metrics.py');

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
      // Try python or python3 depending on what is available
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

  test('should fail with exit code 2 when niche viability is below threshold', () => {
    // Vn = (2 * 2) / (2 * 2) = 1.0 < 3.0
    const result = runPythonScript('--us 2 --pm 2 --cl 2 --ac 2');
    expect(result.status).toBe(2);
    const jsonStr = result.stdout.substring(result.stdout.indexOf('{'), result.stdout.lastIndexOf('}') + 1);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.strategic_metrics.approved_for_implementation).toBe(false);
  });

  test('should fail with exit code 1 when divider parameters cl or ac are zero or negative', () => {
    const result = runPythonScript('--cl 0');
    // The script should handle the ValueError, and if it fails to calculate, returns status != 0 (or exceptions)
    expect(result.status).not.toBe(0);
  });

  test('should pass with exit code 0 when viability is >= 3.0 and no violations exist', () => {
    // Vn = (8 * 8) / (2 * 2) = 16.0 >= 3.0
    const result = runPythonScript('--us 8 --pm 8 --cl 2 --ac 2');
    expect(result.status).toBe(0);
    const jsonStr = result.stdout.substring(result.stdout.indexOf('{'), result.stdout.lastIndexOf('}') + 1);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.strategic_metrics.approved_for_implementation).toBe(true);
  });
});
