## Alteração 1 — Action Cards: substituir Sub-capacidade por Cenário

**Banco de dados (migration):**
- Remover coluna `sub_capacidade_id` da tabela `action_cards` (e dropar FK).
- Adicionar `cenario_id uuid` em `action_cards` com FK para `cenarios(id) ON DELETE SET NULL`.
- Manter `recurso_id` e `department_id` (relação Recurso↔Departamento preservada).

**UI (`EmergencySection.tsx`):**
- Filtros passam a ser exatamente 3: **Cenário**, **Departamento** (renomeação do label "Owner"→"Departamento"), **Recurso**.
- Remover qualquer filtro/uso de Sub-capacidade.
- Formulário Novo/Editar card: trocar campo Sub-capacidade por Cenário (Select com lista de `cenarios`).
- Agrupamento (List view e Kanban): agrupar por **Cenário** (em vez de Sub-capacidade), mantendo o agrupamento secundário por Recurso quando aplicável.
- Drag & drop entre colunas Kanban passa a alterar `cenario_id` em vez de `sub_capacidade_id`.
- Ajustar `useActionCards` para incluir `cenario_id` no payload de create/update.

## Alteração 2 — BIA ↔ Action Cards

**Banco de dados (migration):** nova tabela de junção
```
public.bia_action_cards (
  id uuid PK,
  bia_process_id uuid FK -> bia_processes ON DELETE CASCADE,
  action_card_id uuid FK -> action_cards ON DELETE CASCADE,
  created_at timestamptz,
  UNIQUE(bia_process_id, action_card_id)
)
```
Com GRANTs (`authenticated`, `service_role`), RLS habilitada, políticas: SELECT autenticado, INSERT/DELETE para `is_privileged`.

**UI (`BIASection.tsx`):**
- No detalhe/edição de cada BIA, nova secção "Action Cards" listando apenas os action cards associados (via tabela de junção).
- Botão **"Adicionar Action Card"** que abre diálogo com Select dos action cards ainda não associados a essa BIA; ao confirmar, cria a linha na junção.
- Permitir remover a associação (botão X por linha).

## Alteração 3 — Checklist dos Action Cards: numerar e eliminar linhas

**UI (`EmergencySection.tsx`):**
- Renderizar a lista de itens com numeração sequencial (`1.`, `2.`, …) baseada no `sort_order`, tanto na vista List como Kanban.
- Adicionar botão de eliminar (ícone lixo) por item, visível para utilizadores privilegiados; chamar delete em `checklist_items` (já existe política DELETE para `especialista_gcn` — confirmar/alargar para `is_privileged` se necessário para Steering GCN poder remover).

## Notas técnicas
- Regenerar tipos do Supabase (automático após migration aprovada).
- Atualizar memória `mem://logic/organizacao-cards` para refletir agrupamento por Cenário (em vez de Sub-capacidade).
- Sem alterações a Import/Export nesta iteração (não solicitado).
