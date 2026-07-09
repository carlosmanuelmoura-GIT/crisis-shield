## Objective

1. In the BIA Kanban cards, replace the displayed **RTO/RPO** line with the **Tipo de BIA** (criticality) badge.
2. Automatically clear all action-card checklist checkboxes when any crisis reaches the final status **"fim"**.

## Changes

### Frontend — `src/components/sections/BIASection.tsx`
- In the BIA Kanban card renderer, remove the line that shows `RTO: {p.rto}h · RPO: {p.rpo}h`.
- Add a `Badge` showing the BIA criticality label (`VITAL`, `DECISÃO`, `ANALÍTICA`) using the existing `tipoLabel` and `critColor` maps.

### Frontend — `src/hooks/useCrises.ts`
- Update `useUpdateCrisis` `onSuccess` invalidation: when the mutation sets `status: "fim"`, also invalidate the `checklist_state` query so the UI refetches the now-empty checkboxes.

### Backend — new migration
- Create a `SECURITY DEFINER` trigger function `clear_checklist_state_on_crisis_end()` on `public.crises`.
- The trigger fires `AFTER UPDATE` and deletes all rows from `public.checklist_state` when `NEW.status = 'fim'` and the old status was different.
- Grant execute on the function to `authenticated` and `service_role`.

## Acceptance

- BIA cards no longer display RTO/RPO and instead show a coloured "VITAL / DECISÃO / ANALÍTICA" badge.
- When a crisis is moved to "FIM", all action-card checkboxes become unchecked for all users after the next data refetch.