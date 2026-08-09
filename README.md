# ⚡ Synapse Engine

> **The Ultimate AI Coding Agent Governance & Rate-Limit Harness**  
> *Sub-millisecond AST Knowledge Graph MCP Server (99.98% token reduction), sliding-window rate-limit quota guard, deterministic TDD quality gates, and cross-ecosystem agent governance.*

---

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NPM Scoped Package](https://img.shields.io/badge/npm-@lugubo/synapse--engine-CB3837?logo=npm)](https://www.npmjs.com/package/@lugubo/synapse-engine)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.1_Flash_%26_Pro_Ready-4285F4?logo=google)](https://ai.google.dev/)
[![Antigravity IDE](https://img.shields.io/badge/Antigravity_IDE-Native_Harness-8A2BE2)](https://antigravity.google)
[![Claude Code](https://img.shields.io/badge/Claude_Code-MCP_Compatible-D97706?logo=anthropic)](https://claude.ai)
[![Cursor & Windsurf](https://img.shields.io/badge/Cursor_%26_Windsurf-Plug_%26_Play-00ADD8)](https://cursor.com)
[![Architecture: Markdown-Driven](https://img.shields.io/badge/Architecture-Markdown--Driven-000000?logo=markdown)](https://daringfireball.net/projects/markdown/)
[![Tests](https://img.shields.io/badge/Tests-100%25_Passing-brightgreen.svg)](https://github.com/LuGuBo/Synapse-Engine)

</div>

---

## 💡 Why Synapse Engine?

Autonomous AI coding agents (Claude Code, Cursor, Windsurf, Gemini CLI, Copilot Workspace) are transforming software engineering. However, in real-world production repositories, unmanaged agents suffer from four major points of failure:

1. **Context Window Bloat & High Token Costs:** Blind file reading and greedy recursive grep scans burn hundreds of thousands of tokens per prompt, diluting LLM attention and racking up large API bills.
2. **HTTP 429 Rate-Limit Crashes:** Agentic loops sending rapid bursts of complex requests quickly exhaust provider RPM/RPD limits (e.g. Gemini 3.1 Pro 2 RPM / 50 RPD limit), crashing the session.
3. **Untested Hallucinations & Regressions:** Agents frequently modify production code without writing tests, introducing regressions into the codebase.
4. **Context Amnesia & Vendor Lock-in:** Ephemeral chat sessions lose memory, while proprietary agent databases lock you into closed platforms.

**Synapse Engine** solves all four challenges in a single, high-performance, modular harness.

---

## 📊 Empirical Head-to-Head Benchmark Results

In rigorous A/B stress testing (`scripts/benchmark_head_to_head.js`), Synapse Engine demonstrated overwhelming superiority over standard unmanaged agents:

| Metric | Without Synapse (Baseline) | With Synapse Engine v2.2 | Advantage |
| :--- | :--- | :--- | :--- |
| **Context Payload Size** | `1,129.38 KB` | `0.21 KB` | **99.98% payload reduction** |
| **Prompt Tokens Consumed** | `289,121 tokens` | `55 tokens` | **5,256.7x token savings** |
| **AST Query IPC Latency** | `15 - 80 ms` (Disk I/O) | `0.189 ms` | **Sub-millisecond Stdio IPC** |
| **API 429 Rate-Limit Rate** | Frequent (~80% in bursts) | `0%` (Zero 429 errors) | **Sliding window auto-routing & fallback** |
| **TDD Code Verification** | Unverified / Blind Commits | `100% Deterministic Gate` | **Pre-commit test-pairing enforcement** |

*Reproduce the benchmark anytime on your machine:*
```bash
node scripts/benchmark_head_to_head.js
```

---

## 🧩 The 4 Modular Pillars (Opt-in Architecture)

Synapse Engine is completely modular. Install only what your project needs:

```
                                  ┌────────────────────────┐
                                  │     SYNAPSE ENGINE     │
                                  └───────────┬────────────┘
         ┌──────────────────┬─────────────────┼──────────────────┬──────────────────┐
         ▼                  ▼                 ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────┐ ┌───────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   PILLAR 1:      │ │  PILLAR 2:   │ │  PILLAR 3:    │ │   PILLAR 4:      │ │   CROSS-BRIDGE:  │
│   AST MCP SERVER │ │  QUOTA GUARD │ │  TDD GATES    │ │   BMAD MEMORY    │ │   GEMINI ↔ CLAUDE│
│ (0.2ms Stdio IPC)│ │ (0% 429 24h) │ │ (100% Tested) │ │ (Markdown State) │ │ (Universal IDE)│
└──────────────────┘ └──────────────┘ └───────────────┘ └──────────────────┘ └──────────────────┘
```

### 1. ⚡ AST Knowledge Graph MCP Server
Standard Model Context Protocol (MCP) server providing 19 high-performance Stdio tools (`graphify_get_deps`, `graphify_get_subgraph`, `graphify_get_god_nodes`, `hardware_status`, `secrets_scan`). Lets AI agents query AST dependency trees in **0.18 ms** instead of scanning thousands of lines of raw code.

### 2. 🛡️ Sliding-Window Quota Guard & Telemetry Dashboard
Continuous rate-limit protection for Google Gemini and frontier models. Features a **1-10 Task Weight Classifier** with dynamic fallback routing (routes lightweight tasks to Gemini 3.1 Flash Lite with 500 RPD budget, reserving Gemini 3.1 Pro Thinking for heavy architectural work). Includes a sleek dark-mode local web dashboard (`synapse quota dashboard`).

### 3. 🧪 Deterministic TDD Quality Gates
A pre-commit verification engine (`tdd-gate.js`) that blocks untested commits at the Git level. Enforces test pairing across Python (`test_*.py`), TypeScript/JavaScript (`*.test.ts`, `*.spec.js`), Go, and Rust.

### 4. 🧠 BMAD Subagents Governance & Persistent Memory
Clean-room persona handoffs (PM, Architect, Developer, QA Engineer) operating on disk-persisted Markdown state contracts (`PLAN.md`, `SPEC.md`, `walkthrough.md`, `00_docs/`). Eliminates context drift and sycophancy.

---

## 🌉 The Cross-Ecosystem Bridge (Gemini ↔ Claude ↔ Cursor)

Born and battle-tested in the **Google Gemini & Antigravity IDE** ecosystem and built on Anthropic's open **Model Context Protocol (MCP)**, Synapse Engine bridges high-throughput Gemini rate-limits with standard agentic IDEs:

* **Google Gemini & Antigravity IDE:** Ultra-low token pricing (Gemini 3.1 Flash Lite), massive context caching alignment (`GEMINI.md` static layout), and local GCP project quota tracking.
* **Anthropic Claude Code & Cursor:** Universal Stdio JSON-RPC 2.0 protocol, `.cursor/mcp.json`, and autonomous terminal workflows.
* **Open Ecosystem:** 100% portable on Windows, Linux, and macOS.

---

## 📝 Markdown-Driven Architecture (Executable Agent Memory)

In Synapse Engine, **Markdown is not just documentation — it is executable agent memory and deterministic state coordination**:

* **Zero Vendor Lock-in:** No proprietary binary databases or hidden cloud lock-in. Everything resides in human-readable `.md` files.
* **Context Caching Optimized:** Structured rules (`GEMINI.md`, `AGENTS.md`) use fixed layouts to maximize prompt cache hits.
* **Single Source of Truth:** Specifications (`00_docs/01_prd/`), ADRs (`00_docs/04_adrs/`), and delivery reports (`walkthrough.md`) form verifiable contracts between humans and AI agents.

---

## 🚀 1-Minute Quickstart

### Initialize with Modular Presets (Choose what you need)

```bash
# Option A: Quota Guard & Local Dashboard only
npx -y @lugubo/synapse-engine init --preset=quota

# Option B: AST Knowledge Graph MCP Server only (Cursor / Claude / VSCode)
npx -y @lugubo/synapse-engine init --preset=mcp

# Option C: Deterministic TDD Pre-Commit Gate only
npx -y @lugubo/synapse-engine init --preset=tdd

# Option D: Full BMAD Agent Governance Suite
npx -y @lugubo/synapse-engine init --preset=full
```

---

### IDE Integrations

#### 🟣 Cursor & Windsurf
Add to your project's `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "synapse-engine": {
      "command": "npx",
      "args": ["-y", "@lugubo/synapse-engine", "mcp"]
    }
  }
}
```

#### 🟠 Claude Code (Anthropic CLI)
Run in your terminal:
```bash
claude mcp add synapse-engine -- npx -y @lugubo/synapse-engine mcp
```

#### 🔵 VS Code / Copilot
Add to `.vscode/mcp.json`:
```json
{
  "mcpServers": {
    "synapse-engine": {
      "command": "npx",
      "args": ["-y", "@lugubo/synapse-engine", "mcp"]
    }
  }
}
```

---

## 💻 CLI Commands Reference

Once installed, use the global `synapse` command:

```bash
# Quota & Telemetry
synapse quota dashboard      # Launch real-time telemetry HTML dashboard in browser
synapse quota status         # Inspect active 60-second and 24-hour sliding windows
synapse quota estimate       # Estimate task weight (1-10) and recommended model tier

# MCP & Codebase Knowledge
synapse mcp                  # Start Stdio MCP Server (JSON-RPC 2.0)
synapse graphify             # Generate/update AST knowledge graph in background

# Governance & Quality Gates
synapse tdd                  # Execute pre-commit TDD code verification
synapse status               # Check BMAD persona states and validation flags
synapse doctor               # Run autodiagnostic environment health check
```

---

## 📄 License & Attribution

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

```text
MIT License

Copyright (c) 2026 LuGuBo (Synapse Dev Team)
```
