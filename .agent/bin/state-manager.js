#!/usr/bin/env node
/**
 * state-manager.js
 * Utility script to query and update the state.json in the BMAD Harness framework.
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE_PATH = path.resolve(__dirname, '../state.json');

function readState() {
  if (!fs.existsSync(STATE_FILE_PATH)) {
    console.error(`❌ Error: state.json not found at ${STATE_FILE_PATH}`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE_PATH, 'utf8'));
  } catch (err) {
    console.error(`❌ Error: Failed to parse state.json: ${err.message}`);
    process.exit(1);
  }
}

function writeState(state) {
  try {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2), 'utf8');
    console.log('✅ state.json updated successfully.');
  } catch (err) {
    console.error(`❌ Error: Failed to write state.json: ${err.message}`);
    process.exit(1);
  }
}

function printUsage() {
  console.log('Usage:');
  console.log('  node state-manager.js show');
  console.log('  node state-manager.js set persona [PM|ARCHITECT|DEVELOPER|QA]');
  console.log('  node state-manager.js set target <file_path> <start_line> <end_line>');
  console.log('  node state-manager.js set validation <key> [true|false]');
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printUsage();
    process.exit(0);
  }

  const action = args[0].toLowerCase();
  const state = readState();

  if (action === 'show') {
    console.log(JSON.stringify(state, null, 2));
    process.exit(0);
  }

  if (action === 'set') {
    if (args.length < 3) {
      console.error('❌ Error: Missing parameters for set command.');
      printUsage();
      process.exit(1);
    }

    const target = args[1].toLowerCase();

    if (target === 'persona') {
      const persona = args[2].toUpperCase();
      const allowedPersonas = ['PM', 'ARCHITECT', 'DEVELOPER', 'QA'];
      if (!allowedPersonas.includes(persona)) {
        console.error(`❌ Error: Persona must be one of ${allowedPersonas.join(', ')}`);
        process.exit(1);
      }
      state.active_persona = persona;
      writeState(state);
    } 
    else if (target === 'target') {
      if (args.length < 5) {
        console.error('❌ Error: Usage: set target <file_path> <start_line> <end_line>');
        process.exit(1);
      }
      const filePath = args[2];
      const startLine = parseInt(args[3], 10);
      const endLine = parseInt(args[4], 10);

      if (isNaN(startLine) || isNaN(endLine) || startLine < 1 || endLine < 1) {
        console.error('❌ Error: Start and end lines must be positive integers.');
        process.exit(1);
      }

      state.surgical_target = {
        file_path: filePath,
        line_range_start: startLine,
        line_range_end: endLine
      };
      writeState(state);
    } 
    else if (target === 'validation') {
      if (args.length < 4) {
        console.error('❌ Error: Usage: set validation <key> [true|false]');
        process.exit(1);
      }
      const key = args[2];
      const value = args[3].toLowerCase() === 'true';

      if (!(key in state.validation_status)) {
        console.error(`❌ Error: Invalid validation key. Must be one of: ${Object.keys(state.validation_status).join(', ')}`);
        process.exit(1);
      }

      state.validation_status[key] = value;
      writeState(state);
    } 
    else {
      console.error(`❌ Error: Unknown set target '${args[1]}'`);
      printUsage();
      process.exit(1);
    }
  } else {
    console.error(`❌ Error: Unknown action '${args[0]}'`);
    printUsage();
    process.exit(1);
  }
}

main();
