# Synapse Engine: Global Brain & Graphify Ecosystem

## 1. Overview
The refactoring of the Antigravity skill topology (Tri-Layer Topology) combined with the deployment of **Graphify Multi-Repo** establishes a centralized semantic and architectural foundation. `synapse-engine`, acting as the master orchestrator (`synapse-supreme-orchestrator`), consumes the global knowledge graph (`.obsidian-global-vault`) to operate with ecosystem-wide awareness across `c:\ag-projetos`.

## 2. Tri-Layer Topology & Token Economy (Benchmark)
**Previous Problem (As-Is):**
Including Obsidian skills (`obsidian-markdown`, `json-canvas`, etc.) in the initial prompt (Global Auto-Load) consumed approximately **~6,000 fixed tokens** per invocation, constraining Gemini's effective context window and cluttering prompt memory on non-documentation tasks.

**New Architecture (To-Be - JIT Hook):**
Skills remain stored in the offline vault (`C:\ag-skills\`) and are loaded Just-In-Time (JIT) only when triggered via `AGENTS.md` (by `ag_master_index`).
- **Context Efficiency:** Fixed 6k token startup overhead reduced to zero.
- **Latency:** Time-To-First-Token (TTFT) improved due to smaller prompt cache size.

## 3. Multi-Repository Graph (`c:\ag-projetos\.obsidian-global-vault`)
Unified cross-project graph compilation merges AST code dependencies and semantic markdown documentation across all workspace repositories simultaneously.

### 3.1. Semantic & Search Enhancements (GraphRAG vs Grep)
- **God Nodes Discovery:** The engine identifies `state.json` in `synapse-engine` as a central hub (God Node) connecting persona transitions in `ag-lab`. Standard `grep` searches lack structural hierarchy awareness, whereas `graphify query` evaluates the shortest path between domain concepts.
- **Ambiguity Resolution:** Graphify communities isolate orchestration logic (Synapse) from product logic (Aevum).
- **Obsidian Integration:** Agents natively query Global Vault notes and reconstruct architectural decision histories (`ADRs`).

## 4. Next Steps & System Roadmap
1. **Synapse MCP Graphify Watcher:** Implement a background service in `synapse-mcp-server` executing `graphify --update --obsidian` recursively across `c:\ag-projetos` upon PR merges.
2. **Context Injection API:** The `synapse-supreme-orchestrator` will query `graphify-out/graph.json` prior to answering infrastructure queries.

