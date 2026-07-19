#!/usr/bin/env node

/**
 * ⚡ Synapse Engine - Graphify Auto-Update Runner Wrapper
 * Resolves the location of the graphify executable/module (saved interpreter, global python, globally path, or local .venv)
 * and executes "update ." safely across platforms.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const ROOT_DIR = process.cwd();

function detectGraphifyCommand() {
  // 1. Try to read the saved interpreter path from previous build/update
  const savedPythonPath = path.join(ROOT_DIR, 'graphify-out', '.graphify_python');
  if (fs.existsSync(savedPythonPath)) {
    try {
      const pyExe = fs.readFileSync(savedPythonPath, 'utf8').trim();
      if (fs.existsSync(pyExe)) {
        execSync(`"${pyExe}" -c "import graphify"`, { stdio: 'ignore' });
        return `"${pyExe}" -m graphify.cli`;
      }
    } catch (e) {}
  }

  // 2. Try global python with graphify module
  try {
    execSync('python -c "import graphify"', { stdio: 'ignore' });
    return 'python -m graphify.cli';
  } catch (e) {}

  // 3. Try global graphify command
  try {
    execSync('graphify --version', { stdio: 'ignore' });
    return 'graphify';
  } catch (e) {}

  // 4. Try ~/.local/bin local command
  const homeDir = os.homedir();
  const localBinGraphify = path.join(homeDir, '.local', 'bin', os.platform() === 'win32' ? 'graphify.exe' : 'graphify');
  if (fs.existsSync(localBinGraphify)) {
    return `"${localBinGraphify}"`;
  }

  // 5. Try local .venv via uv
  const uvCmd = os.platform() === 'win32' ? '.venv\\Scripts\\uv.exe' : '.venv/bin/uv';
  const localUv = path.join(ROOT_DIR, uvCmd);
  if (fs.existsSync(localUv)) {
    return `"${localUv}" tool run --from graphifyy graphify`;
  }

  return 'python -m graphify.cli';
}

try {
  const cmd = detectGraphifyCommand();
  console.log(`[Synapse Graphify] Running: ${cmd} update .`);
  execSync(`${cmd} update .`, { stdio: 'inherit', cwd: ROOT_DIR });
  console.log('✅ Graphify graph updated successfully.');
} catch (err) {
  console.error('❌ Error executing graphify update:', err.message);
  process.exit(1);
}
