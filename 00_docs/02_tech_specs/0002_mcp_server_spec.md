# Tech Spec 0002: Aevum Kyber MCP Server & Anti-Tautological Testing Harness

## 1. Executive Summary

This technical specification details the architecture, stdio JSON-RPC tool interfaces, memory synchronization layer, and testing quality protocols of the **Aevum Kyber MCP Server** (`bin/synapse-mcp-server.js` / `aevum-kyber mcp`).

## 2. Architecture & Stdio Transport

The Aevum Kyber MCP Server runs as a zero-dependency lightweight stdio process (`JSON-RPC 2.0`). It exposes AST graph navigation, persona state management, secret scanning, skill search, hardware device selection, and declarative memory access directly to AI agents.

```
+-------------------+        stdio JSON-RPC IPC       +-----------------------------+
| AI Agent / IDE    | <=============================> | Aevum Kyber MCP Server      |
+-------------------+                                 +-----------------------------+
                                                                  |
                                       +--------------------------+--------------------------+
                                       |                          |                          |
                                       v                          v                          v
                           graphify-out/graph.json        .agents/state.json       .obsidian-vault/
```

## 3. Tool Registry Matrix (19 Registered Tools)

| Tool Name | Scope | Description |
| :--- | :--- | :--- |
| `graphify_get_deps` | AST Topology | Returns direct dependencies and caller files for a target file. |
| `graphify_get_impacted_tests` | AST Topology | Resolves affected unit test files when a source file changes. |
| `graphify_check_circular` | AST Topology | Detects circular dependency cycles in AST graph. |
| `graphify_get_path` | AST Topology | Computes BFS shortest path between two nodes in the AST graph. |
| `graphify_get_subgraph` | AST Topology | Extracts a scoped sub-graph around a root file up to `depth` hops. |
| `synapse_tdd_status` | Telemetry | Queries active persona, surgical target, and TDD validation state. |
| `synapse_shift_persona` | Telemetry | Shifts active persona (`PM`, `ARCHITECT`, `DEVELOPER`, `QA`, `BOSS`). |
| `synapse_set_target` | Telemetry | Sets active surgical file target and line range in `.agents/state.json`. |
| `synapse_generate_audit_tables` | Walkthrough | Renders PT-BR audit tables for `walkthrough.md` compliance. |
| `synapse_scan_secrets` | OWASP | Scans workspace for hardcoded API keys, JWT tokens, and credentials. |
| `synapse_get_clean_diff` | Git Status | Retrieves compact staged Git diff summary. |
| `synapse_search_skills` | JIT Skills | Searches `SKILL.md` manifests across global and local vaults. |
| `synapse_context_health_check` | Context | Audits large files (>500 lines) and `.gitignore` compliance. |
| `synapse_hardware_status` | Compute | Checks CPU/GPU specs and active acceleration provider. |
| `synapse_select_device` | Compute | Selects optimal execution device (CPU vs GPU) dynamically. |
| `synapse_read_memory` | Vault Memory | Reads or lists declarative memory notes from `.obsidian-vault/`. |
| `synapse_sync_memory` | Vault Memory | Synchronizes Obsidian Vault folders and graphify directory junction links. |
| `synapse_get_quota_status` | Quota Guard | Returns sliding-window RPM/RPD consumption and headroom. |
| `synapse_estimate_task_weight` | Quota Guard | Classifies task complexity (1-10) and recommends optimal model tier. |

## 4. Anti-Tautological Quality Protocol (`<RULE[anti_tautological_testing_protocol]>`)

All tests written for Aevum Kyber must strictly adhere to the Triple Vector Validation Directive:
- **Vector A (Real Positive Flow)**: Production-like structured payloads, real graph connections, real disk file persistence.
- **Vector B (Edge & Error Handling)**: Null/empty inputs, non-existent files, disconnected nodes, asserting controlled `isError: true` without process crashes.
- **Vector C (State Integrity Verification)**: Verifying physical file mutations on disk (`.agents/state.json`, `.obsidian-vault/`).

## 5. Performance Benchmarks

- **Direct Read Baseline (Context Dump)**: ~872 KB (~223,000 tokens)
- **MCP Stdio Query**: ~0.21 KB (~54 tokens) in **< 1 ms** latency.
- **Efficiency Reduction**: **99.98% token savings (4,000x cost factor reduction)**.
