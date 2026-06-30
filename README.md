# ⚡ Synapse Engine V2

**Synapse Engine** é um framework de linha de comando (CLI) em Node.js projetado para orquestração de desenvolvimento assistido por IA. Ele implementa o Harness de automação local, governança baseada na metodologia **BMAD (Breakthrough Method for Agile AI-Driven Development)**, redução crítica de tokens (Context Sharding), e integração com o mapeamento topológico **Graphify**.

---

## 🚀 Como Instalar

Como o Synapse Engine é um pacote Node.js CLI hospedado no GitHub, você pode instalá-lo de forma global no terminal:

```bash
npm install -g git+https://github.com/LuGuBo/Synapse-Engine.git
```

ou executá-lo de forma temporária sob demanda utilizando `npx` (sem precisar instalar nada de forma permanente):

```bash
npx git+https://github.com/LuGuBo/Synapse-Engine.git init
```

---

## 🛠️ Comandos Disponíveis

A CLI expõe comandos fáceis e padronizados para gerenciar o ecossistema:

### 1. `synapse init`
Inicializa o framework no seu repositório de projeto atual.
*   Cria a pasta local de telemetria `.agents/` (no plural).
*   Injeta o arquivo de estado `.agents/state.json` com os valores padrão.
*   Copia as personas core dos agentes para `.agents/agents/`.
*   Injeta os arquivos de governança local `CLAUDE.md` e `AGENTS.md` na raiz do projeto.
*   Configura os scripts npm de atalho no seu `package.json` local.
*   Verifica a instalação do **Graphify** no sistema e roda o primeiro mapeamento de dependências.

```bash
synapse init
```

### 2. `synapse update`
Atualiza os executáveis e as personas do Harness local do projeto atual a partir da última versão do repositório mestre do GitHub. Mantém intacto o seu progresso local em `state.json`.

```bash
synapse update
```

### 3. `synapse setup --global`
Configura de forma automatizada a pasta centralizada do usuário (`~/.gemini/config/`) injetando a governança global (`AGENTS.md`) e vinculando o repositório centralizado de skills offline em `C:\AG SKILLS` ao arquivo `skills.json` da IDE.

```bash
synapse setup --global
```

*Nota: Veja o [Guia de Setup Global](00_docs/global_setup_guide.md) para realizar esses passos manualmente de forma transparente.*

### 4. `synapse status [args]`
Consulta ou atualiza o estado local do Harness (gerencia sprint ativo, persona atual e meta cirúrgica no `.agents/state.json`).

```bash
synapse status show
synapse synapse status set persona DEVELOPER
synapse synapse status set target backend/app/main.py 10 50
```

### 5. `synapse tdd`
Executa o portão automatizado de validação TDD. Garante que qualquer arquivo de produção staged no Git tenha um teste correspondente e que o status de validação no `state.json` esteja correto.

```bash
synapse tdd
```

---

## 🏛️ Documentação de Arquitetura
Consulte os detalhes da evolução do framework em [synapse_engine_v2_architecture.md](00_docs/synapse_engine_v2_architecture.md).
Consulte o guia de onboarding manual em [global_setup_guide.md](00_docs/global_setup_guide.md).
