# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-07-31

### Added
- **LLM Connectors Architecture**: Added native connectors for Anthropic, OpenAI, and Google Gemini API with fallback mechanisms (`src/connectors/`).
- **Dynamic Workload & Model Router**: Built intelligent model routing based on workload tiers (`CHEAP`, `BALANCED`, `POWERFUL`, `CREATIVE`) in `src/services/model_router.py`.
- **ADR 0002 Compliance**: Formalized ADR 0002 following MADR 4.0.0 specification (`00_docs/04_adrs/0002-mcp-native-memory-and-testing-quality-protocol.md`).
- **Graphify Global AST Spec**: Created technical documentation for AST knowledge graph routing (`00_docs/02_tech_specs/global_brain_graphify.md`).
- **Comprehensive PyTest Suite**: Added unit testing coverage for `model_router` and `hardware_selector`.

### Changed
- Refactored `synapse-mcp-server.js` and `synapse-cli.js` with improved error handling and benchmark logging.
- Enhanced pre-commit hooks to enforce strict quality gates (`analyze_project_metrics.py`).

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
- Decoupled the custom skill `grill-and-evolve` from the local workspace (promoted to a global offline skill located in `C:\ag-skills\grill-and-evolve\`).
- Removed `tests/analyze_project_metrics.test.js` from local test suite (delegated to the global skill's repository).
