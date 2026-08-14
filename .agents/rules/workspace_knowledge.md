---
trigger: always_on
description: "Local workspace rules for documenting changes and creating walkthroughs."
---

# Workspace Knowledge & Documentation Enforcement

This file establishes the rules for workspace-level documentation persistence and reporting for the **Aevum Kyber** project.

## 1. Documentation Integrity
- All project documentation must reside under the `./00_docs/` directory.
- Whenever a feature, architecture, decision, or codebase constraint is modified, the corresponding file in `./00_docs/` must be updated.
- Never let technical specifications, PRD parameters, or ADR definitions fall out of sync with the codebase.

## 2. Mandatory Delivery Walkthrough
- Every single task completion MUST generate or update a `walkthrough.md` file as an interactive User-Facing Artifact in the conversation's brain folder (`<appDataDir>\brain\<conversation-id>/walkthrough.md`). Do NOT generate it in the workspace root, as it is ignored by Git and clutters the directory.
- The walkthrough MUST be written in **Portuguese (PT-BR)**, as required by the Bilingual Protocol.
- It MUST contain the mandatory **Agent & Skill Trace** audit tables (Mobilized Agents/Personas and Invoked Skills) exactly as defined in the global rules.

## 3. Scope and Paths
- All references to the workspace files must be relative to the active workspace root.
- Local skills are located under `./.agents/skills/`.
