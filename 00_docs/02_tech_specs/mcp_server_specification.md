# 📄 Especificação Técnica: Servidor MCP Nativo (`synapse-mcp-server`)

## 1. Visão Geral
O **Servidor MCP Nativo do Synapse Engine** é uma implementação em Node.js puro do **Model Context Protocol (MCP)** operando sobre o transporte `stdio` por **JSON-RPC 2.0**.

Seu objetivo é expor capacidades de consulta topológica de AST (**Graphify**) e telemetria de governança (**TDD Gate & State**) como ferramentas executáveis pela IDE Antigravity / Claude Desktop com impacto residual de tokens.

---

## 2. Interface de Comunicação & Protocolo IPC

* **Transporte:** Stdio (Standard Input / Standard Output)
* **Formato:** JSON-RPC 2.0 minificado por linha (newline-delimited JSON)
* **Executável:** `bin/synapse-mcp-server.js`

---

## 3. Ferramentas Expostas (`tools/list`)

### 1. `graphify_get_deps`
* **Descrição:** Retorna as dependências diretas (módulos importados) e chamadores (módulos que importam) de um arquivo específico.
* **Argumentos:** `targetFile` (string, caminho relativo do arquivo).
* **Exemplo de Resposta:**
  ```json
  {
    "target": "bin/synapse-cli.js",
    "found": true,
    "dependencies": ["bin/state-manager.js", "bin/tdd-gate.js"],
    "callers": []
  }
  ```

### 2. `graphify_get_impacted_tests`
* **Descrição:** Retorna os arquivos de teste unitários impactados quando um arquivo de produção é alterado.
* **Argumentos:** `targetFile` (string, caminho relativo).

### 3. `graphify_check_circular`
* **Descrição:** Executa algoritmo de detecção de ciclos no grafo AST (`graphify-out/graph.json`) para prevenir dependências circulares.
* **Argumentos:** Nenhum.

### 4. `synapse_tdd_status`
* **Descrição:** Consulta o estado de telemetria local (`.agents/state.json`) retornando a persona ativa, alvo cirúrgico de edição e status de validação TDD.
* **Argumentos:** Nenhum.

---

## 4. Benchmark de Performance & Redução de Tokens

| Métrica | Leitura de Arquivo Bruto (`graph.json`) | Servidor MCP Nativo (`stdio`) | Ganho de Eficiência |
| :--- | :--- | :--- | :--- |
| **Tokens Consumidos** | ~59.970 tokens | **58 tokens** | **99.90% de Redução** |
| **Tamanho do Payload** | 234,26 KB | **0,23 KB** | **1.034x Menor** |
| **Tempo de Resposta** | Dependente de I/O | **0.810 ms** | **Sub-Milissegundo** |

---

## 5. Como Executar e Testar

```bash
# Iniciar o servidor stdio
synapse mcp start

# Executar o benchmark automatizado no Jest
synapse mcp benchmark
```
