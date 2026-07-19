# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-07-19

### Added
- Native Stdio MCP Server (`synapse-mcp-server`) for sub-millisecond local IPC integration with Agentic IDEs.
- Dynamic Hardware Routing (`synapse hardware`) to select CPU vs GPU dynamically based on latency profile.
- Automated TDD Gate validator (`synapse tdd`) to check staged production files.
- Incremental AST Knowledge Graph updates (`synapse graphify`).
- Automated release script (`scripts/release.js`) to publish releases on GitHub via REST API.

### Changed
- Refactored CLI commands (`synapse init`, `synapse update`, `synapse status`, `synapse tdd`, `synapse hardware`, `synapse graphify`, `synapse mcp`).
- Enhanced `.git/hooks/pre-commit` to validate quality gates using both global offline skills and local test suites.
- Shifted global configurations and policies to follow the Tri-Layer Skill Topology.

### Removed
- Decoupled the custom skill `grill-and-evolve` from the local workspace (promoted to a global offline skill located in `C:\AG SKILLS\grill-and-evolve\`).
- Removed `tests/analyze_project_metrics.test.js` from local test suite (delegated to the global skill's repository).
