---
name: autoresearch
description: "Official Andrej Karpathy Autoresearch Framework. Enables AI agents to run autonomous research loops overnight, modifying training code, evaluating fixed time-budget benchmarks, and keeping or discarding changes based on objective val_bpb metrics."
always_on: false
source: "https://github.com/karpathy/autoresearch"
author: "Andrej Karpathy"
---

# Skill: Autoresearch (Official Andrej Karpathy Framework)

This skill imports the official framework created by Andrej Karpathy (`https://github.com/karpathy/autoresearch`) to enable autonomous research and code optimization loops.

## 🧠 Core Philosophy & Architecture
- **`program.md`**: Baseline instructions for the agent specifying research rules, setup, experimentation loop, and simplicity criteria.
- **`prepare.py`**: Fixed ground-truth evaluation, data loading, tokenizer, and constants (5-minute wall-clock time budget, `val_bpb` metric). Read-only.
- **`train.py`**: Single target Python file editable by the agent containing the model, optimizer, and training loop.

## 🔄 The Keep or Discard Loop
1. **Hypothesis**: Formulate a single clear hypothesis.
2. **Execution**: Edit `train.py` and run `uv run train.py` (5-minute fixed budget).
3. **Evaluation**:
   - If `val_bpb` improves: **Keep** change (`git commit`).
   - If `val_bpb` worsens or code crashes: **Discard** change (`git reset`).
