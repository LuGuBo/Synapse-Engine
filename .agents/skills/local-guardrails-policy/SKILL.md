---
name: local-guardrails-policy
description: Local coding style guardrails and quality policies. Enforces strict exception handling audits and TDD loop compliance.
scope: local
always_on: true
---

# Local Guardrails & Quality Policies

These policies are evaluated transversally in the local workspace to prevent poor software habits and security flaws.

## 1. Exception Handling Constraints
* **No Generic Exception Silencing:** Catching generic exceptions (`except:` or `except Exception:`) in Python and silencing them within the next two active lines (using `pass` or `continue`) is strictly forbidden.
* **Explicit Exceptions:** Always catch specific error subclasses and handle them properly or re-raise with context.

## 2. Test-Driven Development (TDD) Gate
* Every modified production file must have a corresponding test file staged or tracked in Git.
* The TDD validation gate `tdd-gate.js` is run pre-commit to check compliance.
* Telemetry in `state.json` must be updated on tests run.