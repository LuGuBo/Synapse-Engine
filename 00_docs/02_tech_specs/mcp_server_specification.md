# 📄 Especificação Técnica: Servidor MCP Nativo (`synapse-mcp-server`)

## 1. Visão Geral & Arquitetura
O **Servidor MCP Nativo do Synapse Engine** é uma implementação em Node.js puro e ultraleve do **Model Context Protocol (MCP)**, operando sobre o transporte `stdio` via **JSON-RPC 2.0** sem dependências externas.

Seu objetivo é expor capacidades de consulta topológica de AST (**Graphify**), telemetria de governança BMAD (**TDD Gate & State**), validações de segurança OWASP, busca de habilidades JIT e seleção de hardware acelerado para agentes da IDE Antigravity / Claude Desktop / Google Antigravity SDK com consumo residual de tokens.

---

## 2. Interface de Comunicação & Protocolo Stdio IPC

* **Transporte:** Stdio (`process.stdin` / `process.stdout`)
* **Formato:** JSON-RPC 2.0 por linha (newline-delimited JSON)
* **Executável:** `bin/synapse-mcp-server.js`
* **Versão do Protocolo MCP:** `2024-11-05`

---

## 3. Catálogo de Ferramentas Expostas (`tools/list`)

O servidor expõe **13 ferramentas** com anotações comportamentais padronizadas:

### 1. `graphify_get_deps`
* **Descrição:** Retorna as dependências diretas (módulos importados) e chamadores (módulos que importam) de um arquivo/nó da AST.
* **Argumentos (`inputSchema`):**
  * `targetFile` (string, obrigatório): Caminho relativo do arquivo alvo.
* **Anotações:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 2. `graphify_get_impacted_tests`
* **Descrição:** Retorna os arquivos de teste unitários impactados por alterações no arquivo de produção.
* **Argumentos (`inputSchema`):**
  * `targetFile` (string, obrigatório): Caminho relativo do arquivo alterado.
* **Anotações:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 3. `graphify_check_circular`
* **Descrição:** Executa algoritmo de detecção de ciclos no grafo AST (`graphify-out/graph.json`) para prevenir dependências circulares.
* **Argumentos (`inputSchema`):** Nenhum.
* **Anotações:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 4. `synapse_tdd_status`
* **Descrição:** Consulta o estado de telemetria local (`.agents/state.json`) retornando a persona ativa, alvo cirúrgico de edição e status de validação TDD.
* **Argumentos (`inputSchema`):** Nenhum.
* **Anotações:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 5. `synapse_shift_persona`
* **Descrição:** Altera a persona ativa no estado de telemetria local (`.agents/state.json`).
* **Argumentos (`inputSchema`):**
  * `active_persona` (string, obrigatório): Nome da persona (`PM`, `ARCHITECT`, `DEVELOPER`, `QA`, `BOSS`).
* **Anotações:** `readOnlyHint: false`, `idempotentHint: false`, `destructiveHint: false`.

### 6. `synapse_set_target`
* **Descrição:** Define o escopo do alvo cirúrgico de edição (arquivo e faixa de linhas) em `.agents/state.json`.
* **Argumentos (`inputSchema`):**
  * `file_path` (string, obrigatório): Caminho relativo do arquivo alvo.
  * `line_range_start` (number, opcional): Linha inicial (1-indexed).
  * `line_range_end` (number, opcional): Linha final (1-indexed).
* **Anotações:** `readOnlyHint: false`, `idempotentHint: false`, `destructiveHint: false`.

### 7. `synapse_generate_audit_tables`
* **Descrição:** Gera o trecho em Markdown com as tabelas de auditoria obrigatórias de personas e skills para inserção em `walkthrough.md`.
* **Argumentos (`inputSchema`):**
  * `activePersona` (string, opcional): Nome da persona a ser exibida.
  * `skillsUsed` (array de strings, opcional): Lista de skills invocadas.
* **Anotações:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 8. `synapse_scan_secrets`
* **Descrição:** Varre a árvore do workspace procurando vazamentos de credenciais (chaves AWS, GitHub tokens, senhas) segundo padrões OWASP.
* **Argumentos (`inputSchema`):**
  * `response_format` (string, opcional, enum: `['markdown', 'json']`, default: `'markdown'`).
