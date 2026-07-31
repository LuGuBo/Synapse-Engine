# 🌐 Synapse Engine Global Setup Guide

This guide describes the operation of the global IDE governance system and details how to manually configure the ecosystem, ensuring full control over machine configurations.

---

## 🏛️ 1. How Global Customization Works

The AI agent (Antigravity) manages global rules loaded upon the **first context initialization of every chat session**. These rules reside in the user's configuration directory:

*   **Windows Path:** `C:\Users\<Your-Username>\.gemini\config\`

### Critical Configuration Files:
1.  **`AGENTS.md` (Agent Governance Core):** Central file defining mandatory methodological rules and constraints (such as the *JIT-Skills Protocol* and the *Bilingual Rule*). It is evaluated before any local workspace repository file.
2.  **`skills.json` (Auto-Discovery Registry):** Configuration instructing the IDE which external directory paths contain additional skill packages to incorporate into the agent's reasoning scope.

---

## 📦 2. Shared Offline Skills Vault (`AG_SKILLS_PATH`)

To keep the ecosystem modular and decoupled, all offline tools and domain guides (e.g., `postgres-best-practices`, `qa`, `senior-architect`) reside in a system-wide shared directory.

By default, Synapse evaluates the **`AG_SKILLS_PATH`** environment variable to locate this directory. If unset, standard fallbacks apply:
*   **Windows:** `C:\ag-skills\`
*   **Unix/macOS:** `~/ag-skills/`

This directory should be treated as an **independent Git repository**. It can be shared across teams or cloned from a central GitHub skills repository, enabling skill updates and extensions without mutating application codebases.

---

## 🛠️ 3. Manual Setup Step-by-Step (CLI Alternative)

If you prefer not to use the automated `synapse setup --global` command, execute manual setup via the following steps:

### Step A: Directory Structure Creation
1.  Navigate to `C:\Users\<Your-Username>\` and create `.gemini` if missing.
2.  Create `config` inside it (`C:\Users\<Your-Username>\.gemini\config`).
3.  Create `skills` inside `config` (`C:\Users\<Your-Username>\.gemini\config\skills`).

### Step B: Global Rules Injection (`AGENTS.md`)
Create `AGENTS.md` inside `C:\Users\<Your-Username>\.gemini\config\` with the following content:

```markdown
# 🌐 Antigravity Global Agent Rules
This file contains the global rules and behavioral guidelines for the Antigravity AI Agent.

<RULE[bmad_core]>
# BMAD Core Methodology (Global AI Agent Rule)
- Zero-Pollution: Your primary source of truth is the project's documentation. Do NOT rely on ephemeral chat history.
- Read Before Coding: Before altering source code, you MUST actively search for and read the relevant specifications.
- The Bilingual Rule: Chat with USER, walkthrough.md, implementation_plan.md in Portuguese (PT-BR). Code and everything else in English (EN-US).
- Privacy & Security: NEVER hardcode API keys, passwords, or tokens. All secrets reside in .env files.
- Persona Shift Loop: PM -> Architect -> Developer -> QA using state.json local telemetry.
</RULE[bmad_core]>

<RULE[bmad_jit_skills_protocol]>
# JIT-Skills Protocol (Smart Offline Skill Selection)
The agent operates under the following cognitive workflow at the start of every session or complex task:
1. Cognitive Diagnosis: Analyze whether the task involves planning, code, testing, etc.
2. Catalog Query: Search the master index catalog using the corresponding tool.
3. Offline Load: Read the target SKILL.md manifest from the global skills directory.
4. Transparency: Explicitly report which offline skills were loaded in the walkthrough report.
</RULE[bmad_jit_skills_protocol]>
```

### Step C: Skill Mapper Configuration (`skills.json`)
Create `skills.json` inside `C:\Users\<Your-Username>\.gemini\config\` with the following JSON content:

```json
{
  "entries": [
    { "path": "C:\\ag-skills" }
  ]
}
```

---

## 💻 4. Setup Verification

To confirm setup completion (manual or automated via CLI), start a new IDE chat session and query:
> *"Which offline skills are registered in your central scope?"*

The agent will respond based on the skills indexed in `C:\ag-skills\ag_master_index\SKILL.md`.

