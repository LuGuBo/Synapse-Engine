# Workflow: Multi-Agent Boss Orchestrator (/boss)

Esse workflow aciona a orquestração multi-agente via **Boss CLI (`boss` / `@blade-ai/boss-skill`)**.

## Diretrizes Operacionais
1. **Foco**: Gerenciamento de ciclo de vida de sprints, orquestração de entregas e transição de estado entre personas.
2. **Execução da CLI**:
   - `boss run --roles core,ui` (para tarefas frontend)
   - `boss run --roles core,devops` (para tarefas backend/infra)
   - `boss run --roles core` (para refatorações e correções simples)
3. **Persistência de Artefatos**: Garantir a gravação de tarefas e logs em `.boss/<feature_name>/` e telemetria em `execution.json` e `.agents/state.json`.
