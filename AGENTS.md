# Synapse Engine Workspace and Skill Orchestration Guidelines


## 1. Codebase Navigation via Graphify
- **Map-First Querying**: Do not perform blind recursive text searches (e.g., recursive grep) over the codebase. You must inspect `./graphify-out/graph.json` first to understand module imports, dependencies, and connections.
- **Targeted Reading**: Use the extracted structural relationships inside the graph to open and read only the specific files impacted by the task.

## 2. Multi-Agent Orchestration via @blade-ai/boss-skill
- **Stateful Handoffs**: All multi-agent planning, architecture, and coding steps must be executed through the `/boss` runtime.
- **Dynamic Role Allocation**: Tailor agent invocation to minimize token costs and resource allocation:
  - For frontend-centric tasks containing UI modifications, invoke: `--roles core,ui` (PM, Architect, Developer, QA, UI Designer).
  - For backend/database/infrastructure tasks, invoke: `--roles core,devops` (PM, Architect, Developer, QA, DevOps).
  - For simple refactorings and bug fixes, limit execution to: `--roles core` (Architect, Developer, QA).
- **Offline Skills Repository Integration**: All agents operating under the `/boss` runtime MUST proactively check the global master index at `C:\Users\lgbon\.gemini\config\skills\ag_master_index\SKILL.md` or `C:\AG SKILLS\ag_master_index\SKILL.md` and the local domain index at `.agents/skills/harness_dynamic_index/SKILL.md`. They must load and execute the target offline skill manifest (`SKILL.md`) matching their active task before writing code or designing architectures to ensure strict alignment with existing engineering guidelines.
- **Audit-Ready Artifacts**: Ensure all step-by-step deliverables (PRDs, architecture documents, task sheets, and the final `walkthrough.md`) are written to and persisted inside the `.boss/<feature_name>/` workspace based on BMAD (Breakthrough Method for AI-Driven Development) standards. The `walkthrough.md` report MUST include dedicated sections listing the agents used and the specific offline, global, or local skills invoked during execution. If none were used, they must be explicitly marked as not used.

## 3. Strict Verification Gates
- **Compilation check**: No code changes shall be marked as complete without first running the workspace linter.
- **No circular references**: Reject any generated implementation that creates circular imports or breaks structural integrity as mapped by Graphify.
