# Technical Specification: Native MCP Server (`kyber-mcp-server`)

## 1. Overview & Architecture
The **Aevum Kyber Native MCP Server** is a lightweight, zero-dependency Node.js implementation of the **Model Context Protocol (MCP)** operating over `stdio` transport via **JSON-RPC 2.0**.

It exposes AST graph topology querying (**Graphify**), BMAD governance telemetry (**TDD Gate & State**), OWASP security scanning, JIT skill discovery, rate-limit quota monitoring, and hardware acceleration routing to agents running in Antigravity IDE / Claude Desktop / Google Antigravity SDK with sub-millisecond execution and minimal token overhead.

---

## 2. Communication Interface & Stdio IPC Protocol

* **Transport:** Stdio (`process.stdin` / `process.stdout`)
* **Format:** JSON-RPC 2.0 per line (newline-delimited JSON)
* **Executable:** `bin/synapse-mcp-server.js` (CLI command: `kyber mcp`)
* **MCP Protocol Version:** `2024-11-05`

---

## 3. Tool Registry Matrix

The server exposes **registered tools** with standardized behavioral annotations:

### 1. `graphify_get_deps`
* **Description:** Returns direct dependencies (imported modules) and callers (importing modules) for a given AST file node.
* **Arguments (`inputSchema`):**
  * `targetFile` (string, required): Relative path of the target file.
* **Annotations:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 2. `graphify_get_impacted_tests`
* **Description:** Resolves unit test files affected by modifications to a target source file.
* **Arguments (`inputSchema`):**
  * `targetFile` (string, required): Relative path of the changed file.
* **Annotations:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 3. `graphify_check_circular`
* **Description:** Runs cycle detection on the AST graph (`graphify-out/graph.json`) to prevent circular dependencies.
* **Arguments (`inputSchema`):** None.
* **Annotations:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 4. `synapse_tdd_status`
* **Description:** Queries local telemetry state (`.agents/state.json`) returning active persona, surgical editing target, and TDD status.
* **Arguments (`inputSchema`):** None.
* **Annotations:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 5. `synapse_shift_persona`
* **Description:** Updates the active persona in local telemetry state (`.agents/state.json`).
* **Arguments (`inputSchema`):**
  * `active_persona` (string, required): Target persona (`PM`, `ARCHITECT`, `DEVELOPER`, `QA`, `BOSS`).
* **Annotations:** `readOnlyHint: false`, `idempotentHint: false`, `destructiveHint: false`.

### 6. `synapse_set_target`
* **Description:** Defines the active surgical target scope (file path and line range) in `.agents/state.json`.
* **Arguments (`inputSchema`):**
  * `file_path` (string, required): Relative path of target file.
  * `line_range_start` (number, optional): Start line (1-indexed).
  * `line_range_end` (number, optional): End line (1-indexed).
* **Annotations:** `readOnlyHint: false`, `idempotentHint: false`, `destructiveHint: false`.

### 7. `synapse_generate_audit_tables`
* **Description:** Generates Markdown audit tables for persona and skill execution compliance in `walkthrough.md`.
* **Arguments (`inputSchema`):**
  * `activePersona` (string, optional): Active persona name.
  * `skillsUsed` (array of strings, optional): List of invoked skills.
* **Annotations:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 8. `synapse_scan_secrets`
* **Description:** Scans workspace files for leaked credentials (AWS keys, GitHub tokens, passwords) following OWASP rules.
* **Arguments (`inputSchema`):**
  * `response_format` (string, optional, enum: `['markdown', 'json']`, default: `'markdown'`).
* **Annotations:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 9. `synapse_get_clean_diff`
* **Description:** Returns clean statistical summary of staged Git diff changes.
* **Arguments (`inputSchema`):** None.
* **Annotations:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 10. `synapse_search_skills`
* **Description:** Searches offline `SKILL.md` manifests across central (`C:\ag-skills`), global (`~/.gemini/config/skills`), and local (`.agents/skills`) vaults.
* **Arguments (`inputSchema`):**
  * `query` (string, optional): Search keyword.
* **Annotations:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 11. `synapse_context_health_check`
* **Description:** Validates workspace context health (large files >500 lines and `.gitignore` compliance).
* **Arguments (`inputSchema`):**
  * `response_format` (string, optional, enum: `['markdown', 'json']`, default: `'markdown'`).
* **Annotations:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 12. `synapse_hardware_status`
* **Description:** Detects CPU/GPU specifications and active hardware acceleration provider (DirectML, CUDA).
* **Arguments (`inputSchema`):** None.
* **Annotations:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 13. `synapse_select_device`
* **Description:** Dynamically selects optimal execution device (CPU vs GPU) based on workload classification and payload.
* **Arguments (`inputSchema`):**
  * `workloadType` (string, optional): Workload tier (`mcp_ipc`, `ast_query`, `batch_embeddings`, `neural_inference`, `auto`).
  * `payloadSizeKb` (number, optional): Estimated payload size in KB.
  * `override` (string, optional): Explicit override (`cpu` or `gpu`).
* **Annotations:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

---

## 4. Resource Protocol (`resources/list` & `resources/read`)

The server exposes static and dynamic resources minified at runtime for maximum token economy:

### Supported Resource URIs:
1. `skills://<skill-name>`: Returns minified `SKILL.md` content for the requested skill.
2. `state://current`: Returns raw JSON content of local telemetry state (`.agents/state.json`).
3. `graph://topology`: Returns concise AST graph topology summary (`nodesCount`, `edgesCount`, module list).

---

## 5. Integration with Google Antigravity SDK

To connect `aevum-kyber` MCP server to autonomous agents using the **Google Antigravity SDK**:

### Python SDK Example:
```python
from google.antigravity import Agent, LocalAgentConfig, policy, types

mcp_servers = [
    types.McpStdioServer(
        command="node",
        args=["bin/synapse-mcp-server.js"]
    )
]

# Strict safety policy configuration
policies = [
    policy.confirm_run_command(),
    policy.allow("synapse_scan_secrets"),
    policy.allow("graphify_get_deps"),
    policy.allow("synapse_shift_persona")
]

config = LocalAgentConfig(mcp_servers=mcp_servers, policies=policies)

async with Agent(config) as agent:
    response = await agent.chat("Check dependencies for bin/kyber-cli.js via MCP.")
    print(await response.text())
```

---

## 6. Performance Benchmark & Token Savings

| Metric | Raw File Read (`graph.json`) | Native MCP Server (`stdio`) | Efficiency Gain |
| :--- | :--- | :--- | :--- |
| **Token Consumption** | ~59,970 tokens | **58 tokens** | **99.90% Reduction** |
| **Payload Size** | 234.26 KB | **0.23 KB** | **1,034x Smaller** |
| **Response Latency** | I/O dependent | **0.810 ms** | **Sub-millisecond** |

---

## 7. Execution & Testing Commands

```bash
# Start Stdio server manually
kyber mcp
# or
node bin/synapse-mcp-server.js

# Execute Jest unit test and benchmark suite
npx jest tests/synapse_mcp_benchmark.test.js
```
