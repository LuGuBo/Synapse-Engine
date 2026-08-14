---
name: local-guardrails-policy
description: Local coding style guardrails and quality policies. Enforces strict exception handling audits and TDD loop compliance.
scope: local
project: aevum-kyber
author: Aevum Dev Team
origin: proprietary
watermark: lugubo:proprietary
always_on: true
---

# Local Guardrails & Quality Policies

These policies are evaluated transversally in the local workspace to prevent poor software habits, test regression, and security flaws.

## 1. Exception Handling Constraints (Strict Audit Rule)
* **No Generic Exception Silencing:** Catching generic exceptions (`except:` or `except Exception:`) in Python and silencing them within the next two active lines (using `pass`, `continue`, or basic `print()`) is strictly forbidden.
* **Explicit Exceptions:** Always catch specific error subclasses (e.g., `ValueError`, `FileNotFoundError`, `KeyError`) and handle them properly or re-raise with context.
* **Correction Rule:** If you encounter generic silencing, you must replace it with explicit handling, log the error properly, or re-raise it.

## 2. Test-Driven Development (TDD) Gate
* **Test File Rule:** Every modified or new production file (e.g., `src/foo.py`) must have a corresponding test file (e.g., `tests/foo.test.js` or `tests/test_foo.py`) staged or tracked in Git.
* **Execution Rule:** Run the TDD validation gate using `npm run harness:tdd` (or `node bin/tdd-gate.js`) before completing any task.
* **Telemetry Update:** You must update `.agents/state.json` with the current test status after runs.