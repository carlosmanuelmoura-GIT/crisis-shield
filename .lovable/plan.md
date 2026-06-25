Refactor `src/components/sections/DecisionLogSection.tsx` to present the action log in **Kanban** mode, with each crisis as its own column on a single horizontal row, plus a date filter by month/year.

## Layout
- Replace the vertical accordion of crisis groups with a horizontal Kanban board: one column per crisis (Real or Simulated), scrolling horizontally with `overflow-x-auto`.
- Each column header keeps the existing metadata: title, type icon (Shield/Real or FlaskConical/Simulated), date, status badge, "Ativa" badge when applicable, and the action counter.
- Column body lists the action cards stacked vertically (system entries + decision entries), reusing the current card markup. Each column has its own internal scroll (`max-h-[70vh] overflow-y-auto`).
- "Nova Acção" button stays in the section header and continues to attach to the currently active crisis.

## Filters
Add a filter bar above the board with three controls:
- **Ano** Select: "Todos" + distinct years derived from `crisis_date`.
- **Mês** Select: "Todos" + 12 months (localised). Disabled when Ano = "Todos".
- "Limpar filtros" button when any filter is active.

Filtering rules:
- Ano = Todos → show all crises.
- Ano selected, Mês = Todos → show all crises in that year.
- Ano + Mês selected → show only crises in that month/year.
- Filter is applied to the crisis's `crisis_date`.

## Technical notes
- Reuse existing hooks (`useDecisionLog`, `useCrises`) and the current grouping logic; just change how groups are rendered (columns instead of collapsibles) and add a `filteredGroups` memo using the year/month state.
- Remove the Collapsible wrapper and expand/collapse state (no longer needed since columns are always open in Kanban).
- Keep i18n (PT/EN) consistent with existing patterns.
- No DB changes.