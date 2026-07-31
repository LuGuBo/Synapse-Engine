---
status: Accepted
date: 2026-07-29
decision_maker: AI Agent & Software Architect
---

# ADR 0002: Native MCP Memory Integration and Anti-Tautological Quality Protocol

## Context and Problem Statement

1. **Context Navigation Overhead**: Prior to this ADR, accessing declarative memory in `.obsidian-vault/` required external PowerShell scripts (`sync-memory.ps1`) or raw file reads, introducing context window pollution.
2. **Shortest Path & Subgraph Gaps**: The MCP server exposed basic node dependency lookup (`graphify_get_deps`) but lacked pathfinding (`graphify_get_path`) and scoped subgraph extraction (`graphify_get_subgraph`), forcing agents to execute multiple roundtrip RPC calls.
3. **Tautological Test Risk**: Mocks that merely mirror inputs or tests asserting fixed boolean constants (`expect(true).toBe(true)`) create false-positive quality signals.

## Decision Outcome

* **Chosen Option**: Expand `bin/synapse-mcp-server.js` with 4 new tools (`graphify_get_path`, `graphify_get_subgraph`, `synapse_read_memory`, `synapse_sync_memory`), implement `synapse doctor` in `bin/synapse-cli.js`, and enforce `<RULE[anti_tautological_testing_protocol]>` across all project templates and global IDE rules.

### Consequences

* **Good**:
  - Direct stdio JSON-RPC tool access to Obsidian Vault notes minified for token efficiency.
  - BFS pathfinding and scoped subgraph extraction reducing agent turn count.
  - Empirical verification of unit test suites via Triple Vector Validation (Positive Flow, Edge/Error, State Persistence).
  - Strict compliance with Harness Bilingual Rule (EN-US for code/rules/specs, PT-BR for chat/plans/walkthroughs).
* **Bad**:
  - Slightly larger MCP server codebase (`bin/synapse-mcp-server.js` expanded to ~1,400 lines).
