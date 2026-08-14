# Technical Plan & ADRs: Custom Skill "grill-and-evolve"

This document outlines the architectural plan and technical design for the custom skill `grill-and-evolve`.

## 🛠️ Solution Design

We will implement the custom skill inside the `.agents/skills/grill-and-evolve/` directory structure and index it via the `.agents/skills/harness_dynamic_index/` manifest.

### Skill Manifest: `SKILL.md`
- Markdown instructions in English (EN-US) describing the skill's workflow, how it conducts design interviews using the `/grill-me` protocol, and the Karpathy simplicity principles.
- YAML frontmatter block for cognitive index routing.

### Script: `scripts/analyze_project_metrics.py`
- Executable Python script validating strategic and physical project guidelines.
- **Strategic validation**:
  $$V_n = \frac{US \cdot PM}{CL \cdot AC}$$
  If $CL$ or $AC$ is $\le 0$, raise `ValueError`. If $V_n < 3.0$, exit with code 2.
- **Physical validation**:
  Recursive file analysis checking for `.py` files.
  Identify catch blocks `except Exception:` or `except:` where the subsequent lines (up to two active lines) consist solely of statements silencing the error (`pass`, `continue`). If violations exist, exit with code 1.
- Supported CLI flags using `argparse`:
  - `--audit-only`: executes only codebase exception checking.
  - `--us`, `--pm`, `--cl`, `--ac` for viability scoring parameters.

### Refactoring Reference: `examples/golden_case_refactoring.py`
- Reference code comparing standard defensive coding pattern containing generic exception silencers vs. clean, TDD-ready, Karpathy-style refactored code.

## 📂 Surgical Targets
The developer will create and work on the following file locations:
- **[NEW]** `.agents/skills/grill-and-evolve/SKILL.md`
- **[NEW]** `.agents/skills/grill-and-evolve/scripts/analyze_project_metrics.py`
- **[NEW]** `.agents/skills/grill-and-evolve/examples/golden_case_refactoring.py`
- **[NEW]** `.agents/skills/harness_dynamic_index/SKILL.md`
- **[NEW]** `tests/analyze_project_metrics.test.js` (for integration validation of the python script)

## 🏛️ Architectural Decision Records (ADRs)

### ADR-001: Python 3 Standard Scripting
* **Context**: The validation scripts need to scan codebase files quickly and compute business margins with high predictability.
* **Decision**: We use pure Python 3 without external library dependencies (`os`, `sys`, `json`, `argparse`).
* **Consequences**:
  * *Positive*: High portability on standard environments, no requirements file installation needed.
  * *Negative*: Parsing logic must be implemented using standard libraries.

### ADR-002: Jest Integration Testing
* **Context**: We need to guarantee that the Python execution script responds with correct exit codes (0 for success, 1 for violations, 2 for strategic failure) and outputs JSON structure under test scenarios.
* **Decision**: Write a Node.js-based Jest test file that executes the python process locally and asserts its outputs and statuses.
* **Consequences**:
  * *Positive*: Integrated into the project's existing Node/Jest pipeline, allowing automatic TDD verification.
  * *Negative*: Relies on a local Python 3 interpreter being available in the testing path.

### ADR-003: Native Stdio MCP Server (`kyber-mcp-server`)
* **Context**: Context inflation degrades AI performance. Reading full file dumps creates token overhead.
* **Decision**: Provide 19 structured tools over JSON-RPC 2.0 via `stdio` using Node.js for sub-millisecond local IPC (<1ms).
* **Consequences**:
  * *Positive*: >99.9% token reduction for Graphify AST lookups and state management. Zero external web dependencies.

### ADR-004: Dynamic Hardware Routing (CPU vs. GPU)
* **Context**: Following NPU removal, execution must choose between CPU and GPU dynamically based on latency profile.
* **Decision**: Ultra-low latency IPC/AST/JSON operations route strictly to CPU (<0.5ms startup), while heavy batch/neural operations route to GPU (DirectML/CUDA) with automatic CPU fallback.
* **Consequences**:
  * *Positive*: Prevents PCIe copy overhead on light tasks while preserving high parallel throughput for heavy workloads.
