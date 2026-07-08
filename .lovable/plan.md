# Detalhe das Fases da Crise — Layout em 2 Colunas

Substituir a apresentação atual (cartões empilhados verticalmente com expand/collapse) por um layout de duas colunas, alinhado com a UX da imagem de referência.

## Estrutura visual

```text
┌─────────────────────────┬──────────────────────────────────────────┐
│  COLUNA ESQUERDA (~1/3) │  COLUNA DIREITA (~2/3)                   │
│                         │                                          │
│  ┌───────────────────┐  │  [FASE X DE 6]           Progresso 0%    │
│  │ ⚠ FASE 1          │  │  ⚠ ALERTA & CONTENÇÃO                    │
│  │   Alerta &        │  │  ────────────────────────────────────    │
│  │   Contenção   0%  │  │  ▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░  (barra)   │
│  └───────────────────┘  │                                          │
│           ↓             │  ☐ Resposta a Incidente                  │
│  ┌───────────────────┐  │  ☐ Informação ao Coordenador GCN         │
│  │ 🚨 FASE 2         │  │  ☐ Avaliação da Gravidade                │
│  │   Declaração  0%  │  │  + adicionar acção                       │
│  └───────────────────┘  │                                          │
│           ↓             │  ── (campos específicos por fase) ──     │
│  ...FASE 3..6           │                                          │
│                         │  👤 AUTORIDADE REQUERIDA                 │
│                         │  GOV / GCN                               │
│                         │                     [APROVAR & AVANÇAR]  │
└─────────────────────────┴──────────────────────────────────────────┘
```

## Comportamento

- **Coluna esquerda — Stepper vertical** com as 6 fases (mantém `PHASES` existente):
  - Cada item mostra: ícone, `FASE N`, nome da fase, % de progresso.
  - Item seleccionado com destaque (borda/anel na cor da fase).
  - Setinha ↓ entre itens (mantém indicador de fluxo já usado).
  - Clique selecciona a fase para ver detalhe à direita.
- **Coluna direita — Painel de detalhe** da fase seleccionada:
  - Cabeçalho: badge `FASE X DE 6`, título com ícone, indicador `Progresso da Fase X%` no topo direito, barra de progresso por baixo.
  - Corpo: checklist de acções (reutiliza `renderActions`), mantendo o diálogo de metadados no toggle.
  - Rodapé (novo): "AUTORIDADE REQUERIDA" à esquerda com etiqueta da role responsável pela fase; botão de acção principal à direita:
    - Fase **DECLARAÇÃO** → campo "Autorizado por" + botão `DECLARAR CRISE` (só editável em `em_alerta` e para Steering, conforme já implementado; caso contrário mostra valor readonly).
    - Fase **FIM DE CRISE** → campo "Aprovado por" + botão `FIM DE CRISE` (só editável em `crise_em_curso` e para Steering).
    - Outras fases → botão neutro `APROVAR & AVANÇAR FASE` desactivado (placeholder visual, sem mudar lógica de estados; a transição de estado continua ligada às fases Declaração/Fim já existentes).
- **Estado inicial**: fase seleccionada = primeira fase cujo estado ainda não está completo, ou a primeira (`alerta`).
- **Responsivo**: em ecrãs `<lg` empilha (coluna esquerda por cima, detalhe por baixo).

## Fora do âmbito

- Não alterar a lógica de transições de estado nem regras de permissões já implementadas.
- Não alterar checklist, diálogo de metadados, decision_log, nem hooks/DB.
- Aplica-se tanto a crises reais/simuladas como a templates (mesma vista de detalhe).

## Ficheiros a alterar

- `src/components/sections/CrisisControlSection.tsx` — substituir o bloco "Kanban phases - vertical" (linhas ~827-943) por o novo layout de 2 colunas, adicionando estado `selectedPhaseId` no componente de detalhe da crise.
