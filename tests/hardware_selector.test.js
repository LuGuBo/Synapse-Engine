const { getHardwareStatus } = require('../bin/hardware-selector');
const { execFileSync } = require('child_process');
const path = require('path');

describe('⚡ Hardware Selector (CPU vs GPU) Test Suite', () => {
  test('Pure JS/Python hardware selector detects system CPU & GPU status', () => {
    const status = getHardwareStatus('auto', 0.0);
    expect(status).toBeDefined();
    expect(status.selected_device).toBeDefined();
    expect(['CPU', 'GPU']).toContain(status.selected_device);
    expect(status.reason).toBeDefined();
  });

  test('IPC and AST queries strictly select CPU for sub-millisecond latency', () => {
    const mcpStatus = getHardwareStatus('mcp_ipc', 500.0);
    expect(mcpStatus.selected_device).toBe('CPU');
    expect(mcpStatus.reason).toContain('mcp_ipc');

    const astStatus = getHardwareStatus('ast_query', 10.0);
    expect(astStatus.selected_device).toBe('CPU');
  });

  test('Manual override flag (--device cpu / gpu) is respected', () => {
    const cpuOverride = getHardwareStatus('auto', 5000.0, 'cpu');
    expect(cpuOverride.selected_device).toBe('CPU');
    expect(cpuOverride.reason).toContain('override');
  });

  test('Python script hardware_selector.py executes correctly via CLI --json', () => {
    const pythonScript = path.join(__dirname, '..', 'src', 'hardware_selector.py');
    let pythonCmd = 'python';
    try {
      execFileSync('python', ['--version'], { stdio: 'ignore' });
    } catch (e) {
      pythonCmd = 'python3';
    }
    const output = execFileSync(pythonCmd, [pythonScript, '--json', 'ast_query', '50.0'], { encoding: 'utf8' });
    const parsed = JSON.parse(output.trim());
    expect(parsed.selected_device).toBe('CPU');
  });
});
