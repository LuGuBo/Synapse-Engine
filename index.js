/**
 * Synapse Engine
 * High-Performance AI Coding Agent Governance & Rate-Limit Harness
 * 
 * @license MIT
 */

const packageJson = require('./package.json');

module.exports = {
  version: packageJson.version,
  name: packageJson.name,
  paths: {
    cli: require.resolve('./bin/kyber-cli.js'),
    mcpServer: require.resolve('./bin/synapse-mcp-server.js'),
    tddGate: require.resolve('./bin/tdd-gate.js'),
    stateManager: require.resolve('./bin/state-manager.js'),
    hardwareSelector: require.resolve('./bin/hardware-selector.js'),
    graphify: require.resolve('./bin/harness-graphify.js')
  }
};
