## Objetivo
Transformar o "Conteúdo Markdown" dos Action Cards da Gestão de Crise numa lista de linhas editáveis (à semelhança dos Action Cards Departamentais), suportando numeração, checkbox e log automático na crise ativa.

## 1. Nova tabela `procedure_steps` (migração)
Colunas: `id`, `procedure_id` (FK → procedures, ON DELETE CASCADE), `text_pt`, `text_en`, `sort_order`, `checked` (bool default false), `created_at`, `updated_at`.
- GRANTs para `authenticated` / `service_role`.
- RLS: SELECT/INSERT/UPDATE/DELETE para `authenticated`.
- Trigger `update_updated_at_column`.
- **Data migration**: para cada linha em `procedures`, aplicar `parseProcedure(content_pt/en)` no lado do cliente (script one-shot no arranque) OU migração SQL simples que divide `content_pt` por linhas que começam com `-`, `*` ou `\d+\.`. Vamos fazer via SQL usando `regexp_split_to_table` + filtro, criando uma linha por bullet detetado, preservando ordem.

## 2. Hook `useProcedureSteps.ts`
- `useProcedureSteps(procedureId)` — lista ordenada por `sort_order`.
- `useCreateProcedureStep`, `useUpdateProcedureStep`, `useDeleteProcedureStep`, `useReorderProcedureSteps`.
- `useToggleProcedureStep({ id, checked, procedure_id, procedure_title })` — faz update e, se existir crise com `status IN ('em_alerta','crise_em_curso','retorno')`, insere entrada em `decision_log` com título tipo `✅ Ação executada` (ou `↩️ Ação desmarcada`) e texto `[Card] · Passo N: <texto>` + timestamp automático (created_at).

## 3. `ProceduresSection.tsx` — Dialog de edição
- Remover completamente os `Textarea` de `content_pt` / `content_en`.
- Manter apenas: Fase, Título PT/EN, Categoria PT/EN.
- Ao criar um card novo, os passos ficam vazios (adicionam-se no drawer).

## 4. `ProceduresSection.tsx` — Drawer (vista operacional)
Substituir a secção "Ações Sequenciais" (que hoje lê `parsed.actions` do markdown) por uma tabela de passos vindos de `procedure_steps`, com o mesmo estilo dos Action Cards Departamentais (ver `EmergencySection`):
- Cada linha: número sequencial, `Checkbox` (com toggle), texto (Input inline editável on-blur), botão eliminar, drag handle para reordenar.
- Botão `+ Adicionar passo` no fim.
- A "Descrição & Objetivo" (parágrafo) e "Regra de Ouro" deixam de existir — passa tudo a viver como passos (o utilizador poderá manter no primeiro passo se quiser). Alternativa: manter só a lista de passos e remover blocos derivados do markdown. Escolho **remover** para simplificar (matches pedido "várias linhas dessa nova tabela").

## 5. Log de crise
Ao fazer check num passo:
- Verificar `crises` ativas via query (`status IN ('em_alerta','crise_em_curso','retorno')`, ordenar por `crisis_date desc`, pegar a primeira).
- Se existir, `insert` em `decision_log`:
  - `title`: `✅ Passo executado` / `↩️ Passo revertido`
  - `text`: `[<Card title>] Passo <N>: <texto do passo>`
  - `author`: `Sistema`
  - `crisis_id`: id da crise ativa
- Timestamp é o `created_at` da linha (agora automático).

## 6. Contas técnicas
- Manter as colunas `content_pt`/`content_en` na tabela `procedures` (não apagar já — mantém histórico da migração); apenas deixam de ser editadas/exibidas.
- Os cartões (grid) passam a contar `steps.length` em vez de `parsed.actions.length` (nova query agregada ou fetch por card — usar uma query global `useAllProcedureSteps` a devolver `procedure_id → count`).

## Ficheiros afetados
- Nova migração SQL (tabela + data migration + policies + grants + trigger)
- `src/hooks/useProcedureSteps.ts` (novo)
- `src/components/sections/ProceduresSection.tsx` (drawer + dialog + contagem)
