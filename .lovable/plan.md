## Objetivo
Adicionar um segundo Pie Chart na secção BIA, por **Tipo de DR**, colocado lado a lado com o atual "BIAs por Tipo". Comportamento idêntico: clicar numa fatia filtra a lista abaixo; clicar de novo (ou "Limpar seleção") remove o filtro.

## Alterações (apenas `src/components/sections/BIASection.tsx`)

1. Novo estado: `selectedDRType: string | null`.

2. Novo dataset para o pie:
   - `drPieData` = para cada `dr_types`, contar `filteredByBP.filter(p => p.dr_type_id === dr.id).length`.
   - Adicionar bucket "Sem DR" (`id: null`) quando existirem BIAs sem `dr_type_id`.
   - Filtrar `value > 0`. Cores geradas a partir de tokens HSL (paleta baseada em `--primary`, `--accent`, etc., variando `hue`) — sem cores hardcoded.

3. Aplicar filtro à lista:
   - `filtered` passa a considerar também `selectedDRType`:
     `if (selectedDRType !== null_marker) filtrar por p.dr_type_id === selectedDRType` (usando sentinel `"__none"` para "Sem DR").
   - O `pieData` do Tipo BIA continua baseado em `filteredByBP` (para não desaparecerem fatias ao clicar no DR). Simetricamente, `drPieData` mantém-se baseado em `filteredByBP` — a seleção só afeta a lista, exatamente como o pie de Tipo BIA hoje.

4. Layout: envolver os dois cards num grid:
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     {/* Card BIAs por Tipo (existente) */}
     {/* Card BIAs por Tipo de DR (novo) */}
   </div>
   ```
   Card novo replica a estrutura do existente: header com título "BIAs por Tipo de DR" + botão "Limpar seleção" (se `selectedDRType`), `ResponsiveContainer` height 260, `Pie` com `onClick` a alternar `selectedDRType`, `Cell` com stroke/opacity conforme selecionado, tooltip e legend com os mesmos estilos.

5. Limpar seleção de DR também quando o utilizador clica em "Limpar filtros" na barra de filtros.

## Notas
- Sem alterações de dados, hooks, ou schema.
- Sem cores hardcoded — usar HSL derivado dos tokens do design system.
