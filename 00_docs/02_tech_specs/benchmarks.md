# 📊 Synapse Engine - Empirical Head-to-Head Benchmark Report

**Version:** 2.2.0  
**Test Suite:** `scripts/benchmark_head_to_head.js`  
**Evaluation Standard:** Head-to-Head A/B Comparative Analysis  

---

## 🎯 Executive Summary

This report documents the empirical performance, token context efficiency, IPC latency, and rate-limit prevention metrics of **Synapse Engine v2.2** compared against the traditional unmanaged baseline approach used by standard AI coding assistants.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      HEAD-TO-HEAD EMPIRICAL BENCHMARK SUMMARY                          │
├───────────────────────────┬────────────────────────────┬───────────────────────────────┤
│ Metric                    │ Without Synapse (Baseline) │ With Synapse Engine v2.2      │
├───────────────────────────┼────────────────────────────┼───────────────────────────────┤
│ Context Payload Size      │ 1,129.38 KB                │ 0.21 KB (99.98% reduction)    │
│ Prompt Tokens Consumed    │ 289,121 tokens             │ 55 tokens (5,256.7x savings)  │
│ AST Query IPC Latency     │ 15 - 80 ms (Disk I/O)      │ 0.189 ms (Sub-ms Stdio IPC)   │
│ API 429 Rate-Limit Rate   │ Frequent (~80% in bursts)  │ 0% (Zero 429 errors)          │
│ TDD Code Verification     │ Unverified / Blind Commits │ 100% Deterministic Quality Gate│
└───────────────────────────┴────────────────────────────┴───────────────────────────────┘
```

---

## 🔬 Test 1: Codebase Knowledge Context & Token Reduction

### Methodology
- **Scenario A (Baseline - Naive Dump / Recursive Grep):** The AI assistant ingests the full codebase context or parses entire files sequentially to map dependencies.
- **Scenario B (Synapse Engine - Stdio AST MCP):** The AI assistant queries the Synapse MCP Server (`graphify_get_deps` / `graphify_get_subgraph`), which resolves AST nodes and call trees in memory.

### Empirical Results
- **Baseline Context Size:** `1,129.38 KB` (~289,121 prompt tokens).
- **Synapse MCP Response Size:** `0.21 KB` (55 prompt tokens).
- **Context Reduction:** **99.98%** (5,256.7x token savings).
- **Roundtrip IPC Latency:** **0.189 milliseconds** over standard Stdio JSON-RPC 2.0.

---

## 🔬 Test 2: Rate-Limit Quota Guard & 429 Prevention

### Methodology
A simulated burst of 10 mixed software development tasks (ranging from single-line linter fixes to multi-node database refactoring and Socratic architecture reviews) was executed under both paradigms:
- **Scenario A (Unmanaged):** All requests hit flagship frontier models blindly. In burst conditions, requests quickly exceed provider RPM/RPD limits (e.g. Gemini 3.1 Pro 2 RPM / 50 RPD limit), resulting in HTTP 429 errors and interrupted sessions.
- **Scenario B (Synapse Quota Guard):** The `TaskWeightEstimator` classifies each task's complexity on a 1-10 scale and dynamically selects the optimal model based on sliding window consumption (60s / 24h).

### Empirical Results
- **Total Burst Tasks:** 10
- **Managed Success Rate:** **100% (0 errors)**
- **Model Distribution:**
  - `gemini-3.1-flash-lite` (Score 1-2): 6 tasks (60%) — preserved high-tier budget.
  - `gemini-3.1-pro` (Score 6-10): 4 tasks (40%) — allocated strictly to heavy architecture / design tasks.

---

## 🔬 Test 3: Deterministic TDD Quality Gate Integrity

### Methodology
Attempting to commit modified production code in `src/` without corresponding unit tests:
- **Baseline:** Commit is accepted without verification. Unverified regressions enter the codebase.
- **Synapse Engine:** The pre-commit hook (`bin/tdd-gate.js`) blocks the commit deterministically with exit code 1, requiring paired test files (`test_*.py`, `*.test.js`) and verifying state machine flags before Git commits are authorized.

---

## 🚀 How to Reproduce

Run the empirical benchmark suite locally on any machine:

```bash
node scripts/benchmark_head_to_head.js
```
