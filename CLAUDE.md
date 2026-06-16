# Agent Instructions - BMAD Harness

## Overview
This repository uses the **BMAD Harness** framework (Cognitive BMAD + Mechanical Gates).

## Persona Shift Loop
Read rules from `.agent/rules/` corresponding to the active persona in `.agent/state.json`:
* **PM**: Edit `00_docs/SPEC.md` (EN-US). AI cognitive validation.
* **ARCHITECT**: Edit `00_docs/PLAN.md` (PT-BR) and ADRs. Set `surgical_target` in `state.json`.
* **DEVELOPER**: Edit `src/` (EN-US) under strict TDD. Write failing test first.
* **QA**: Run `npm test` & `npm run harness:tdd`. Write `00_docs/walkthrough.md`.

## Commands
* Run tests: `npm test`
* Run TDD gate check: `npm run harness:tdd`
* Check status: `npm run harness:status`
* Set state values: `node .agent/bin/state-manager.js [args]`

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: Antigravity AI Agent <noreply@google.com>
```
