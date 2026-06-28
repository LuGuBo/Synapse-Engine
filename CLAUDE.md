---
bmad_version: 2.0.0
inherits: "Global BMAD (GEMINI.md + bmad-core-methodology)"
scope: "Local Domain (BmadHarness)"
last_updated: "2026-06-16"
---

# Agent Instructions - BMAD Harness

## Overview
This repository uses the local **BMAD Harness** framework integrated with the global **BMAD Core Methodology**.

## Governance & Inheritance
This project strictly inherits the global governance and behavior guidelines:
* **Global Rules**: Injected via [GEMINI.md](file:///c:/Users/lgbon/.gemini/GEMINI.md).
* **Core Methodology**: Loaded via the global skill [bmad-core-methodology](file:///C:/Users/lgbon/.gemini/antigravity-ide/skills_backup/bmad-core-methodology/SKILL.md) through the master catalog [ag_master_index](file:///C:/Users/lgbon/.gemini/config/skills/ag_master_index/SKILL.md).
* **Bilingual Rule**: Portuguese (PT-BR) only for chat, implementation plans (implementation_plan.md), and walkthroughs (walkthrough.md). English (EN-US) for all other resources including code, variables, specs, plans, readmes, agent rules, and skill manifests.

## Local Persona Shift Loop
Operational transitions follow the global persona loop using the local state:
* **PM**: Validate local specifications in `00_docs/SPEC.md` (EN-US). Update `.agent/state.json` (`validation_status.gears_validated = true`).
* **ARCHITECT**: Structure local design files in `00_docs/PLAN.md` (EN-US) and ADRs. Mape space boundaries in `state.json` under `surgical_target`.
* **DEVELOPER**: Implement code in `src/` under TDD writing failing tests in `tests/` first.
* **QA**: Validate physical compliance by running tests and gates. Produce local `00_docs/walkthrough.md`.

## Physical & Mechanical Commands
* **Run Jest Tests**: `npm test`
* **Run TDD Gate Verification**: `npm run harness:tdd`
* **Check Harness Telemetry Status**: `npm run harness:status`
* **Update Telemetry State**: `node .agent/bin/state-manager.js [args]`

## Commit Attribution
All commits made by the AI agent MUST include:
```
Co-Authored-By: Antigravity AI Agent <noreply@google.com>
```

