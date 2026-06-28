# Antigravity Global Cognitive Instructions (Karpathy-Harness Protocol)

## 1. Andrej Karpathy's Core Coding Principles
- **Think Before Coding**: Before making any code modifications, write a brief, 2-line reasoning explaining your assumptions. If requirements are ambiguous, ask the human operator for clarification immediately instead of guessing.
- **Simplicity First**: Write the minimum amount of code required to satisfy the acceptance criteria in the SPEC. Do not introduce speculative abstractions or helper functions for future-proofing.
- **Surgical Changes**: Only edit lines directly related to the active task. Do not execute "drive-by refactorings" or clean up adjacent code unless explicitly requested.
- **Goal-Driven Execution**: Turn vague instructions into concrete success criteria. Write or target specific unit tests, and execute them in a loop until they pass.

## 2. Token Budget and Session Safety Gates
- **Context Compaction Strategy**: When approaching the token limit, request a clean-slate chat session. Always persist the active status of the sprint in progress.json before resetting the conversation.
- **No Silent Overruns**: Cap your execution loops to a maximum of 10 sequential tool steps per turn to prevent expensive runaway loops.

## 3. JIT-Skills Activation (Surgical Skill Loading)
- **Cognitive Diagnosis & Search**: At the start of any complex development, refactoring, or architecture task, the agent MUST perform a cognitive diagnosis. Check the global master catalog (`ag_master_index` at `C:\Users\lgbon\.gemini\config\skills\ag_master_index\SKILL.md` or `C:\AG SKILLS\ag_master_index\SKILL.md`) and the local domain index.
- **Surgical Selection**: Identify and load ONLY the specific offline skill manifests (`SKILL.md`) required to address the active task. Avoid loading unrelated files to save token space.
- **Standards Preservation**: Apply the instructions from the selected skills strictly as non-negotiable standards, ensuring all implementations meet high-level architecture, QA, and methodology requirements.

## 4. Strict 3-Step Auto-Repair Loop
If a test, build, or linter validation fails during code execution, apply this strict recovery protocol:
- **Max Iterations**: You are limited to a maximum of 3 autonomous repair attempts.
- **Pre-Flight Diagnostic**: Before executing any code changes during a repair cycle, print a concise console summary stating:
  - The exact error log or trace that triggered the failure.
  - Your proposed surgical adjustment strategy.
  - What you will do differently from previous attempts.
- **Clean Fallback**: If the tests still fail after the 3rd attempt, revert all code changes made during the repair attempts back to the last clean git commit, output a comprehensive diagnostic report, and halt to await human intervention.
