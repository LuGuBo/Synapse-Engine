---
status: Accepted
date: 2026-07-03
decision_maker: AI Agent & Tech Lead (LuGuBo)
---

# 0002. Implementação do Servidor MCP Nativo Stdio no Synapse Engine V2

## Context and Problem Statement

O **Synapse Engine V2** utiliza a topologia **Graphify** (`./graphify-out/graph.json`) e a telemetria local (`.agents/state.json`) para orquestrar o desenvolvimento via metodologia BMAD. 

Anteriormente, para consultar conexões entre arquivos ou verificar testes impactados, o agente de IA precisava ler o arquivo `graph.json` bruto. Em projetos de porte médio a grande, esse arquivo atinge mais de 200 KB (~60.000 tokens), sobrecarregando a janela de contexto da IA, gerando lentidão e custos desnecessários de tokens.

## Decision Outcome

* **Opção Escolhida:** Desenvolver um servidor MCP nativo e ultraleve em Node.js (`bin/synapse-mcp-server.js`) utilizando o protocolo padrão `stdio` (JSON-RPC 2.0) sem dependências externas npm.
* **Status:** Aceito (Accepted)

### Consequences

* **Good:**
  * **99.90% de Redução no Consumo de Tokens:** As respostas de dependência e testes caíram de ~60.000 tokens para **~58 tokens** por consulta.
  * **Latência Sub-Milissegundo (0.81 ms):** Execução via IPC `stdio` local ultrarrápida.
  * **Zero-Dependency:** Não adiciona nenhuma biblioteca de terceiros ao `package.json`, garantindo instalação limpa.
  * **Exportabilidade:** Registrado automaticamente no `~/.gemini/antigravity-ide/mcp_config.json` e exportável para outros repositórios via `synapse setup --global`.
* **Bad:**
  * Requer que o ambiente Node.js esteja presente na máquina do usuário para interpretar o executável `bin/synapse-mcp-server.js`.
