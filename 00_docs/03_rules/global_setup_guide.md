# 🌐 Guia de Configuração Global do Synapse Engine

Este guia descreve de forma transparente o funcionamento da governança global da IDE e detalha como configurar o ecossistema manualmente, garantindo controle total sobre as alterações realizadas na sua máquina.

---

## 🏛️ 1. Como Funciona a Customização Global

O agente de IA (Antigravity) gerencia regras globais que são carregadas logo na **primeira inicialização do contexto de cada chat**. Essas regras ficam localizadas no diretório do usuário:

*   **Caminho do Windows:** `C:\Users\<Seu-Usuario>\.gemini\config\`

### Arquivos Críticos de Configuração:
1.  **`AGENTS.md` (A Alma do Agente):** Este arquivo central define as regras e restrições metodológicas obrigatórias (como o *Protocolo JIT-Skills* e a *Bilingual Rule*). Ele é lido antes de qualquer arquivo local do seu repositório de trabalho.
2.  **`skills.json` (Registro de Auto-Descoberta):** Arquivo que instrui a IDE sobre quais caminhos de diretórios externos contêm conjuntos de habilidades (*skills*) adicionais que devem ser incorporados ao raciocínio operacional do agente.

---

## 📦 2. O Repositório de Habilidades Compartilhado (`AG_SKILLS_PATH`)

Para manter o ecossistema modular e limpo, todas as ferramentas e guias especializados offline (ex: `postgres-best-practices`, `qa`, `senior-architect`) residem em um diretório compartilhado configurado no sistema. 

Por padrão, o Synapse utiliza a variável de ambiente **`AG_SKILLS_PATH`** para localizar este diretório. Caso não esteja configurada, o sistema adota os seguintes caminhos padrão (fallbacks):
*   **No Windows:** `C:\ag-skills\`
*   **No Unix/macOS:** `~/ag-skills/`

Este diretório deve ser tratado como um **repositório Git independente**. Ele pode ser compartilhado com times ou clonado a partir de um repositório central de skills no GitHub, permitindo atualização e extensão de habilidades sem alterar os códigos comerciais de aplicação.

---

## 🛠️ 3. Passo a Passo do Setup Manual (Alternativa à CLI)

Se você preferir não utilizar o comando automático `synapse setup --global`, pode realizar todo o setup manualmente seguindo estes passos:

### Passo A: Criar a Estrutura de Pastas
1.  Navegue até `C:\Users\<Seu-Usuario>\` e crie a pasta `.gemini` caso não exista.
2.  Dentro dela, crie a pasta `config` (caminho final: `C:\Users\<Seu-Usuario>\.gemini\config`).
3.  Crie a pasta `skills` dentro de `config` (`C:\Users\<Seu-Usuario>\.gemini\config\skills`).

### Passo B: Injetar Regras Globais (`AGENTS.md`)
Crie o arquivo `AGENTS.md` dentro de `C:\Users\<Seu-Usuario>\.gemini\config\` com o seguinte conteúdo:

```markdown
# 🌐 Antigravity Global Agent Rules
This file contains the global rules and behavioral guidelines for the Antigravity AI Agent.

<RULE[bmad_core]>
# BMAD Core Methodology (Global AI Agent Rule)
- Zero-Pollution: Your primary source of truth is the project's documentation. Do NOT rely on ephemeral chat history.
- Read Before Coding: Before altering source code, you MUST actively search for and read the relevant specifications.
- The Bilingual Rule: Chat with USER, walkthrough.md, implementation_plan.md in Portuguese (PT-BR). Code and everything else in English (EN-US).
- Privacy & Security: NEVER hardcode API keys, passwords, or tokens. All secrets reside in .env files.
- Persona Shift Loop: PM -> Architect -> Developer -> QA using state.json local telemetry.
</RULE[bmad_core]>

<RULE[bmad_jit_skills_protocol]>
# Protocolo JIT-Skills (Seleção Inteligente de Habilidades Offline)
O agente deve operar sob o seguinte fluxo cognitivo em cada início de conversa ou nova tarefa complexa:
1. Diagnóstico Cognitivo: Analisar se a tarefa envolve planejamento, código, testes, etc.
2. Consulta ao Catálogo: Consultar o catálogo mestre de indexação utilizando a ferramenta correspondente.
3. Carregamento Offline: Ler o arquivo SKILL.md correspondente a partir do diretório de habilidades globais (ex: C:\ag-skills\<nome-da-skill>\SKILL.md ou caminho configurado pela variável de ambiente AG_SKILLS_PATH).
4. Transparência: Notificar o usuário sobre quais habilidades offline foram incorporadas.
</RULE[bmad_jit_skills_protocol]>
```

### Passo C: Configurar o Mapeador de Skills (`skills.json`)
Crie o arquivo `skills.json` dentro de `C:\Users\<Seu-Usuario>\.gemini\config\` com o seguinte conteúdo JSON, apontando para o seu diretório de habilidades (exemplo usando o caminho padrão do Windows):

```json
{
  "entries": [
    { "path": "C:\\ag-skills" }
  ]
}
```

Isso instruirá a IDE a ler nativamente todas as habilidades armazenadas na pasta indicada.

---

## 💻 4. Verificação do Setup

Para confirmar que seu setup (manual ou automático via CLI) foi aplicado corretamente, inicie uma nova sessão do chat da IDE e digite:
> *"Quais habilidades você tem carregadas em seu escopo central?"*

O agente deverá responder com base nas habilidades registradas no catálogo mestre offline da pasta `C:\ag-skills\ag_master_index\SKILL.md`.
