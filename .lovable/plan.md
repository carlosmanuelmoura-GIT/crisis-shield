## Objetivo

Aplicar o padrão visual de duas colunas (fases à esquerda, detalhe à direita) — o mesmo já usado no detalhe de uma crise em `CrisisControlSection` (componente `CrisisKanbanView`) — à página **Action Cards Gestão de Crise** (`ProceduresSection.tsx`).

## Estado atual

`ProceduresSection.tsx` mostra 3 colunas lado a lado (PREPARAÇÃO / GESTÃO DA CRISE / FIM DA CRISE), cada uma com os seus action cards empilhados. O conteúdo do card expande em accordion no próprio cartão.

## Novo layout

Grid `lg:grid-cols-3`:

```text
┌───────────────────┬───────────────────────────────────┐
│ Stepper de FASES  │  Detalhe da fase selecionada       │
│ (col-span-1)      │  (col-span-2)                      │
│                   │                                    │
│ • PREPARAÇÃO  (n) │  Header: nome da fase + contagem   │
│ • GESTÃO      (n) │  Lista de Action Cards da fase:    │
│ • FIM          (n)│    - título + categoria            │
│                   │    - botões Clonar / Editar / Del  │
│                   │    - expandir → markdown           │
│                   │  Botão “+ Novo nesta fase”         │
└───────────────────┴───────────────────────────────────┘
```

### Coluna esquerda — stepper
- Lista vertical das 3 fases (`PHASES`).
- Cada item mostra ícone/bolinha, nome da fase e badge com nº de cards.
- Item selecionado destacado (borda/bg primária), tal como em `CrisisKanbanView`.
- Clicar seleciona a fase.

### Coluna direita — detalhe
- Header com o nome da fase + total de cards + botão “Novo”.
- Corpo: lista dos action cards da fase selecionada, mantendo as ações existentes (drag & drop de reordenação **dentro** da fase, clone, editar, eliminar, expandir markdown).
- Vazio: mensagem “Sem action cards nesta fase”.

## Preservação de funcionalidade

- Mantém drag & drop **dentro** da fase visível para reordenar.
- Remove-se o drag entre colunas (já não há colunas); a mudança de fase passa a fazer-se via campo “Fase” do diálogo de edição (já existe).
- Diálogo CRUD, hooks (`useProcedures`, mutations), pesquisa e render de markdown ficam inalterados.

## Ficheiros a alterar

- `src/components/sections/ProceduresSection.tsx` — refactor do JSX da vista (adiciona `selectedPhase` state, novo grid 2-col, remove handlers de drop entre colunas).

Sem alterações de schema, hooks ou dados.
