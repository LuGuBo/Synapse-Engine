#!/usr/bin/env node

/**
 * ⚡ Synapse Engine - Hardware Selector Helper (Node.js)
 * Wraps python src/hardware_selector.py or provides fast fallback.
 */

const { execFileSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const ROOT_DIR = path.join(__dirname, '..');
const PYTHON_SCRIPT = path.join(ROOT_DIR, 'src', 'hardware_selector.py');

function getHardwareStatus(workload = 'auto', payloadSizeKb = 0.0, override = null) {
  const cpuCores = os.cpus().length;

  // Otimização estática: Cargas de ultra-baixa latência e arquivos de texto/código rodam localmente na CPU (Fast-Path SIMD)
  const staticCpuWorkloads = [
    'mcp_ipc', 'ast_query', 'json_state', 'secret_scan', 'git_diff',
    'fast_path_text', 'fast_path_code', 'fast_path'
  ];
  const fastPathExts = ['.py', '.ts', '.md', '.json', '.js', '.html', '.css'];
  const isFastPathFile = fastPathExts.some(ext => workload.toLowerCase().endsWith(ext));
  const isCpuWorkload = isFastPathFile || staticCpuWorkloads.includes(workload.toLowerCase());
  const isCpuOverride = override && override.toLowerCase() === 'cpu';

  if (isCpuWorkload && (!override || isCpuOverride)) {
    return {
      selected_device: 'CPU',
      reason: `Workload type '${workload}' requires ultra-low latency IPC (<0.5ms). CPU preferred.`,
      gpu_available: false,
      gpu_name: 'None',
      provider: 'CPU'
    };
  }

  if (isCpuOverride) {
    return {
      selected_device: 'CPU',
      reason: "User explicit override ('cpu')",
      gpu_available: false,
      gpu_name: 'None',
      provider: 'CPU'
    };
  }

  // Detecta interpretador python local da virtualenv para evitar o python global lento/quebrado do Windows
  let pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  const localVenvPython = os.platform() === 'win32'
    ? path.join(ROOT_DIR, '.venv', 'Scripts', 'python.exe')
    : path.join(ROOT_DIR, '.venv', 'bin', 'python');
  
  if (fs.existsSync(localVenvPython)) {
    pythonCmd = localVenvPython;
  }

  try {
    const args = [PYTHON_SCRIPT, '--json', workload, String(payloadSizeKb)];
    if (override) {
      args.push(override);
    }
    const output = execFileSync(pythonCmd, args, { encoding: 'utf8', timeout: 250 });
    return JSON.parse(output.trim());
  } catch (err) {
    // Graceful fallback to pure JS CPU response
    return {
      selected_device: 'CPU',
      reason: `Python selector fallback (${err.message}). Defaulting to CPU (${cpuCores} cores).`,
      gpu_available: false,
      gpu_name: 'None',
      provider: 'CPU'
    };
  }
}

module.exports = {
  getHardwareStatus
};

if (require.main === module) {
  const status = getHardwareStatus('auto', 0.0);
  console.log('⚡ Synapse Engine - Hardware Selection Status:');
  console.log(JSON.stringify(status, null, 2));
}
