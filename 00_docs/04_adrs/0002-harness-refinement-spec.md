# **Engenharia de Harness Avançada para Sistemas Multi-Agente: A Evolução do Método BMAD e a Integração Híbrida no Antigravity**

A engenharia de software governada por Inteligência Artificial atravessa um ponto de inflexão crítico. A indústria superou a fase inicial de geração estocástica de código — caracterizada por modelos que atuavam como meros assistentes de preenchimento automático — para adentrar a era arquitetural da Orquestração de Agentes e da Engenharia de Harness (Harness Engineering). Neste novo paradigma, o gargalo central do desenvolvimento não reside mais na velocidade de digitação de implementações sintáticas, mas sim na sofisticação do design de sistemas, na gestão implacável do contexto da janela de tokens, na definição de limites operacionais (guardrails), na automatização de ciclos de revisão e nas práticas de ambiente que permitem que modelos fundacionais operem com autonomia confiável e repetível.1  
O presente documento constitui um relatório exaustivo que disseca a anatomia do ecossistema Breakthrough Method for AI-Driven Development (BMAD) 3, rastreando sua maturação desde os seus primórdios metodológicos com o sistema restritivo CCDAF, passando pela heurística iterativa da habilidade grill-and-evolve, até o atual estado consolidado no projeto agora denominado **Synapse Engine** (anteriormente conhecido como bmadharness). O desígnio deste relatório é fornecer um arcabouço conceitual e prático de altíssima densidade — um verdadeiro "metaprompt" infraestrutural — preparado para ser ingerido diretamente por ambientes de desenvolvimento baseados em agentes (Agentic IDEs), com foco deliberado e explícito nas capacidades do Google Antigravity e na integração com o Claude Code.4  
A análise aprofundada a seguir resolve uma encruzilhada conceitual premente: o desafio de equilibrar uma configuração global de Harness — que deve ser aplicada de maneira universal e econômica a todos os projetos no ambiente do usuário — com a vastidão do repositório formador de conhecimento específico (Synapse Engine). O objetivo é evitar que este repositório se torne um "projeto adormecido" (bloatware conceitual) ou um poluente de contexto, transformando-o em uma forja de habilidades dinâmicas e de estado contínuo, orquestrada de maneira a garantir a máxima rentabilidade na codificação e a extrema mitigação de retrabalho.

## **1\. O Paradigma e a Filosofia da Engenharia de Harness**

