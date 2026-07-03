# Specification: Custom Skill "grill-and-evolve"

This document defines the functional requirements for the custom skill `grill-and-evolve` under the BMAD Harness framework.

## 🎯 Product Goals
* Extend agent capabilities in the Antigravity 2.0 ecosystem to perform project codebase audits, evaluate strategic niche viability, and enforce Andrej Karpathy's software design simplicity guidelines.
* Implement structured validation gates for strategic features and exception silences within Python repositories.

## 📜 Functional Requirements

- **REQ-GE-001**: Custom Skill structure and metadata in English:
  - Create the folder structure `.agents/skills/grill-and-evolve/`.
  - Create `.agents/skills/grill-and-evolve/SKILL.md` containing a YAML frontmatter block defining `name: grill-and-evolve` and the appropriate `description` in English (consistent with the Bilingual Rule).

- **REQ-GE-002**: Niche Viability Calculations:
  - Implement a calculation function for Niche Viability ($V_n$) where:
    $$V_n = \frac{US \cdot PM}{CL \cdot AC}$$
  - Enforce bounds check: Raise a `ValueError` if the denominator values ($CL$ or $AC$) are $\le 0$.

- **REQ-GE-003**: Codebase Exception Audit:
  - Inspect codebase files recursively for Python `.py` source files.
  - Exclude system/temporary directories: `node_modules`, `.git`, `.agents`, `venv`, `__pycache__`.
  - Flag violations for generic exceptions (`except Exception:` or `except:`) immediately followed by silencers like `pass` or `continue` within the next two active lines.

- **REQ-GE-004**: Command-Line Interface (CLI):
  - Provide arguments: `--audit-only` (only static check), `--us` (default: 7.5), `--pm` (default: 8.0), `--cl` (default: 2.5), `--ac` (default: 3.0).
  - Print audit results in structured JSON.
  - Exit with a non-zero status if violations are found or if $V_n < 3.0$ (when not running audit-only).

- **REQ-GE-005**: Refactoring Reference:
  - Create `golden_case_refactoring.py` under the skill examples directory detailing the comparison between bloated/defensive programming vs. clean/Karpathy-style refactored code.

## 🧪 Acceptance Criteria
- [ ] Script `analyze_project_metrics.py` correctly calculates viability and fails appropriately on division parameters.
- [ ] Codebase audit detects generic exception silences and exits with error code 1.
- [ ] Strategic validation fails and exits with error code 2 if $V_n < 3.0$ (when not in audit-only mode).
- [ ] Directory and file structures conform to the custom skill spec.
