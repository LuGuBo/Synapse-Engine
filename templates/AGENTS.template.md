# Local Agent Rules ({{PROJECT_NAME}})
This file contains the workspace-scoped rules and behavioral guidelines for the AI Agent in this repository.

<RULE[local_governance]>
# Local Governance Rules
- All codebase file changes must be validated by the `synapse tdd` gate tool.
- All work progress and active persona state transitions are tracked in `.agents/state.json`.
- Every task delivery must include a `walkthrough.md` in Portuguese containing the **Agent & Skill Trace** audit table matching the agents/personas used and the skills loaded from the repository/workspace catalog.
</RULE[local_governance]>

<RULE[persistent_memory]>
# Persistent Memory & Continuous Context Strategy
- **Pre-flight Architectural Read**: Before starting complex refactorings, system redesigns, or answering architectural queries, the agent MUST read business and domain notes in `.obsidian-vault/permanent/` using the local workspace file tools.
- **Session Serialization (Post-flight Write)**: Upon completing complex tasks, bugs, or feature milestones, the agent MUST write an atomic Markdown summary in `.obsidian-vault/chats/` detailing the implemented solutions, validation logic, and expected behaviors to preserve state across IDE sessions.
- **Isolate Personal Memory**: The `.obsidian-vault/` folder contains sensitive, session-specific local memory. It must never be committed to Git (enforced via `.gitignore`).
</RULE[persistent_memory]>
