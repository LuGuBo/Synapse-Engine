# Local Agent Rules ({{PROJECT_NAME}})
This file contains the workspace-scoped rules and behavioral guidelines for the AI Agent in this repository.

<RULE[local_governance]>
# Local Governance Rules
- All codebase file changes must be validated by the `synapse tdd` gate tool.
- All work progress and active persona state transitions are tracked in `.agents/state.json`.
- Every task delivery must include a `walkthrough.md` in Portuguese containing the **Agent & Skill Trace** audit table matching the agents/personas used and the skills loaded from the repository/workspace catalog.
</RULE[local_governance]>

<RULE[task_weight_model_selection]>
# Dynamic Task Weight Model Selection & Quota Directive
- **Task Weight Classifier (Score 1-10)**: Before executing LLM operations, evaluate complexity weight via `synapse quota estimate`:
  - Score 1-2 (Ultra-Light - TDD tests, linters, logs, status): Use `Gemini 3.1 Flash Lite` / `Gemini 2.5 Flash Lite` (500 RPD budget).
  - Score 3-5 (Moderate - Modular code, UI components, single-file bugfixes): Use `Gemini 3.1 Flash`.
  - Score 6-8 (Heavy - AST graph refactoring, DB schemas, multi-file changes): Use `Gemini 3.1 Pro` / `Claude 3.7 Sonnet`.
  - Score 9-10 (Supreme - PRDs, Socratic `/grill-me`, System Architecture): Use `Gemini 3.1 Pro (Thinking)` / `Claude 3.7 Sonnet (Thinking)`.
- **Sliding Window & GCP Availability Verification**: Verify model active status in GCP matrix and current sliding window RPD/RPM limits. Automatically fall back to Flash Lite if high-tier limits reach 90%.
</RULE[task_weight_model_selection]>

<RULE[hardware_acceleration_protocol]>
# Tri-Silicon Hardware Acceleration Routing (CPU / GPU / NPU)
- **Workload Routing**: Route execution payloads dynamically using `synapse hardware`:
  - Fast-Path IPC, code parsing, AST queries -> **CPU** (ultra-low latency <0.5ms).
  - Heavy batch embeddings, neural inference, >1MB payloads -> **GPU** (DirectML / CUDA).
  - Continuous background tasks, INT8 quantized models -> **NPU** (VitisAI / Ryzen AI / DirectML NPU).
</RULE[hardware_acceleration_protocol]>

<RULE[persistent_memory]>
# Persistent Memory & Continuous Context Strategy
- **Pre-flight Architectural Read**: Before starting complex refactorings, system redesigns, or answering architectural queries, the agent MUST read business and domain notes in `.obsidian-vault/permanent/` using the local workspace file tools.
- **Session Serialization (Post-flight Write)**: Upon completing complex tasks, bugs, or feature milestones, the agent MUST write an atomic Markdown summary in `.obsidian-vault/chats/` detailing the implemented solutions, validation logic, and expected behaviors to preserve state across IDE sessions.
- **Isolate Personal Memory**: The `.obsidian-vault/` folder contains sensitive, session-specific local memory. It must never be committed to Git (enforced via `.gitignore`).
</RULE[persistent_memory]>

<RULE[anti_tautological_testing_protocol]>
# Global Quality & Real Testing Protocol (Zero False-Positive Directive)
- **Prohibition of Tautological Tests**: It is strictly forbidden to write tests that merely assert function existence, use fixed boolean assertions (`expect(true).toBe(true)`), or rely on mocks that mirror input without executing actual domain logic.
- **Mandatory Triple Vector Validation**: Every module or tool must provide tests covering:
  - Vector A (Real Positive Flow): Structured production-like data (full AST graphs, real disk files) with non-null, accurate outputs.
  - Vector B (Edge & Negative Handling): Null parameters, non-existent files, disconnected graph nodes, asserting controlled `isError: true` without crashing.
  - Vector C (State Integrity): State mutations (`.agents/state.json`, memory reads) verified by checking physical file persistence.
- **Minimum Module Test Gate**: No feature shall be declared complete without executing test suites and demonstrating zero regressions.
</RULE[anti_tautological_testing_protocol]>
