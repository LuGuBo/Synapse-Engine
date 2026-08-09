# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.12] - 2026-08-09

### Fixed
- **NPM Authentication Token Resolution**: Configured `.github/workflows/npm-publish.yml` to automatically bind to `secrets.NPM` (or `secrets.NPM_TOKEN`), resolving `ENEEDAUTH` error during automated NPM deployment.

## [2.2.11] - 2026-08-09

### Fixed
- **NPM Publish Workflow**: Updated quality gate test step in `.github/workflows/npm-publish.yml` to run full test suite with `npx jest --verbose --runInBand`, removing obsolete references to deprecated test files.
- **Jest Configuration**: Refined `testPathIgnorePatterns` in `jest.config.js` to ensure clean discovery of all test modules across CI runner environments.

## [2.2.10] - 2026-08-09

### Fixed
- **MCP Server Dynamic Paths**: Replaced static file path constants with runtime environment getters (`getGraphPath`, `getRootDir`, `getStatePath`) to fix CI path resolution in isolated runner environments.
- **Structured JSON RPC Error Formatting**: Standardized `graphify_get_path`, `graphify_get_subgraph`, and `graphify_get_deps` to always return structured JSON objects (`found: false`, `message`) preventing `SyntaxError` during JSON parsing.
- **CI Test Suite Stability**: Added regression test cases in `tests/synapse_mcp_benchmark.test.js` validating MCP server robustness when AST graph files are absent.

## [2.2.0] - 2026-08-09

### Added
- **Sliding Window Quota Manager**: Added real-time rate limit tracker with 60s/24h sliding window calculations across RPM, TPM, RPD, and 24h token metrics (`src/quota_manager/tracker.py`).
- **Task Weight Complexity Estimator**: Implemented 1-10 task complexity classification algorithm and model routing based on live GCP availability and quota budgets (`src/quota_manager/estimator.py`).
- **Quota Interceptor & Dashboard**: Added pro-active 429 error prevention interceptor (`src/quota_manager/interceptor.py`) and local HTTP Quota Dashboard (`src/quota_manager/dashboard.py`).
- **CLI Quota Commands**: Added `synapse quota status`, `synapse quota estimate`, and `synapse quota dashboard` subcommands (`bin/synapse-cli.js`).
- **MCP Server Quota Tools**: Integrated `synapse_get_quota_status` and `synapse_estimate_task_weight` endpoints into stdio MCP server (`bin/synapse-mcp-server.js`).
- **Subagents Workflow Governance**: Implemented strict Clean-Room subagent execution workflow rules (`.agents/rules/subagents_workflow.md` and `AGENTS.md`).
- **Quota Unit Test Suite**: Added 6 Python test modules (`tests/quota_manager/`) covering tracker, estimator, interceptor, mcp_server, cli, and dashboard components.

### Changed
- **TDD Quality Gate**: Updated pre-commit TDD validation gate (`bin/tdd-gate.js`) to support Python test naming conventions (`test_*.py`).
- **MCP Benchmark Test**: Updated expected tool count assertions in `tests/synapse_mcp_benchmark.test.js` to cover 19 active tools.

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
