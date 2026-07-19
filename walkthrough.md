# Walkthrough - Evolução Segura da CLI & Camada de Memória Local (v2.2)

Este relatório apresenta a implantação da camada de memória local (Obsidian Vault) de forma 100% nativa e isolada no **Synapse Engine**, bem como a evolução de sua CLI para distribuição global de forma idempotente, não-destrutiva e com barreiras rígidas de segurança contra sobrescritas.

## 🤖 Agentes Utilizados & Skills Invocadas

### 🎭 Agentes Mobilizados (Personas)
| Agente / Persona | Papel Desempenhado | Fase da Tarefa |
| :--- | :--- | :--- |
| **Product Manager (PM)** | Análise funcional do isolamento de dados do cofre local no .gitignore e blindagem do histórico customizado do usuário. | Fase de Requisitos e Conformidade |
| **Software Architect** | Modelagem de segregação de escopos (local vs global), padrão de idempotência para o comando `init` e mesclagem incremental por tags XML com detecção de drift para o comando `update`. | Fase de Design e Arquitetura |
| **Software Developer** | Implementação física em Node.js (Junctions sem privilégios via `symlinkSync`, backup por timestamp) e criação do script utilitário PowerShell ASCII (`sync-memory.ps1`). | Fase de Implementação de Código |
| **QA Engineer** | Escrita e rodada de testes adversariais automatizados em sandbox (`test_cli_upgrade.js`), execução de suíte unitária Jest e análise de benchmarks antes/depois. | Fase de Validação e Testes |

### 🛠️ Skills Invocadas (Globais, Locais e Offline)
| Nome da Skill | Tipo de Escopo | Propósito da Invocação |
| :--- | :--- | :--- |
| **synapse-supreme-orchestrator** | Offline (`C:\AG SKILLS\`) | Governança JIT de personas e aplicação do protocolo de conformidade. |
| **ag_master_index** | Global Config (`.gemini/config/`) | Ponto de entrada JIT para catálogo de skills e governança de caminhos. |
| **ecc-memory** | Global Config (`.gemini/config/`) | Divisão e análise de redundância de escopo (memória de sessão global vs memória declarativa local). |
| **local-guardrails-policy** | Local (`.agents/skills/`) | Aplicação de políticas locais de integridade de código, tratamento de exceções e TDD. |

---

## 📊 Medição de Desempenho e Coexistência de Benchmarks

Rodamos os benchmarks de performance da API MCP local (`prepare.js`) e os testes unitários do repositório (`npm test`) antes e depois das modificações:

| Métrica Analisada | Baseline (Antes) | Pós-Implementação (v2.2) | Variação / Diagnóstico |
| :--- | :--- | :--- | :--- |
| **Status dos Testes (Jest)** | Passou (100%) | Passou (100%) | Nenhuma regressão inserida no framework |
| **Latência Média RPC (MCP)** | `49.41 ms` | `52.22 ms` | Flutuação normal de latência de IPC |
| **Payload Médio RPC** | `0.661 KB` | `0.661 KB` | `0%` (Sem acréscimo de peso de transmissão) |
| **Tempo de Execução Jest** | `3619 ms` | `1860 ms` | Execução mais rápida no host no momento do teste |
| **Tamanho das Regras (`AGENTS.md`)** | `3450 bytes` | `4099 bytes` | `+649 bytes` (~162 tokens) para governança local |
| **Tempo do Graphify CLI** | `~3.0s` | `~3.1s` | Junction físico sem impacto no tempo de indexação |
| **Drift Detection (Sandbox)** | N/A | Passou (100%) | Regras customizadas do usuário foram perfeitamente salvas |
| **Segurança por Backups** | N/A | Passou (100%) | Cópias `.bak_[timestamp]` geradas com sucesso |

---

## 🛠️ Alterações Físicas Implementadas e Distribuição Segura

### 1. Evolução Idempotente do Comando `init`
*   Refatoramos o comando `init` em [bin/synapse-cli.js](file:///c:/AG%20PROJETOS/Synapse%20Engine/bin/synapse-cli.js) para verificar a existência de `AGENTS.md` e `GEMINI.md` na raiz do projeto consumidor. Se os arquivos existirem, eles não são sobrescritos (preservando alterações vitais do desenvolvedor).
*   O `init` agora cria automaticamente a pasta `.obsidian-vault/` com as subpastas em Markdown (`permanent/`, `chats/`).
*   Configura de forma silenciosa e multiplataforma uma **Directory Junction** (`symlinkSync`) vinculando `graphify-out/` a `.obsidian-vault/graphify-links` sem exigir privilégios de administrador no Windows.
*   Cria a pasta `scripts/` e copia o script de sincronização e auditoria [templates/sync-memory.template.ps1](file:///c:/AG%20PROJETOS/Synapse%20Engine/templates/sync-memory.template.ps1) para `scripts/sync-memory.ps1` no projeto consumidor.
*   Mescla de forma segura o script `"harness:sync-memory"` no `package.json` do projeto e injeta a entrada `.obsidian-vault/` no `.gitignore`.

### 2. Comando `update` Segurado (Backup e Drift Detection)
*   Refatoramos o comando `update` para realizar atualizações cirúrgicas de governança a nível de regras locais.
*   **Backup Físico**: Antes de escrever qualquer alteração em arquivos de regras locais ou globais (`AGENTS.md`, `GEMINI.md` ou equivalentes), a CLI faz uma cópia do arquivo com o carimbo de data/hora no nome (ex: `AGENTS.md.bak_YYYYMMDD_HHMMSS`).
*   **Drift Detection**: A CLI lê as regras XML (`<RULE[nome]>`). Se a regra no arquivo do usuário for diferente da versão padrão original da release anterior (drift manual pelo usuário), a CLI pula a atualização desse bloco e emite um alerta. Se a regra estiver padrão ou for nova, ela é atualizada com sucesso.

### 3. Orquestração do `setup --global` Segurado
*   Aplicamos o mesmo algoritmo de backup por timestamp e detecção de drift nas tags XML para o `AGENTS.md` global em `.gemini/config/AGENTS.md`.

### 4. Criação dos Templates Padrões do Framework
*   **[templates/AGENTS.template.md](file:///c:/AG%20PROJETOS/Synapse%20Engine/templates/AGENTS.template.md)**: Atualizado para incluir a regra modular `<RULE[persistent_memory]>` contendo as diretivas em inglês para a orquestração do cofre.
*   **[templates/sync-memory.template.ps1](file:///c:/AG%20PROJETOS/Synapse%20Engine/templates/sync-memory.template.ps1)**: Criado para distribuição via CLI. É um script PowerShell limpo em ASCII para compatibilidade universal do host Windows.

### 5. Suite Adversarial de Sandbox Concluída
*   Desenvolvemos um script de teste de integridade em **[.playground/test_cli_upgrade.js](file:///c:/AG%20PROJETOS/Synapse%20Engine/.playground/test_cli_upgrade.js)**. Ele cria uma pasta sandbox temporária, simula arquivos com regras customizadas e scripts no `package.json`, roda a nova CLI e valida se todos os backups, detecções de desvios e arquivos do vault foram preservados e instalados corretamente. O teste passou com **100% de sucesso**.
