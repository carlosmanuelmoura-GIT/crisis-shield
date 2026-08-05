# Campo Tier na tabela de Edifícios

O Tier passa a ser um dado guardado em cada edifício, editável no CRUD, com valor sugerido automaticamente a partir da autonomia.

## Base de dados

Nova coluna `tier` na tabela de edifícios (texto), com os valores:
- `tier1` — Tier 1 · Crítico
- `tier2` — Tier 2 · Intermédio
- `tier3` — Tier 3 · Agência & Numerário
- `tier4` — Tier 4 · Agências
- `na` — Por validar (valor por defeito)

Preenchimento inicial dos edifícios existentes com o Tier que hoje é calculado (>=48h Tier 1, 12-48h Tier 2, <12h com gerador Tier 3, sem gerador Tier 4, sem autonomia registada Por validar).

## Ecrã Autonomia Energética

- Novo campo "Tier" no diálogo de criar/editar, em lista de seleção com as 5 opções.
- Ao criar um edifício, ou ao alterar autonomia/nº de geradores, o campo mostra a sugestão automática, que o utilizador pode manter ou trocar. O valor gravado é sempre o que ficar escolhido.
- A coluna Tier da tabela, os cartões de indicadores e os filtros por Tier passam a usar o valor gravado em vez do cálculo.
- O indicador "Edifícios frágeis" passa a contar os edifícios em Tier 4.

## Relatório PDF

O agrupamento por Tier no Relatório Diesel passa a usar o valor gravado, incluindo o grupo "Por validar".

## Notas técnicas

- Migração: `ALTER TABLE public.buildings ADD COLUMN tier text NOT NULL DEFAULT 'na'` + `UPDATE` de backfill.
- `src/hooks/useBuildings.ts`: adicionar `tier` a `Building` e `BuildingInput`.
- `src/components/sections/AutonomiaEnergeticaSection.tsx`: `computeTier` passa a servir apenas de sugestão no formulário; leitura/filtros/KPIs usam `b.tier`; adicionar `tier4` ao mapa `TIER_META`.
- `src/lib/generateDieselReportPDF.ts`: aceitar `tier` no tipo `DieselBuilding`, adicionar chave `tier4` a `TIER_LABEL`/`TIER_COLOR` e agrupar pelo valor gravado.
- Sem alterações ao design system.
