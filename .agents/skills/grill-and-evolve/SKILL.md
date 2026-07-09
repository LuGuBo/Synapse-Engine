---
name: grill-and-evolve
description: "Custom skill to perform static audits of exception handling in Python codebases, calculate strategic niche viability metrics, and apply Karpathy's software design simplicity guidelines using Socratic questioning and refinement loops (/grill-me)."
always_on: true
watermark: "lugubo:proprietary"
scope: "local"
project: "synapse-engine"
author: "Synapse Dev Team"
origin: "proprietary"
---


> [!NOTE]
> ðŸ’  **Proprietary Skill** â€¢ Custom-crafted by the development team.
> **Project**: `synapse-engine` | **Scope**: `local` | **Watermark**: `lugubo:proprietary`

# Skill: grill-and-evolve (Karpathy Simplicity & Codebase Audit)

This skill extends agent capabilities in the Antigravity ecosystem to ensure extreme software design simplicity and static code audit within the project.

## ðŸ§  Karpathy Simplicity Philosophy
Inspired by Andrej Karpathy's software development philosophy, we advocate for:
1. **Lean Code**: Avoid premature abstractions or excessive engineering (bloatware).
2. **No Generic Exception Silencing**: Catching generic exceptions with `pass` or `continue` without proper handling hides actual bugs and breaks testability (TDD).
3. **Readability & Testability**: Code must be written to be readable and easily testable.

## ðŸ› ï¸ Core Features

### 1. Niche Viability Calculation ($V_n$)
Calculates the strategic viability index of a market niche:
$$V_n = \frac{US \cdot PM}{CL \cdot AC}$$
Where:
- $US$ = Potential Users (Scale)
- $PM$ = Estimated Profit Margin
- $CL$ = Customer Acquisition Cost (CAC)
- $AC$ = Cost of Servicing

*Note*: If $CL$ or $AC \le 0$, validation will fail with a division error. If $V_n < 3.0$, the strategic viability will be rejected.

### 2. Static Exception Silence Audit
Recursively scans Python source files (`.py`), excluding system and temporary directories (`node_modules`, `.git`, `.agent`, `.agents`, `venv`, `.venv`, `__pycache__`), to identify blocks that catch generic exceptions (`except:` or `except Exception:`) and silence them immediately (presence of `pass` or `continue` within the next two active lines).

## ðŸ’¬ Socratic Loop `/grill-me`
When activated by the `/grill-me` command, the agent must interview the user socratically about design decisions, forcing them to justify the introduction of new classes, dependencies, or unnecessary complexity.

---
*Co-Authored-By: Antigravity AI Agent <noreply@google.com>*


