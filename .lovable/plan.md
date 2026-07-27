## Diagnóstico

Na vista Kanban dos Action Cards de departamento (`EmergencySection.tsx`, linhas ~618‑619), o container das colunas é:

```tsx
<div className="flex gap-3 overflow-x-auto pb-4" ...>
```

Cada coluna é `flex-shrink-0 w-80` (320 px). O container herda a largura total da área de conteúdo mas **não tem padding horizontal**, pelo que a primeira coluna encosta ao limite esquerdo. Como o wrapper de secção acima aplica sombra/borda arredondada e o layout desktop tem overflow do `<main>` com scroll, a borda esquerda da primeira coluna fica visualmente "colada"/cortada — mais evidente no cenário DSP (Indisponibilidade de Sistemas) porque é a coluna com mais cartões e maior sombra acumulada, o que torna o corte percetível.

Faltam também dois detalhes que agravam o efeito:
- Sem `scroll-padding-left`, ao fazer scroll horizontal a primeira coluna aparece rente à margem.
- Sem `min-w-0` no ancestral flex, alguns browsers arredondam a largura para baixo (~1 px) em viewports com DPR ≠ 1 (o cliente atual usa dpr 0.9), causando clipping subpixel.

## Correção

Ajuste puramente visual em `src/components/sections/EmergencySection.tsx` no wrapper da vista Kanban (linha ~619):

- Adicionar `px-1` (padding horizontal leve) para dar respiração à primeira e última colunas.
- Adicionar `scroll-px-1` para preservar esse respiro durante o scroll horizontal.
- Adicionar `snap-x snap-mandatory` opcional e `snap-start` nas colunas para melhor navegação (nice‑to‑have; posso omitir se preferir manter scroll livre).

Resultado: sem alterar larguras, cores ou lógica — apenas garante que nenhuma coluna fica cortada pelo limite do container.

## Fora de âmbito

- Não altero larguras (`w-80`), tokens de cor, sombra, ou a lógica de agrupamento por cenário.
- Não toco na vista lista/kanban de outras secções.