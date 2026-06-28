# Graph Report - BmadHarness  (2026-06-28)

## Corpus Check
- 24 files · ~6,094 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 129 nodes · 116 edges · 22 communities (18 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2207ba38`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]

## God Nodes (most connected - your core abstractions)
1. `Agent Instructions - BMAD Harness` - 6 edges
2. `Agent Instructions - BMAD Harness` - 6 edges
3. `main()` - 4 edges
4. `run_codebase_audit()` - 4 edges
5. `scripts` - 4 edges
6. `Execution Guidelines - Local Software Architect` - 4 edges
7. `Execution Guidelines - Local Software Developer (TDD)` - 4 edges
8. `Execution Guidelines - Local Product Manager (PM)` - 4 edges
9. `Execution Guidelines - Local QA Engineer` - 4 edges
10. `Skill: grill-and-evolve (Karpathy Simplicity & Codebase Audit)` - 4 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (22 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (10): description, devDependencies, jest, main, name, scripts, harness:status, harness:tdd (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.20
Nodes (9): ADR-001: Python 3 Standard Scripting, ADR-002: Jest Integration Testing, 🏛️ Architectural Decision Records (ADRs), Refactoring Reference: `examples/golden_case_refactoring.py`, Script: `scripts/analyze_project_metrics.py`, Skill Manifest: `SKILL.md`, 🛠️ Solution Design, 📂 Surgical Targets (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.36
Nodes (7): fs, main(), path, printUsage(), readState(), STATE_FILE_PATH, writeState()

### Community 3 - "Community 3"
Cohesion: 0.36
Nodes (7): audit_file_for_exception_silencing(), calculate_niche_viability(), main(), Scans a Python file for generic exceptions followed by pass or continue     with, Recursively scans the directory for Python files, excluding system/temp dirs., Calculates the Niche Viability (Vn).     Formula: Vn = (US * PM) / (CL * AC), run_codebase_audit()

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (6): Agent Instructions - BMAD Harness, Commit Attribution, Governance & Inheritance, Local Persona Shift Loop, Overview, Physical & Mechanical Commands

### Community 5 - "Community 5"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getStagedFiles(), getTrackedFiles(), main(), path

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (6): Agent Instructions - BMAD Harness, Commit Attribution, Governance & Inheritance, Local Persona Shift Loop, Overview, Physical & Mechanical Commands

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (4): process_batch_clean(), process_user_data_clean(), Processes user data by validating inputs explicitly instead of using      broad,, Processes batch items by verifying types and propagating errors      or handling

### Community 8 - "Community 8"
Cohesion: 0.29
Nodes (6): 1. Niche Viability Calculation ($V_n$), 2. Static Exception Silence Audit, 🛠️ Core Features, 🧠 Karpathy Simplicity Philosophy, Skill: grill-and-evolve (Karpathy Simplicity & Codebase Audit), 💬 Socratic Loop `/grill-me`

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (5): ADR-001: [Título da Decisão], 📂 Alvos Cirúrgicos (Surgical Targets), 🛠️ Detalhes da Solução, Plano Técnico & ADRs: [Nome da Funcionalidade], 🏛️ Registros de Decisão Arquitetural (ADRs)

### Community 10 - "Community 10"
Cohesion: 0.40
Nodes (4): 🧪 Acceptance Criteria, 📜 Functional Requirements, 🎯 Product Goals, Specification: Custom Skill "grill-and-evolve"

### Community 11 - "Community 11"
Cohesion: 0.40
Nodes (4): 📦 Artefatos Desenvolvidos e Entregues, 🧪 Casos de Testes Validados, 🛠️ Checklist de Verificação Físico-Mecânica, Walkthrough: Entrega da Sandbox e da Skill Customizada "grill-and-evolve"

### Community 12 - "Community 12"
Cohesion: 0.40
Nodes (4): Execution Guidelines - Local Software Architect, 📜 Local Governance Rules, 📝 Next Steps, 🎯 Phase Goal

### Community 13 - "Community 13"
Cohesion: 0.40
Nodes (4): Execution Guidelines - Local Software Developer (TDD), 📜 Local Governance Rules, 📝 Next Steps, 🎯 Phase Goal

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (4): Execution Guidelines - Local Product Manager (PM), 📜 Local Governance Rules, 📝 Next Steps, 🎯 Phase Goal

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (4): Execution Guidelines - Local QA Engineer, 📜 Local Governance Rules, 📝 Next Steps, 🎯 Phase Goal

### Community 16 - "Community 16"
Cohesion: 0.40
Nodes (4): 🧪 Acceptance Criteria, 📜 Functional Requirements, 🎯 Product Goals, Specification: [Feature Name]

### Community 18 - "Community 18"
Cohesion: 0.50
Nodes (3): { execSync }, fs, path

## Knowledge Gaps
- **65 isolated node(s):** `fs`, `path`, `STATE_FILE_PATH`, `fs`, `path` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `fs`, `path`, `STATE_FILE_PATH` to the rest of the system?**
  _70 weakly-connected nodes found - possible documentation gaps or missing edges._