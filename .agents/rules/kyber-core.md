---
name: kyber-core
description: "Local domain rules for Aevum Kyber (Harness). Establishes stack rules, python environment targets, and local testing routines."
always_on: true
---

# Aevum Kyber - Local Core Rules

This file defines the project-specific rules for the **Aevum Kyber (Harness)** repository. These rules complement the global BMAD methodology.

## 1. Execution Environment
* Always run Python execution inside this project's virtual environment: `.\.venv\Scripts\python.exe` (or the equivalent platform path).
* Never execute global python binaries to run or test local kyber modules.

## 2. Codebase Structure & Navigation
* **AST Mapping:** Always inspect the `./graphify-out/graph.json` using the local graphify capabilities before modifying files.
* **TDD Gate Check:** All changes in production code must pass through the `harness_dynamic_index` tests, and the telemetry in `.agents/state.json` must be updated on verification.
* Any temporary scripts or exploratory tests must live strictly inside the `.playground/` or `tmp/` folder.
