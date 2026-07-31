# Synapse Engine: O Cérebro Global (Global Brain) & Graphify Ecosystem

## 1. Visão Geral
A reformulação da topologia de skills do Antigravity (Tri-Layer Topology) aliada à implantação do **Graphify Multi-Repo** cria uma fundação semântica e arquitetural centralizada. O `synapse-engine`, como orquestrador mestre (`synapse-supreme-orchestrator`), passa a consumir o grafo global (`.obsidian-global-vault`) para operar com consciência de todo o ecossistema `c:\ag-projetos`.

## 2. A Topologia Tri-Layer & Economia de Tokens (Benchmark)
**Problema Anterior (As-Is):**
A inclusão de skills do Obsidian (`obsidian-markdown`, `json-canvas`, etc.) no prompt inicial (Global Auto-Load) consumia aproximadamente **~6.000 tokens** de base em cada chamada, limitando a janela útil do Gemini e poluindo o contexto em tarefas que não exigiam documentação.

**Nova Arquitetura (To-Be - JIT Hook):**
As skills permanecem no cofre offline (`C:\ag-skills\`) e são acionadas apenas quando o `AGENTS.md` (via `ag_master_index`) exige. 
- **Economia de Contexto:** Redução de 6k tokens fixos para zero no startup.
- **Latência:** Redução do Time-To-First-Token (TTFT) devido ao cache de prompt menor.

## 3. O Grafo Multi-Repositório (`c:\ag-projetos\.obsidian-global-vault`)
A execução do comando unificado (cross-project) gera um mapa onde a dependência AST (Código) e a semântica (Documentos) se fundem em todos os projetos simultaneamente.

### 3.1. Melhorias Semânticas e de Pesquisa (GraphRAG vs Grep)
- **Descoberta de "God Nodes":** O motor agora sabe que o `state.json` do `synapse-engine` atua como nó central (God Node) conectando as transições de persona no `ag-lab`. Uma pesquisa via `grep` não entende essa hierarquia; o `graphify query` entende o "caminho mais curto" (Shortest Path) entre os dois conceitos.
- **Resolução de Ambiguidade:** Communities (Comunidades) detectadas pelo Graphify separam o que é código de orquestração (Synapse) do que é código de produto (Aevum).
- **Integração Obsidian:** O agente pode ler nativamente as anotações do Vault Global e traçar o histórico de arquitetura (`ADRs`).

## 4. Evolução do Synapse Engine (Próximos Passos)
Para beneficiar definitivamente o cérebro global do Antigravity:
1. **Synapse MCP Graphify Watcher:** Implementar um serviço background no `synapse-mcp-server` que rode `graphify --update --obsidian` recursivamente em `c:\ag-projetos` sempre que um PR for mergeado.
2. **Context Injection API:** O `synapse-supreme-orchestrator` passará a realizar uma query no `graphify-out/graph.json` central **antes** de responder qualquer dúvida sobre infraestrutura.
