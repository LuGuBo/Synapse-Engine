---
name: bmad-master
description: "BMAD Master Core Methodology for AI development. Establishes the supremacy of documentation, the bilingual protocol, and context sharding principles."
scope: global
always_on: true
---

# BMAD Master Core Methodology

This skill provides universal, project-independent guidelines for the BMAD (Breakthrough Method for Agile AI-Driven Development) methodology.

## 1. Informational Authority & Integration
* **Supremacy of Documentation:** Static documentation (written strictly under `00_docs/` in any project) overrides any historical chat conversations or memory. It serves as the primary source of truth.
* **No Code Changes without Spec Alignment:** No functional or mathematical code changes should be made unless the corresponding specification has been fully evaluated and aligned.

## 2. Bilingual Protocol
* **Logical Layer & Code:** All source code, syntax, variable names, database schemas, API routes, system rules, and technical logs must be written in **English (EN-US)**.
* **User-Facing Layer:** Interactive console outputs, UI copies, chat interfaces, and walkthrough reports must be localized in **Portuguese (PT-BR)** unless requested otherwise by the human operator.

## 3. Sandboxing & Temporary Environments
* All exploratory scripts, playground tasks, or temporary tests must live strictly inside a `.playground/` or `tmp/` folder. Do not pollute production or unit test suites.

## 4. Context Window Optimization (Surgical Actions)
* Limit token budget usage by avoiding loading large source files blindly.
* Perform surgical lookups: use target line numbers in `view_file` to only ingest the exact block needed for the current task.
