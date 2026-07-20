## Alterações — Gestão de Crise Real, Action Cards e Log

### 1. Controlo da Gestão de Crise — permitir estado "FIM" e aprovação na fase 6

Actualmente na `CrisisControlSection`, o botão "FIM DE CRISE" da fase 6 só é visível quando o estado é `crise_em_curso`. Como uma crise real passa naturalmente por `retorno` antes do fim, o botão desaparece e o utilizador não consegue fechar a crise.

- Alterar a condição de edição do campo "Aprovado por" e do botão "FIM DE CRISE" para ficar activo quando `status ∈ { crise_em_curso, retorno }` (e o utilizador é Steering).
- Quando o botão é clicado (fase 6 aprovada) → `updateCrisis` para `status = "fim"` + `ended_by` + entrada no Decision Log (comportamento actual mantido).
- Nos restantes estados o campo continua apenas em modo leitura.

### 2. Action Cards — remover o "risco" (strikethrough) ao marcar

Na checklist dos Action Cards (`EmergencySection.tsx`, linha ~1016), quando um item é marcado é aplicado `line-through` sobre o texto. Vamos remover essa classe: o item marcado passa apenas a mostrar-se em fundo verde-claro (`bg-emerald-50`) e cor `text-slate-500`, sem risco por cima.

### 3. Log das Acções — layout de acordeão, ordem cronológica

Redesenhar `DecisionLogSection` para:

- Substituir o grid de 2 colunas por uma lista vertical de 1 coluna.
- Cada crise passa a ser uma linha colapsável (`Accordion` do shadcn) que mostra apenas o título, data e badges no cabeçalho. Ao clicar, expande e revela todas as acções.
- Ordenar as crises da **mais recente para a mais antiga** (por `crisis_date` decrescente).
- Dentro de cada crise, ordenar as entradas por `created_at` **ascendente** (mais antiga em cima, mais recente no fim) — cronologia crescente.

### 4. CRUD das Fases da Crise

Actualmente as 6 fases são um array `PHASES` hard-coded em `CrisisControlSection.tsx`, sem CRUD. Vamos:

- Criar uma nova tabela `crisis_phases` (`crisis_id`, `phase_key`, `label_pt`, `label_en`, `icon`, `color`, `sort_order`, timestamps) com RLS e GRANTs. Ao criar uma crise, o hook `useCreateCrisis` gera automaticamente as 6 fases-padrão para essa crise.
- Novo hook `useCrisisPhases` com `useCrisisPhases`, `useUpdateCrisisPhase` (edita label PT/EN, ícone, cor) e opcionalmente `useReorderPhases`.
- No painel direito da fase seleccionada, adicionar um botão ✏️ (Steering) que abre um diálogo para editar o nome PT/EN, o ícone (emoji) e a cor de fundo dessa fase.
- Substituir o array `PHASES` pela lista dinâmica vinda da base de dados. As fases especiais (`declaracao` e `fim`) continuam identificadas por `phase_key` para manter os botões de declarar/terminar crise.

### Detalhes técnicos

- Migração SQL cria `public.crisis_phases` com `GRANT SELECT/INSERT/UPDATE/DELETE ... TO authenticated`, `GRANT ALL ... TO service_role`, `ENABLE RLS` e políticas que permitem operações a utilizadores autenticados (mesmo padrão de `crisis_phase_actions`). Índice único em `(crisis_id, phase_key)`.
- `useCreateCrisis` passa a fazer `insert` das 6 fases-padrão logo após criar a crise (e a clonar as fases se `clone_from_id` estiver presente).
- Ficheiros afectados: `src/hooks/useCrises.ts` (ou novo `useCrisisPhases.ts`), `src/components/sections/CrisisControlSection.tsx`, `src/components/sections/EmergencySection.tsx`, `src/components/sections/DecisionLogSection.tsx`.
- Sem alterações à lógica de checklist_state nem ao trigger `clear_checklist_state_on_crisis_end`.
