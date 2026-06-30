---
bmad_version: 2.0.0
inherits: "Global BMAD (GEMINI.md + bmad-core-methodology)"
scope: "Local Domain ({{PROJECT_NAME}})"
last_updated: "{{DATE}}"
---

# Agent Instructions - {{PROJECT_NAME}}

## Overview
This repository implements the **{{PROJECT_NAME}}** application. It strictly integrates with the global **BMAD Core Methodology** and utilizes the **Synapse Engine** framework for local harness development.

## Codebase Navigation via Graphify
- **Map-First Querying**: Do not perform blind recursive text searches or grep scans over the entire codebase. You MUST inspect the local dependency graph at `./graphify-out/graph.json` first to understand logical node connections, import maps, and dependencies.
- **Surgical Modification**: Limit context pollution. Modify only the nodes/files directly related to the active task.
- **Keep Graph Fresh**: Run `npm run harness:graphify` (or `synapse graphify`) after adding, deleting, or refactoring files to ensure structural representations are up to date.

## Governance & State Machine (Persona Shift Loop)
Transitions between coding phases are tracked in `.agents/state.json`. You must update this file using `synapse status` or manual edits:
- **PM**: Validate business requirements in `00_docs/01_prd/` and update state `validation_status.gears_validated = true`.
- **ARCHITECT**: Structure designs in `00_docs/02_tech_specs/` and ADRs in `00_docs/04_adrs/`. Map file targets in `state.json` under `surgical_target`.
- **DEVELOPER**: Write failing unit/integration tests first before editing implementation files under strict TDD.
- **QA**: Run validations, ensure tests pass, generate `walkthrough.md` (PT-BR) containing the **Agent & Skill Trace** matrix, and update state `implementation_passed = true`.

## Physical & Mechanical Commands
* **Check Harness Telemetry Status**: `npm run harness:status`
* **Run TDD Gate Verification**: `npm run harness:tdd`
* **Update Harness State**: `node .agents/bin/state-manager.js [args]`
* **Update Graphify Graph**: `npm run harness:graphify`

## Commit Attribution
All commits made by the AI agent MUST include:
```
Co-Authored-By: Antigravity AI Agent <noreply@google.com>
```