* **Anotações:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 9. `synapse_get_clean_diff`
* **Descrição:** Retorna o resumo estatístico limpo das alterações em staging via Git.
* **Argumentos (`inputSchema`):** Nenhum.
* **Anotações:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 10. `synapse_search_skills`
* **Descrição:** Busca manifestos `SKILL.md` offline no diretório central (`C:\ag-skills`), global (`~/.gemini/config/skills`) e local (`.agents/skills`).
* **Argumentos (`inputSchema`):**
  * `query` (string, opcional): Termo de busca ou palavra-chave.
* **Anotações:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 11. `synapse_context_health_check`
* **Descrição:** Valida a saúde do contexto (arquivos grandes >500 linhas e integridade do `.gitignore`).
* **Argumentos (`inputSchema`):**
  * `response_format` (string, opcional, enum: `['markdown', 'json']`, default: `'markdown'`).
* **Anotações:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 12. `synapse_hardware_status`
* **Descrição:** Detecta especificações de CPU/GPU e provedor ativo de aceleração de IA (DirectML, NPU, CUDA).
* **Argumentos (`inputSchema`):** Nenhum.
* **Anotações:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

### 13. `synapse_select_device`
* **Descrição:** Seleciona dinamicamente o dispositivo ideal de execução (CPU vs GPU) com base na carga de trabalho e payload.
* **Argumentos (`inputSchema`):**
  * `workloadType` (string, opcional): Tipo de workload (`mcp_ipc`, `ast_query`, `batch_embeddings`, `neural_inference`, `auto`).
  * `payloadSizeKb` (number, opcional): Tamanho estimado do payload em KB.
  * `override` (string, opcional): Override explícito (`cpu` ou `gpu`).
* **Anotações:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

---

## 4. Protocolo de Recursos (`resources/list` & `resources/read`)

O servidor expõe recursos estáticos e dinâmicos com minificação de tokens em tempo de execução:

### URIs de Recursos Suportados:
1. `skills://<skill-name>`: Retorna o manifesto `SKILL.md` da habilidade informada (buscando no vault central, global ou local) minificado para economia de tokens.
2. `state://current`: Retorna o conteúdo JSON da telemetria de estado local (`.agents/state.json`).
3. `graph://topology`: Retorna um resumo conciso da topologia do grafo AST (`nodesCount`, `edgesCount`, lista de módulos).

---

## 5. Integração com Google Antigravity SDK

Para conectar o `synapse-mcp-server` a robôs autônomos criados com o **Google Antigravity SDK**:

### Python SDK Example:
```python
from google.antigravity import Agent, LocalAgentConfig, policy, types

mcp_servers = [
    types.McpStdioServer(
        command="node",
        args=["bin/synapse-mcp-server.js"]
    )
]

# Configuração de permissões estritas (Safety Policy)
policies = [
    policy.confirm_run_command(),
    policy.allow("synapse_scan_secrets"),
    policy.allow("graphify_get_deps"),
    policy.allow("synapse_shift_persona")
]

config = LocalAgentConfig(mcp_servers=mcp_servers, policies=policies)

async with Agent(config) as agent:
    response = await agent.chat("Verifique as dependências do arquivo bin/synapse-cli.js via MCP.")
    print(await response.text())
```

---

## 6. Benchmark de Performance & Redução de Tokens

| Métrica | Leitura de Arquivo Bruto (`graph.json`) | Servidor MCP Nativo (`stdio`) | Ganho de Eficiência |
| :--- | :--- | :--- | :--- |
| **Tokens Consumidos** | ~59.970 tokens | **58 tokens** | **99.90% de Redução** |
| **Tamanho do Payload** | 234,26 KB | **0,23 KB** | **1.034x Menor** |
| **Tempo de Resposta** | Dependente de I/O | **0.810 ms** | **Sub-Milissegundo** |

---

## 7. Comandos de Execução e Testes

```bash
# Iniciar o servidor Stdio manualmente
node bin/synapse-mcp-server.js

# Executar a suíte de testes unitários e benchmark no Jest
npx jest tests/synapse_mcp_benchmark.test.js
```
