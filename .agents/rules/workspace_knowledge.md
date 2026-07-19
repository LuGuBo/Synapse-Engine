---
trigger: always_on
description: "Local workspace rules for documenting changes and creating walkthroughs."
---

# Workspace Knowledge & Documentation Enforcement

This file establishes the rules for workspace-level documentation persistence and reporting for the **Synapse Engine** project.

## 1. Documentation Integrity
- All project documentation must reside under `00_docs/` at `c:\AG PROJETOS\Synapse Engine\00_docs\`.
- Whenever a feature, architecture, decision, or codebase constraint is modified, the corresponding file in `00_docs/` must be updated.
- Never let technical specifications, PRD parameters, or ADR definitions fall out of sync with the codebase.

## 2. Mandatory Delivery Walkthrough
- Every single task completion MUST generate or update a `walkthrough.md` file in the root of the project: `c:\AG PROJETOS\Synapse Engine\walkthrough.md`.
- The walkthrough MUST be written in **Portuguese (PT-BR)**, as required by the Bilingual Protocol.
- It MUST contain the mandatory **Agent & Skill Trace** audit tables (Mobilized Agents/Personas and Invoked Skills) exactly as defined in the global rules.

## 3. Scope and Paths
- All absolute references to the workspace files must point strictly to `c:\AG PROJETOS\Synapse Engine\`.
- Local skills are located under `c:\AG PROJETOS\Synapse Engine\.agents\skills\`.
