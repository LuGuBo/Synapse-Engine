#!/usr/bin/env node

/**
 * ⚡ Synapse Engine - Hardware Selector Helper (Node.js)
 * Wraps python src/hardware_selector.py or provides fast fallback.
 */

const { execFileSync } = require('child_process');
const path = require('path');
const os = require('os');

const PYTHON_SCRIPT = path.join(__dirname, '..', 'src', 'hardware_selector.py');

function getHardwareStatus(workload = 'auto', payloadSizeKb = 0.0, override = null) {
  try {
    const args = [PYTHON_SCRIPT, '--json', workload, String(payloadSizeKb)];
    if (override) {
      args.push(override);
    }
    const output = execFileSync('python', args, { encoding: 'utf8', timeout: 5000 });
    return JSON.parse(output.trim());
  } catch (err) {
    // Graceful fallback to pure JS CPU response
    const cpuCores = os.cpus().length;
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