Historicamente, agentes autônomos de codificação falham repetidamente em cenários de alta complexidade em repositórios reais devido a uma combinação de quatro fatores técnicos destrutivos: alucinação de escopo (onde o modelo expande a tarefa além do solicitado), degradação e saturação da janela de contexto (diluição de atenção devido ao excesso de arquivos carregados), perda de estado persistente entre sessões de terminal, e a completa ausência de critérios de aceitação automatizados rigorosos.7  
Ryan Lopopolo, proeminente pesquisador e membro da equipe técnica da OpenAI, formalizou a disciplina de "Engenharia de Harness" em publicações (acessíveis em [https://openai.com/index/harness-engineering/](https://openai.com/index/harness-engineering/)) e em seminários da indústria (tais como sua apresentação detalhada em((([https://www.youtube.com/watch?v=c8bE0cj7vHY](https://www.youtube.com/watch?v=c8bE0cj7vHY))))). Ele postula que a transição fundamental na engenharia de software contemporânea exige abandonar a implementação manual em favor da construção de infraestruturas nas quais o ser humano orienta estrategicamente (steers) e os agentes executam taticamente (execute).1 Dentro desta doutrina, um "harness" transcende severamente a noção simplista de um prompt extenso. O harness constitui o ambiente operacional total: a estrutura hierárquica do repositório, os manifestos de documentação, os pipelines de testes, os analisadores estáticos (linters), os agentes de revisão paralela, as verificações de Integração Contínua (CI) operando em background, e as ferramentas de interceptação que injetam as instruções corretas estritamente na fração de segundo em que o modelo necessita delas para tomar uma decisão. O modelo de Lopopolo argumenta que fornecer cegamente o repositório inteiro ao modelo fundacional ("just give the model the repo") não representa uma estratégia de implantação séria para ambientes de produção, exigindo, em vez disso, a limitação estrita da autonomia e a modelagem do contexto.9  
Andrej Karpathy complementa e expande essa visão infraestrutural ao identificar, documentar e combater ativamente os modos de falha cognitivos críticos intrínsecos aos Modelos de Linguagem de Grande Escala (LLMs). Karpathy, após transicionar grande parte do seu fluxo de trabalho para automação (conforme documentado em discussões da comunidade em [https://www.aibuilderclub.com/blog/karpathy-claude-md-rules](https://www.aibuilderclub.com/blog/karpathy-claude-md-rules)), observou que os modelos tendem a assumir premissas incorretas de forma silenciosa, abraçam a sobre-engenharia em detrimento de abstrações simples, e modificam proativamente código tangencial e ortogonal à tarefa principal.7 Para neutralizar esta entropia gerativa, ele codificou um conjunto de diretrizes de sistema que devem ser ancoradas no arquivo global de sistema.  
A formalização do modelo conceitual de restrição cognitiva de Karpathy atua diretamente na camada de raciocínio antes da emissão do código. A imposição destas regras não formata caracteres, mas muda a inclinação filosófica da predição de tokens.

| Princípio Operacional do Harness | Vetor de Mitigação de Falha | Aplicação no Ecossistema Antigravity |
| :---- | :---- | :---- |
| **Ask, don't assume** | Impede o modelo de iniciar implementações baseadas em alucinações sobre requisitos de negócio, arquiteturas ou APIs não documentadas. | O agente Antigravity é forçado a gerar uma interrupção de terminal ou um prompt de áudio pedindo clarificação caso a métrica de confiança sobre o escopo caia abaixo do limiar aceitável.7 |
| **Simplest solution first** | Previne a proliferação de padrões de design excessivamente complexos, injeção de dependências desnecessárias ou arquiteturas prematuras. | A avaliação da abstração (Abstract Syntax Tree) do código impõe a aceitação da menor complexidade ciclomática possível para resolver o ticket atual.7 |
| **Surgical Changes Only** | Evita o que é conhecido como "style drift" ou refatoração predatória, onde a IA destrói formatações adjacentes ou remove código legado por não compreender seu propósito indireto. | Modificações são restritas apenas aos nós do grafo de dependências explicitamente alocados na história do usuário. Código ortogonal permanece intocado, mesmo se sub-ótimo.7 |
| **Flag Uncertainty** | Mitiga o risco de inserção de vulnerabilidades de segurança ou gargalos de performance camuflados em código aparentemente funcional. | Exige que o LLM exteriorize explicitamente dúvidas matemáticas, lógicas ou de segurança antes de compilar os executáveis.11 |

A convergência dessas correntes filosóficas estruturais estabelece a fundação inabalável sobre a qual a evolução do Método BMAD foi construída. Agentes operando no interior do Antigravity não devem, sob nenhuma circunstância, agir em um vácuo interpretativo. Eles operam como engrenagens dentro de um trilho determinístico severamente governado por metadados de projeto, restrições de estado contínuo e grafos topológicos.

## **2\. A Evolução do Ecossistema: Da Rigidez Metodológica ao Hibridismo Dinâmico**

A trajetória do desenvolvimento assistido por inteligência artificial dentro deste ecossistema reflete, passo a passo, a maturação da própria engenharia de interação com modelos de linguagem. A compreensão de como transferir e delegar tarefas cognitivas complexas a instâncias computacionais evoluiu através de fases de estagnação e avanço (breakthroughs). Esta evolução é segmentada de maneira muito clara em quatro estágios metodológicos distintos, culminando na complexa encruzilhada arquitetural enfrentada presentemente.

### **2.1. Fase 1: O Princípio e o Paradigma Restritivo CCDAF**

Nos primeiros dias da integração de LLMs em fluxos de trabalho de código complexo, a estratégia predominante baseava-se em injetar a totalidade da lógica de negócios, regras de formatação e limites operacionais em um único e massivo prompt de sistema (zero-shot ou few-shot prompting). O paradigma denominado CCDAF representou a primeira tentativa sistemática de estruturar o caos inerente à geração livre.  
A arquitetura de prompt CCDAF operava enquadrando as tendências "tóxicas" do modelo (alucinação, deriva de escopo, invenção de falsas dependências) dentro de um arcabouço rígido de taxonomia de dados, restringindo suas vias de predição. A premissa era que o modelo precisava ser completamente engessado por formulários estruturados para produzir resultados úteis. Contudo, essa extrema rigidez do CCDAF gerou gargalos paralisantes. Os modelos de IA, ao serem encapsulados em diretrizes estáticas absolutas e desprovidos de capacidade de introspecção autônoma, falhavam miseravelmente ao confrontar refatorações orgânicas complexas que exigiam "saltos lógicos" fora do contexto taxionômico predefinido.1 A sobrecarga cognitiva de manter a forma do formulário destruía a capacidade do modelo de reter e resolver a real lógica computacional do projeto. O CCDAF estabeleceu o valor inestimável do formato e da ordem, mas expôs criticamente a necessidade intrínseca de mecanismos de feedback loop responsivos.

### **2.2. Fase 2: O Surgimento e a Dinâmica da Skill grill-and-evolve**

Para combater a estagnação gerada pela rigidez do CCDAF e a falta de raciocínio de segunda ordem dos modelos primitivos, a engenharia de prompts avançou para a implementação da habilidade (skill) conhecida como grill-and-evolve.4 Este desenvolvimento marcou um ponto de inflexão conceitual onde a comunidade transitou da "geração top-down determinística" para o modelo de "refinamento iterativo crítico mediado pelo próprio agente".  
A mecânica desta skill operava instruindo o LLM a particionar sua psique em um papel dual contínuo. Em uma primeira passada computacional, o modelo atuava como um auditor implacável (o "grill"), avaliando o código existente e até mesmo suas próprias proposições arquiteturais. O objetivo do "grill" era procurar agressivamente por falhas de segurança (como injeção de dependências não verificadas), gargalos de complexidade algorítmica (Big O assintótico pobre) e quebra de contratos de abstração ou dependências circulares. Posteriormente, na segunda passada computacional (o "evolve"), o modelo assumia a função de engenheiro de refatoração, aplicando patches cirúrgicos diretamente direcionados às vulnerabilidades identificadas na primeira fase.  
Essa etapa provou que agentes não apenas podem codificar, mas devem questionar ativamente suas premissas matemáticas e estruturais antes da escrita de arquivos em disco. As heurísticas fundamentais de Karpathy — de não assumir premissas ocultas e de trazer os "tradeoffs" (compromissos de design) à superfície de maneira explícita — encontraram sua primeira manifestação processual cíclica com o grill-and-evolve.13 Todavia, manter esta lógica bifásica complexa injetada de forma permanente no pre-prompt de cada transação consumia a janela de contexto de forma insustentável, esgotando rapidamente o "Token Budget" disponível para o código real do repositório.

### **2.3. Fase 3: A Consolidação e o Nascimento do Método BMAD**

O amadurecimento inevitável dessa trajetória resultou na formulação do Breakthrough Method for AI-Driven Development (Método BMAD), um ecossistema projetado e fundamentado através das diretrizes do C.O.R.E. Framework detalhado por Vishal Mysore.3  
O BMAD abandonou a ideia de um único prompt infinito e transformou o desenvolvimento de software em uma linha de montagem assíncrona, altamente estruturada e baseada em papéis especializados. Em vez de depender de heurísticas injetadas ad-hoc, o framework estruturou personas operacionais ágeis (Product Manager, Product Owner, Architect, Developer, QA, UX Expert, Scrum Master). Crucialmente, o método inseriu "handoffs" explícitos — que são os pontos de passagem de contexto restrito e responsabilidade demarcada entre os agentes, garantindo que o Desenvolvedor não tente ser o Arquiteto, e que o QA não tente escrever requisitos de negócio.14  
A verdadeira genialidade técnica dessa fase foi a persistência de estado fora da IA: tarefas completas, regras comportamentais e listas de verificação exaustivas (checklists) passaram a viver de forma persistente no sistema de arquivos local (arquivos estáticos de Markdown agrupados na pasta oculta .bmad-core/), extinguindo a vulnerabilidade da IA ao "prompt drift" (esquecimento progressivo de contexto).14 O arquivo manifesto mestre, o AGENTS.md, transformou-se na memória de longo prazo do agente unificado.14

### **2.4. Fase 4: A Encruzilhada Conceitual e o Nascimento do Synapse Engine**

Todo esse intrincado caminho de desenvolvimento alcançou seu ápice funcional no repositório outrora conhecido como bmadharness, que hoje evolui para o projeto **Synapse Engine**. Atualmente, este repositório detém a compilação absoluta do conhecimento sobre orquestração operacional e integração entre IDEs (como o Google Antigravity e integrações via Claude Code) e LLMs puros. No entanto, o sucesso dessa arquitetura revelou um paradoxo e estabeleceu uma severa encruzilhada conceitual.  
O Google Antigravity introduziu recentemente o conceito sofisticado de extensibilidade e escopo de gerenciamento de habilidades (Skills Management). No Antigravity, a customização permite que os agentes acessem comandos de domínio proprietário tanto de modo abrangente e global para o usuário, quanto isoladamente em nível de workspace (diretório local de trabalho).15  
A encruzilhada apresenta três rotas mutuamente exclusivas:

1. **Ditar a Configuração Global Absoluta:** Mover todo o projeto formador para o escopo global (\~/.gemini/config/skills/). Isso gera "poluição de zero-day", onde cada comando trivial em pequenos scripts obrigará o agente a ler dezenas de metadados complexos do método, desperdiçando performance e encarecendo a codificação.  
2. **Tornar-se um Artefato Adormecido:** O repositório passaria a operar puramente como um museu de documentação de referência para atualizações futuras esporádicas, sacrificando sua utilidade ativa.  
3. **Metamorfosear-se em um Pipeline Automatizado e Injetor (Synapse Engine):** Transformar as definições do BMAD em um mecanismo compilado, executável e autônomo que atua globalmente apenas como roteador, mas injeta sua sabedoria pesada (como skills locais) diretamente nos repositórios alvo apenas quando necessário. (Exemplo análogo à ferramenta @blade-ai/boss-skill).16

A resolução magistral dessa encruzilhada dita que a Rota 3 é a única arquitetura escalável e economicamente viável. O design ótimo requer a implantação rigorosa de um **Modelo Híbrido de Inversão de Controle e Descoberta Progressiva**.

## **3\. Arquitetura Híbrida: Roteamento Global e Injeção Local**

O projeto Synapse Engine provou que a inteligência artificial requer restrições estruturais fortes. O Antigravity provou que a infraestrutura necessita de granularidade (scoping). A solução híbrida é projetada separando categoricamente o "Mecanismo de Roteamento de Comportamento" (Routing Behavioral Engine) operando a nível global, do "Plano de Dados e Conhecimento Especializado" (Specialized Knowledge Data Plane) executado a nível de projeto local.  
A documentação do Antigravity estipula que a arquitetura suporta duas localizações estritas de escopo de skills, cada uma com responsabilidades de herança totalmente separadas 17:

* **Contexto de Aplicação Global (Universal Scoping):** Estes artefatos residem imutavelmente em subdiretórios restritos no diretório home do usuário do sistema operacional (ex: \~/.gemini/config/skills/). Todo e qualquer projeto aberto na IDE herda estas instruções basais.  
* **Contexto de Projeto Isolado (Workspace Scoping):** Arquivos que devem existir única e exclusivamente encapsulados no repositório de código em que se está trabalhando, tipicamente na pasta raiz na estrutura \<workspace-root\>/.agents/skills/.

O plano estabelecido para solucionar a encruzilhada decreta que o projeto Synapse Engine assumirá o papel arquitetural de uma **Skill Forge (Forja de Habilidades Parametrizável)**. Deste modo, ele se constitui como o cérebro autoritativo, instalando as restrições precisas aplicáveis via CLI Injetiva nos repositórios locais (similar à eficiência do comando boss-skill 16).

* **O Lado Global (GEMINI.MD / Roteador Universal):** O contexto global injetado precisa operar em um modelo de extrema privação sensorial não-crítica. Seu papel não é ensinar o agente a arquitetar uma API, seu papel é impor as **Restrições de Karpathy** (Simplest First, Surgical Changes) universalmente e orquestrar o **Progressive Disclosure**.15 A inteligência do agente analisa os metadados contidos em frontmatters YAML (nome, escopo) de cada SKILL exposta, sem carregar o corpo em Markdown. O GEMINI.MD ensina o Antigravity como rotear.  
* **O Lado Local (A Metamorfose do Synapse Engine em um Forge Engine):** No escopo local do Workspace, o repositório formador atua ativamente nas entranhas de novos workspaces instalando as metodologias pesadas (como frameworks de teste, templates e pipelines de QA baseados no @blade-ai/boss-skill 18). Isso cria **Quality Gates** intransponíveis (Gate 0: Compilação/Lint; Gate 1: Cobertura de Testes E2E; Gate 2: Deployment) diretamente na pasta .agents/skills/ do projeto alvo.

## **4\. Governança de Workspace e Padrões Metodológicos (Implementações Extraídas)**

Para que a forja híbrida garanta extrema economia de tokens, mitigação de refatoração predatória e alinhamento total de projeto, ela não deve apenas injetar personas, mas sim forçar um **Estado de Governança**. Extraindo padrões de excelência metodológica de implementações de sucesso (como o projeto Aevum Oikos), a arquitetura global automatizará a injeção dos seguintes quatro pilares nos workspaces locais:

### **4.1. Taxonomia de Documentação Semântica e Numerada**

O uso de documentação "flat" (todos os arquivos na mesma raiz 00\_docs/) confunde modelos fundacionais em grandes bases de código. O injetor forçará a adoção de subdiretórios numerados que separam categorias de documentação, impondo uma hierarquia determinística e ordem de leitura ordinal para o agente:

* 01\_prd/ (Requisitos de Produto)  
* 02\_tech\_specs/ (Especificações Técnicas)  
* 03\_rules/ (Políticas de Engenharia)  
* 04\_adrs/ (Decisões Arquiteturais)

Desta forma, os agentes (como o /pm ou /architect) são instruídos a buscar contexto sequencialmente, garantindo que regras de negócio sejam ingeridas antes do código arquitetural.

### **4.2. Sistema de ADRs baseado no Padrão MADR 4.0.0**

Manter decisões arquiteturais perdidas em logs de chat ou em arquivos de planejamento genéricos gera dívida técnica massiva e leva as IAs a alucinarem dependências obsoletas. O Antigravity passará a utilizar o formato **MADR (Markdown Any Decision Record) versão 4.0.0**.

* Cada decisão (ex: a escolha de um banco de dados) será forjada em um arquivo individual (ex: 0001-use-postgresql.md) e, crucialmente, possuirá um cabeçalho **YAML frontmatter** contendo o campo Status: (Proposed | Accepted | Superseded).  
* A economia de tokens é drástica: através do *Progressive Disclosure*, a IA do Antigravity lê apenas o cabeçalho YAML. Se o Status for Superseded, ela ignora imediatamente o corpo do arquivo, não consumindo orçamento de tokens com arquiteturas velhas.

### **4.3. Guardrails Locais e Políticas always\_on**

A infraestrutura híbrida permite o desacoplamento de responsabilidades. Enquanto o arquivo global GEMINI.MD lida com as leis imutáveis da IA, as regras de negócios estritas do projeto (ex: restrições de permissão de acesso ao banco de dados, nomenclaturas obrigatórias ou limpezas automáticas de cache) devem ser injetadas localmente em arquivos individuais .md dentro de \<workspace-root\>/.agents/skills/.

* A forja anexará a tag **always\_on: true** no frontmatter YAML dessas habilidades normativas locais.  
* Isso garante que o Antigravity sempre carregue essas "Políticas de Engenharia" antes de executar qualquer modificação no projeto local, operando como um contrato comportamental e interceptando ações deletérias.

### **4.4. A Diretriz Bilíngue de Harness (Otimização Cognitiva)**

A literatura de engenharia de prompts e a arquitetura de modelos fundacionais determinam de forma inequívoca que os modelos operam com máxima precisão lógica, menor latência e maior fidelidade de sintaxe (Code AST) quando o processamento sistêmico é conduzido em inglês. A tradução de regras de sistema ou raciocínios arquiteturais pesados para linguagens locais frequentemente corrompe a semântica e esgota os tokens. Para maximizar a eficiência, impõe-se um ADR basilar de padronização bilíngue:

* **Camada de Infraestrutura (Under the Hood):** É terminantemente obrigatório que toda a base de código, os metadados das Skills YAML, os templates de prompt do Antigravity, os arquivos MADR, nomes de variáveis e a telemetria do sistema (logs e estado JSON) permaneçam estritamente em **Inglês**.  
* **Camada de Interface (User-Facing):** O comportamento linguístico do agente durante a conversação no chat, bem como todo o texto gerado para a Interface de Usuário (front-end labels, outputs interativos, protótipos UX), devem ser direcionados para responder nativamente no idioma do usuário humano (ex: **Português do Brasil**). Esta separação previne degradação da "attention window" da IA, preservando o contexto lógico em sua linguagem nativa de treinamento, enquanto entrega uma experiência localizada para o gestor do projeto.

## **5\. Otimização Baseada em Grafos Topológicos: A Integração do Graphify**

Para dotar a IA de capacidades otimizadas, a base do Harness global determinará como mandatória a integração profunda do componente **Graphify**.19  
O **Graphify** não é um injetor cego, tampouco utiliza busca de similaridade via RAG convencional – a qual frequentemente falha por não capturar dependências cruzadas de código de linguagem lógica onde a semântica de palavras e as dependências matemáticas são independentes.21 A ferramenta converte a totalidade de um diretório de repositórios massivos, processando localmente (zero chamadas de API, parseando mais de 33 linguagens nativamente suportadas usando a infraestrutura performática Tree-sitter) 20 em uma estrutura tridimensional de dados de Grafo de Conhecimento interativo e consultável.22

### **A Mecânica Subjacente e Sequenciamento de Engenharia de Contexto via Grafo no Antigravity:**

A eficiência deste processo, o qual atinge o feito documentado no mercado de diminuir perdas por desperdício iterativo logando economias de token que escalonam até surpreendentes 71.5x 8, opera através dos seguintes passos imutáveis de orquestração do Agente Antigravity, perfeitamente integrados ao seu fluxo rotineiro comandado no arquivo GEMINI.MD:

1. **Fase Parse (Operação Assíncrona Totalmente Local):** O desenvolvedor, ou a IA invocando comandos automáticos via CLI (uv tool install graphifyy 19), ativa a ferramenta na infraestrutura. Todo o código do projeto passa pela avaliação nativa da ferramenta local Tree-sitter sem nenhum dispêndio (Custo Computacional de IA Zero).  
2. **Fase Mapping (Compilação Discreta em Arquivos Persistentes):** O modelo abstrato derivado do conhecimento computacional é materializado fisicamente na estrutura física local na pasta temporária persistente graphify-out/ contendo arquivos compactos JSON.24  
3. **Fase Query/Interseção Ativa (A Descoberta Antigravity Híbrida Direcionada):** Ao contrário dos comportamentos nocivos (slurp reading) de leitura indiscriminada, o Antigravity inicia cada nova sessão ou sub-agente com a injeção condicional da skill ativada através do comando inicial (slash-command de leitura /graphify.). O modelo navega topologicamente unicamente pelas ramificações, arestas e nós lógicos explícitos do JSON no graphify-out/. Este "montar (ride) no grafo" orienta de maneira hiper-direcionada e precisa ao acesso imediato de somente as funções envolvidas. Ele ignora cirurgicamente o restante de informações não acionáveis da topologia imensa.22

Esta restrição sistêmica garante e subsidia diretamente a proteção dos custos limitantes no IDE da infraestrutura. O Graphify mapeia *onde* o código está e as dependências abstratas, enquanto as Policies e Regras injetadas na pasta .agents/skills/ ditam *como* a IA pode manipulá-las.

## **6\. Arquitetura de Prompt e Artefatos Explícitos: Injetando a Sabedoria no Antigravity**

Para habilitar a promessa conceitual de permitir ao LLM do Antigravity processar autonomamente seu processo de inicialização e se auto-operar de forma holística em direção à economia e resolução de tarefas (efetuando auto-instalações, checando premissas e refinando seus códigos com maestria guiada), elaboramos a super-estrutura fundacional do metaprompt operacional a seguir.  
A transcrição integral desses blocos compõe a mecânica infraestrutural base do novo ecossistema. Estes são os códigos de atualização e estruturação que preencherão as instâncias inter-conectadas para suportar plenamente o Método.

### **6.1. Artefato Explícito 1: A Configuração de Controle Global (GEMINI.MD / Arquivo Base do Antigravity)**

Este artefato imperativo deve ser salvo em subdiretórios centrais lidos nativamente (ex: \~/.gemini/config/GEMINI.MD ou arquivo análogo). O Antigravity processará isto como seu arcabouço cognitivo e suas restrições basais não-negociáveis.

# **Antigravity Global Harness Control Plane (Synapse Engine Hybrid Core Initialization)**

## **1\. Diretivas Operacionais e Restrições Cognitivas (Karpathy Guidelines & Lopopolo Steering Framework)**

Você é o Antigravity (powered by Google / Claude-compatible backend), um agente de desenvolvimento mestre operando com capacidade paralela, sujeito e sob custódia inexorável de uma infraestrutura de restrições chamada "Harness Engineering". Todas as suas manipulações sintáticas em qualquer repositório sob seu comando respondem irrevogavelmente às diretivas a seguir baseadas nas leis fundamentais publicadas em https://www.aibuilderclub.com/blog/karpathy-claude-md-rules:

* **Ask, Don't Assume:** A ambiguidade matemática ou intencional é inaceitável. A não ser que o modelo mental, a intenção originária e os detalhes estritos arquiteturais, bem como os requisitos das funcionalidades subjacentes a serem acopladas, estejam explicitamente elucidadas e validadas, interrompa suas predições e formule imediatamente interpelações esclarecedoras de restrição. Nenhuma assunção silenciosa, baseada na média estatística global da sua internet formadora, será tolerada na codificação.  
* **Simplest Solution First:** Projeta-se em direção à implementação funcional mais minimalista. Deseje arduamente subverter qualquer instinto gerativo latente e inerente a modelos generativos de construir generalizações hiper-complexas prematuras ou criar interfaces artificiais se as mesmas não foram expressamente delegadas. O critério definidor é estritamente o código utilitário de menor impacto.  
* **Surgical Interventions (Don't touch unrelated):** Restrinja as deleções, inserções e refatorações cirurgicamente nos nós identificados pela cadeia estrita de comandos associada ao problema. Arquivos não conectados e segmentos assinalados pelo Graphify como não inter-relacionados a nível Abstract Syntax Tree devem ser deliberadamente desconsiderados de alteração formativa, a não ser que os perigos da arquitetura exijam tal aviso; reporte o "código morto", mas nunca modifique o escopo periférico independentemente do nível de imperfeições sistêmicas notadas. Refatorações espúrias são destrutivas aos Quality Gates.7  
* **Flag Uncertainty (Sinalizar Escopo):** Para cada proposição nova estrutural ou API exótica cuja confiabilidade apresente anomalias relativas de execução, documente abertamente esse status através da declaração sistemática dos compromissos, fragilidades e compensações (Tradeoffs).  
* **Verification Definition Loop:** Sucesso operatório não é o "gerar de um diff completo". Todo código modificado passará obrigatoriamente pela malha de interceptação local de linters automatizados e pela passagem pelas regras do Quality Gates atreladas as restrições autônomas instaladas.

## **2\. Orquestração Híbrida: O Ecossistema Avançado e Progressive Disclosure**

Apesar da cultura central, sua manifestação local em cada projeto advém do seu acesso engenhoso à infraestrutura provida pelas Skills e aos padrões injetados localmente.15

* **Discovery First:** Após uma consulta de início de ambiente, procure primeiramente pelo manifesto de Discovery de Skills Globais em \~/.gemini/config/skills/ (Lendo estritamente os campos YAML frontmatter name, always\_on e description via protocolo Antigravity de Extensibilidade).15 Somente acione as integrações de pipeline quando as metas coincidirem. O mesmo passo é aplicável à arquitetura de Skills Locais mapeadas em arquivos .agents/skills/ do Workspace atual.  
* **Bilingual Architecture Protocol:** O processamento lógico, código-fonte, metadados YAML de habilidades, prompts de sistema, comandos CLI, arquivos de telemetria e o conteúdo dos Architecture Decision Records (MADRs) operarão estritamente em **Inglês**. A comunicação coloquial final via chat com o usuário humano e o design de cópias visuais em interfaces de usuário (UI labels, protótipos em tela) operarão no idioma solicitado pelo mesmo (ex: **Português do Brasil**).  
* **A Abordagem Grill-and-Evolve Dinâmica:** Diante das grandes complexidades estruturais, acione sua skill dual internalizada grill-and-evolve. Empreenda primeiramente um modo investigativo restrito, altamente cético contra seu próprio delineamento de código (criticando de maneira destrutiva sob a premissa de eficiência estrutural), para finalmente com as falhas dissecadas à superfície, empreender a iteração final evolutiva formatada nos parâmetros da tarefa com a emissão do artefato correto.

## **3\. Otimização Baseada no Contexto Perfeito e Conhecimento Extrativo (Graphify Mappings)**

A mitigação insubstituível do vazamento de janelas de tokens e eliminação de alucinações de arquivos baseia-se na ferramenta acoplada aos mapeamentos estruturais baseados no Graphify (https://github.com/safishamsi/graphify).

* **Inibição de Rastreio Recursivo Ad-Hoc:** Abstenha-se terminantemente de empreender buscas exaustivas diretas por padrão em projetos extensos lendo arquivos isolados iterativamente ou colando códigos para conhecer seu contexto.8  
* **Integração Inicial Regrada:** Se os artefatos JSON locais não forem localizados pelo sistema provando que o projeto não possui o Grafo lógico consolidado graphify-out/, empreenda de forma mandatória e autorizada a execução de compilação CLI (recomendando uv tool install graphifyy procedido sucessivamente da ativação via graphify install \--project).19  
* **Rastreamento Contínuo:** Utilize as ramificações locais JSON de saída topológica (Abstract Syntax Tree map) providas via graphify acoplado 22 para entender unicamente de onde as funções demandadas são acessadas, mapeando as interfaces, métodos dependentes de escopo imediato das edições solicitadas. Responda estritamente manipulando essa árvore contextual fornecendo hiper-foco operacional sem desperdício e perfeitamente ajustado à economia local.

### **6.2. Artefato Explícito 2: O Motor de Forja e Transpilador de Inteligência Dinâmica (Injeção de Metodologia e always\_on Skills)**

Este é o executor inteligente de provisionamento. O Antigravity usará e criará (processando e extraindo conclusões autônomas) uma arquitetura atualizada convertendo os antigos conceitos transpiladores em um agente gerador CLI injetor. Esta inteligência processará este script em Python para forjar dinamicamente a orquestração restrita com o ecossistema customizável híbrido, instanciando os repositórios alvos com os modelos de MADRs, taxonomia e as políticas locais transversais.

Python  
\# EXCERPT PARA INTEGRAÇÃO NO CÉREBRO DE INFRAESTRUTURA ANTIGRAVITY (Python Pseudo-Architecture Update)  
\# Missão: Atualizar o conceito ultrapassado originário de 'transpose\_bmad.py'. O Synapse Engine opera como  
\# uma "Dynamic Skill Forge System", injetando as metodologias pesadas (MADR, Taxonomia, Quality Gates)  
\# diretamente no escopo LOCAL (.agents/skills) de novos projetos, poupando a configuração global da poluição.

import os  
import yaml  
import json  
import shutil  
from pathlib import Path  
from typing import List, Dict

class SynapseEngineHybridEngine:  
    def \_\_init\_\_(self, global\_config\_dir: str \= "\~/.gemini/config/skills", local\_workspace\_dir: str \= ".agents/skills"):  
        \# Mapeia as esferas de herança isoladas para impedir o problema conceitual da poluição e dilemas globais  
        self.global\_dir \= Path(global\_config\_dir).expanduser()  
        self.local\_dir \= Path(local\_workspace\_dir)  
        self.bmad\_core\_source \= Path(".bmad-core")

    def \_read\_bmad\_frontmatter\_metadata(self, filepath: Path) \-\> Dict:  
        """  
        Extrai o bloco YAML restritivo do documento MD do agente formador,   
        preparando a descoberta baseada no Progressive Disclosure do Antigravity.  
        """  
        if not filepath.exists():  
            raise FileNotFoundError(f"Source metadata {filepath} irremediably missing.")  
              
        with open(filepath, 'r', encoding='utf-8') as file:  
            content \= file.read()  
            if content.startswith('---'):  
                parts \= content.split('---', 2)  
                if len(parts) \>= 3:  
                    return yaml.safe\_load(parts) or {}  
        return {}  
          
    def \_deploy\_skill\_isolated(self, target\_directory: Path, role\_name: str, skill\_content: str, metadata: Dict):  
        """  
        Injeta e orquestra cirurgicamente os arquivos base.   
        Mimetizando a eficiência observada em auto-instalações ativas de CLI plugins (como @blade-ai/boss-skill).  
        """  
        skill\_folder \= target\_directory / role\_name  
        skill\_folder.mkdir(parents=True, exist\_ok=True)  
          
        skill\_file \= skill\_folder / "SKILL.md"  
        with open(skill\_file, 'w', encoding='utf-8') as f:  
            f.write(f"---\\n{yaml.dump(metadata, sort\_keys=False)}---\\n")  
            f.write(skill\_content)  
          
        print(f"✓ Injecting hybrid dynamic skill: {role\_name} \-\> {skill\_file}")  
          
    def \_forge\_methodology\_scaffolding(self):  
        """  
        Injeta as metodologias extraídas dos padrões avançados, como Taxonomia Semântica Numerada e o template MADR 4.0.0  
        no workspace local, isolando o projeto com governança forte sem poluir o router global.  
        """  
        docs\_dir \= Path("00\_docs")  
        folders \= \["01\_prd", "02\_tech\_specs", "03\_rules", "04\_adrs"\]  
        for folder in folders:  
            (docs\_dir / folder).mkdir(parents=True, exist\_ok=True)  
              
        print("✓ Injected Numbered Semantic Taxonomy for Documentation.")  
        \# Template MADR injetado no workspace local para gerenciar ciclo de vida (Proposed/Accepted/Superseded)  
        \# O idioma base para arquitetura estrutural deve ser em Inglês.

    def forge\_hybrid\_skills(self, required\_roles\_subset: List\[str\] \= None):  
        """  
        Engine da Orquestração baseada em Contexto.  
        Injeta os papéis e diretrizes baseadas estritamente na fase declarada da aplicação e em   
        políticas locais (always\_on=True).  
        """  
        self.\_forge\_methodology\_scaffolding()  
          
        if not required\_roles\_subset:  
            required\_roles\_subset \= \[f.stem for f in (self.bmad\_core\_source / "agents").glob("\*.md")\]  
              
        for role in required\_roles\_subset:  
            source\_file \= self.bmad\_core\_source / "agents" / f"{role}.md"  
            metadata \= self.\_read\_bmad\_frontmatter\_metadata(source\_file)  
              
            with open(source\_file, 'r', encoding='utf-8') as f:  
                content\_body \= f.read().split('---', 2)\[-1\].strip() if f.read().startswith('---') else f.read()  
              
            \# Decisão Híbrida: Habilidades de infraestrutura mestre operam globalmente.  
            if metadata.get("scope") \== "global" or role \== "bmad-master":  
                self.\_deploy\_skill\_isolated(self.global\_dir, role, content\_body, metadata)  
            else:  
                \# Regras de Negócio e Guardrails Locais (como always\_on transversais) operam na restrição do Workspace  
                self.\_deploy\_skill\_isolated(self.local\_dir, role, content\_body, metadata)

if \_\_name\_\_ \== "\_\_main\_\_":  
    print("Initiating Synapse Engine Hybrid Compilation in Antigravity Context...")  
    forge \= SynapseEngineHybridEngine()  
    forge.forge\_hybrid\_skills(\["sm", "ux-expert", "qa", "bmad-master", "local-guardrails-policy"\]) 

### **6.3. Artefato Explícito 3: Rotina de Avaliação de Compliance e Retrofit (Para Projetos Existentes)**

Para projetos legados ou que já estão funcionais (como o Aevum Oikos), não devemos forçar uma reescrita catastrófica. Em vez disso, o Antigravity utilizará uma rotina estrita de "Retrofit", que avalia o abismo (gap) entre o estado atual do projeto e o padrão Synapse Engine, aplicando as pastas e Quality Gates de maneira cirúrgica.  
**Comando de Execução:** Cole o prompt a seguir diretamente no chat do Antigravity (aberto na raiz do projeto legado) para instanciar a rotina de conformidade.

# **MISSÃO DE COMPLIANCE E RETROFIT: Padrão Synapse Engine**

Assuma o papel de Arquiteto de Compliance e Engenheiro de Harness. Este projeto já é funcional, mas precisa ser alinhado ao nosso novo padrão metodológico (Synapse Engine) sem quebrar o código existente.  
Sua tarefa consiste em executar as seguintes fases de forma sequencial, parando para minha aprovação no final da Fase 1:

## **Fase 1: Auditoria Não-Destrutiva (Read-Only)**

1. Invoque o Graphify (ou leia graphify-out/ se existir) e varra a estrutura de pastas do projeto.  
2. Identifique ausências críticas baseadas no padrão Synapse Engine:  
   * A taxonomia de documentação atual usa a estrutura numerada (01\_prd, 02\_tech\_specs, 03\_rules, 04\_adrs)?  
   * Os ADRs atuais (se existirem) possuem o frontmatter YAML com o campo Status (MADR 4.0.0)?  
   * Existem políticas transversais não isoladas que deveriam ser encapsuladas em skills locais (.agents/skills/) com a tag always\_on: true?  
3. Gere um relatório textual breve listando as discrepâncias. **PARE E AGUARDE MINHA APROVAÇÃO.**

## **Fase 2: O Retrofit Cirúrgico**

Somente após a minha aprovação ("Proceder com Retrofit"), execute fisicamente:

1. Crie a estrutura de diretórios 00\_docs/ numerada. Mova os arquivos Markdown antigos para suas respectivas novas categorias, preservando links relativos.  
2. Crie a pasta .agents/skills/ local.  
3. Extraia as regras de negócio globais do projeto e crie uma policy skill básica (ex: local-guardrails/SKILL.md) equipada com always\_on: true no frontmatter YAML.  
4. Finalize rodando o linter ou suite de testes para garantir que nenhuma refatoração quebrou a compilação do projeto ativo. O agente subentenderá, lendo estas definições, que sua finalidade de existência abrange capacidades e atuações de instanciar esse código nas preparações bases, estabelecendo um ecossistema com zero retrabalho, operando puramente focado e estritamente subordinado à lógica do "Harness".

#### **Referências citadas**

1. Harness Engineering: How to Build Software When Humans Steer, Agents Execute \- Gist, acessado em junho 28, 2026, [https://gist.github.com/intellectronica/1a9018ed642096fc81b0eeb1f2c8b63c](https://gist.github.com/intellectronica/1a9018ed642096fc81b0eeb1f2c8b63c)  
2. Ryan Lopopolo \- Harness Engineering: How to Build Software When Humans Steer and Agents Execute \- YouTube, acessado em junho 28, 2026, [https://www.youtube.com/watch?v=c8bE0cj7vHY](https://www.youtube.com/watch?v=c8bE0cj7vHY)  
3. BMAD-METHOD™ : Building Custom AI Agents with BMB and Google AntiGravity \- Medium, acessado em junho 28, 2026, [https://medium.com/@visrow/bmad-method-building-custom-ai-agents-with-bmb-and-google-antigravity-54ac96024e94](https://medium.com/@visrow/bmad-method-building-custom-ai-agents-with-bmb-and-google-antigravity-54ac96024e94)  
4. bmad · GitHub Topics, acessado em junho 28, 2026, [https://github.com/topics/bmad](https://github.com/topics/bmad)  
5. Antigravity IDE Hands-On: Google's Agent-First Future — Are we ready? | by Vishal Mysore, acessado em junho 28, 2026, [https://medium.com/@visrow/antigravity-ide-hands-on-googles-agent-first-future-are-we-ready-a6d991025082](https://medium.com/@visrow/antigravity-ide-hands-on-googles-agent-first-future-are-we-ready-a6d991025082)  
6. Antigravity 2.0, acessado em junho 28, 2026, [https://antigravity.google/product/antigravity-2](https://antigravity.google/product/antigravity-2)  
7. Karpathy CLAUDE.md Rules: Cut Claude Errors 41% to 11% \- AI Builder Club, acessado em junho 28, 2026, [https://www.aibuilderclub.com/blog/karpathy-claude-md-rules](https://www.aibuilderclub.com/blog/karpathy-claude-md-rules)  
8. Graphify: Instant Knowledge Graph for Claude Code/Antigravity (FREE) \- YouTube, acessado em junho 28, 2026, [https://www.youtube.com/watch?v=BkHps04qGgc](https://www.youtube.com/watch?v=BkHps04qGgc)  
9. Harness engineering: leveraging Codex in an agent-first world | OpenAI, acessado em junho 28, 2026, [https://openai.com/index/harness-engineering/](https://openai.com/index/harness-engineering/)  
10. Harness Engineering: How to Build Software When Humans Steer, Agents Execute — Ryan Lopopolo, OpenAI \- YouTube, acessado em junho 28, 2026, [https://www.youtube.com/watch?v=am\_oeAoUhew](https://www.youtube.com/watch?v=am_oeAoUhew)  
11. I added a clause to Andrej Karpathy's 4 CLAUDE.MD clauses for Claude Code. It has been a game changer for me. \- Reddit, acessado em junho 28, 2026, [https://www.reddit.com/r/ClaudeAI/comments/1uc7izy/i\_added\_a\_clause\_to\_andrej\_karpathys\_4\_claudemd/](https://www.reddit.com/r/ClaudeAI/comments/1uc7izy/i_added_a_clause_to_andrej_karpathys_4_claudemd/)  
12. antigravity-bmad-config/AGENTS.md at main \- GitHub, acessado em junho 28, 2026, [https://github.com/salacoste/antigravity-bmad-config/blob/main/AGENTS.md](https://github.com/salacoste/antigravity-bmad-config/blob/main/AGENTS.md)  
13. CLAUDE.md \- multica-ai/andrej-karpathy-skills \- GitHub, acessado em junho 28, 2026, [https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md)  
14. salacoste/antigravity-bmad-config: Antigravity config ... \- GitHub, acessado em junho 28, 2026, [https://github.com/salacoste/antigravity-bmad-config](https://github.com/salacoste/antigravity-bmad-config)  
15. Agent Skills \- Google Antigravity Documentation, acessado em junho 28, 2026, [https://antigravity.google/docs/skills](https://antigravity.google/docs/skills)  
16. Boss Skill \- BMAD 全自动研发流水线（多Agent 编排） \- GitHub, acessado em junho 28, 2026, [https://github.com/echoVic/boss-skill](https://github.com/echoVic/boss-skill)  
17. Plugins & Skills \- Google Antigravity Documentation, acessado em junho 28, 2026, [https://antigravity.google/docs/cli-plugins](https://antigravity.google/docs/cli-plugins)  
18. boss-skill \- AI Agents on GitHub | SkillsLLM, acessado em junho 28, 2026, [https://skillsllm.com/skill/boss-skill](https://skillsllm.com/skill/boss-skill)  
19. graphify \- AI Agents on GitHub (73.1k ) | SkillsLLM, acessado em junho 28, 2026, [https://skillsllm.com/skill/graphify](https://skillsllm.com/skill/graphify)  
20. Graphify hits 58.3K stars: knowledge graphs for AI coding assistants | Augment Code, acessado em junho 28, 2026, [https://www.augmentcode.com/learn/graphify-knowledge-graphs-ai-coding](https://www.augmentcode.com/learn/graphify-knowledge-graphs-ai-coding)  
21. This Tool Fixes AI Coding at Scale with 70x Fewer Tokens (Graphify) \- YouTube, acessado em junho 28, 2026, [https://www.youtube.com/watch?v=WNru\_PFycT8](https://www.youtube.com/watch?v=WNru_PFycT8)  
22. Graphify for Claude Code: How a Karpathy-Inspired Knowledge Graph Cuts Large Codebase Costs by 70x | MindStudio, acessado em junho 28, 2026, [https://www.mindstudio.ai/blog/graphify-claude-code-knowledge-graph-large-codebase-70x](https://www.mindstudio.ai/blog/graphify-claude-code-knowledge-graph-large-codebase-70x)  
23. Claude Code \+ Graphify \= Insane Agentic OS \- YouTube, acessado em junho 28, 2026, [https://www.youtube.com/watch?v=Owv503rTqYY](https://www.youtube.com/watch?v=Owv503rTqYY)  
24. GitHub \- safishamsi/graphify: AI coding assistant skill (Claude Code, Codex, OpenCode, Cursor, Gemini CLI, and more). Turn any folder of code, SQL schemas, R scripts, shell scripts, docs, papers, images, or videos into a queryable knowledge graph. App code \+ database schema \+ infrastructure in one graph., acessado em junho 28, 2026, [https://github.com/safishamsi/graphify](https://github.com/safishamsi/graphify)