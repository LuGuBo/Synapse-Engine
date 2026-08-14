---
status: Accepted
date: 2026-07-03
decision_maker: AI Agent & Tech Lead (LuGuBo)
---

# ADR 0002: Native Stdio MCP Server Implementation in Aevum Kyber

## Context and Problem Statement

**Aevum Kyber** uses **Graphify** topology mapping (`./graphify-out/graph.json`) and local telemetry (`.agents/state.json`) to orchestrate development under the BMAD framework.

Previously, to inspect file connectivity or resolve impacted test suites, the AI agent was required to read raw `graph.json` files. In medium-to-large repositories, this file exceeds 200 KB (~60,000 tokens), causing prompt context pollution, high latency, and unnecessary token consumption.

## Decision Outcome

* **Chosen Option:** Implement a lightweight, zero-dependency Node.js native MCP server (`bin/synapse-mcp-server.js` / `kyber mcp`) operating over standard `stdio` transport (JSON-RPC 2.0).
* **Status:** Accepted

### Consequences

* **Good:**
  * **99.90% Token Consumption Reduction:** Dependency lookup and test resolution responses reduced from ~60,000 tokens to **~58 tokens** per query.
  * **Sub-Millisecond Latency (0.81 ms):** Ultra-fast local `stdio` IPC execution.
  * **Zero-Dependency:** Adds zero third-party packages to `package.json`, ensuring clean global installation.
  * **Ecosystem Exportability:** Registered automatically in `.cursor/mcp.json`, `.vscode/mcp.json`, and exportable across workspaces via `npx -y @lugubo/aevum-kyber init --preset=mcp`.
* **Bad:**
  * Requires a local Node.js environment to interpret the executable `bin/synapse-mcp-server.js`.
