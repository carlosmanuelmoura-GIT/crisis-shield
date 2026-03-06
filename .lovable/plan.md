

## Plan: Enhancements to Crisis Control Section

### Summary of Changes

1. **"DECLARAÇÃO DE CRISE" phase**: Replace checkbox list with a "Declarar Crise" button + field for "Autorizado por" (who authorized). When clicked, sets crisis status to `crise_em_curso` and logs to decision_log.

2. **"FIM DE CRISE" phase**: Add "Fim de Crise" button + "Aprovado por" field. Sets status to `fim` and logs.

3. **Decision Log integration**: Every crisis creation and every checkbox toggle writes an entry to `decision_log` table automatically.

4. **New crisis type "template"**: Add `template` option alongside `real` and `simulated`. Templates don't represent actual crises but serve as reusable action blueprints.

5. **Full CRUD on crisis data**: Add an "Edit Crisis" dialog in the Kanban view header to update title, date, type, and cabinet members of an existing crisis.

### Database Changes

**Migration** — Add columns to `crises` table:
```sql
ALTER TABLE public.crises ADD COLUMN declared_by TEXT NOT NULL DEFAULT '';
ALTER TABLE public.crises ADD COLUMN ended_by TEXT NOT NULL DEFAULT '';
```

No enum change needed for `crisis_type` since it's a `text` column already accepting any value.

### File Changes

#### 1. `supabase/migrations/[timestamp].sql`
- Add `declared_by` and `ended_by` columns to `crises` table.

#### 2. `src/hooks/useCrises.ts`
- Update `DBCrisis` interface to include `declared_by` and `ended_by`.
- Update `useUpdateCrisis` to accept `declared_by`, `ended_by`, `crisis_date`, and full cabinet member updates.
- Add `useUpdateCabinetMembers` mutation (delete all + re-insert for a crisis).
- Add `useCreateDecisionLogFromCrisis` or import existing `useCreateDecisionLog` for logging.

#### 3. `src/components/sections/CrisisControlSection.tsx`

**Crisis list (main view):**
- Add `TEMPLATE` to the type badge display.
- Add an edit button per row (opens edit dialog pre-filled with crisis data).

**Create/Edit dialog:**
- Add `template` as third option in type selector.
- Reuse same dialog for editing (pre-fill all fields including cabinet members loaded from DB).

**Kanban view — "declaracao" phase:**
- Instead of checkbox actions, show:
  - An `Input` for "Autorizado por / Authorized by"
  - A prominent "Declarar Crise" button (red, with AlertTriangle icon)
  - Only visible when status is `registada` or `em_alerta`
  - On click: updates crisis status to `crise_em_curso`, sets `declared_by`, and inserts a decision_log entry.

**Kanban view — "fim" phase:**
- Instead of/in addition to checkbox actions, show:
  - An `Input` for "Aprovado por / Approved by"
  - A "Fim de Crise" button (green, with CheckCircle icon)
  - Only visible when status is not already `fim`
  - On click: updates status to `fim`, sets `ended_by`, and inserts a decision_log entry.

**Kanban view — logging on checkbox toggle:**
- After each `toggleAction.mutate`, also call `createDecisionLog` with text like: `"✅ [phase] — [action text]"` or `"↩️ [phase] — [action text] (unchecked)"`.

**Kanban view header:**
- Add edit (pencil) button next to crisis title that opens the edit dialog.

#### 4. Decision log entries format
- Crisis created: `"📋 Crise registada: [title]"`
- Crisis declared: `"🚨 Crise declarada por [name]: [title]"`
- Crisis ended: `"✅ Fim de crise aprovado por [name]: [title]"`
- Action checked: `"✅ [phase label] — [action text]"`
- Action unchecked: `"↩️ [phase label] — [action text]"`

