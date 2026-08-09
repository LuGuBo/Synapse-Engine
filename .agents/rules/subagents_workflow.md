# Subagent-Driven Persona Execution & Context Isolation Policy

## 1. Core Principle & Activation Gate
To eliminate sycophancy, identity-driven confirmation bias, and context bloat across development phases:
- **Trigger Condition:** All tasks classified as medium to high complexity (features, architectural redesigns, non-trivial refactorings, or TDD implementation cycles) MUST execute under the `subagent-driven-development` protocol.
- **Trivial Bypass:** Simple one-off tasks (formatting, syntax fixes, minor doc tweaks) MAY remain in the single-session direct loop.

## 2. Supreme Orchestrator Role
- The main conversation agent operates strictly as the **Supreme Orchestrator**.
- The Orchestrator MUST NOT execute implementation code directly for complex tasks. Instead, it prepares task briefs, passes disk artifacts (`SPEC.md`, `PLAN.md`), and dispatches fresh, isolated subagents for each persona phase.

## 3. Clean-Room Persona Handoffs (Zero Context Leakage)
Every persona invocation MUST operate with an isolated, fresh context window:
1. **PM Phase (Product Manager):** Dispatches subagent with user requirements and `workspace_knowledge.md` to produce `SPEC.md`.
2. **Architect Phase:** Dispatches subagent with `SPEC.md` and AST graph context (`graphify query`) to produce `implementation_plan.md` with explicit `surgical_targets`.
3. **Developer Phase:** Dispatches subagent with `PLAN.md` to write source code and passing unit tests in `.playground/` or surgical target files.
4. **QA Engineer Phase (Adversarial):** Dispatches subagent with source code, tests, `SPEC.md`, and the `anti-sycophancy` skill. The QA subagent MUST NOT inherit the Developer's conversation history or `PLAN.md` rascunhos. It evaluates the implementation against `SPEC.md` with zero performative validation.

## 4. State Persistence & Memory Ledger
- Since context windows are isolated per subagent, state synchronization MUST be maintained strictly through disk artifacts.
- Subagent progress, step rulings, and adjudication results MUST be logged in `.playground/subagent_ledger.md`.

## 5. Live Progress Narration Protocol (Chat Status Table)
- The Orchestrator MUST output a Markdown **Active Agent Progress Table** in the main chat response before and after delegating tasks to subagents.
- This gives the human operator complete visibility into active persona states, subagent tasks, and handoff progress without reading internal logs.
- Format Example:
```markdown
### 🔄 Active Agent Execution Progress
| Persona / Subagent | Status | Current Action / Target |
| :--- | :--- | :--- |
| 📋 **PM** | ✅ Complete | Scope defined in `SPEC.md` |
| 🏗️ **Architect** | ✅ Complete | Targets defined in `PLAN.md` |
| 💻 **Developer Subagent** | ⚙️ In Progress | Refactoring `src/core/harness.ts` |
| 🛡️ **QA Subagent** | ⏳ Pending | Awaiting sandbox verification |
```
