Plano para alterar o Log das Acções de Crise para mostrar no máximo 2 colunas por linha na vista Kanban, sem scroll horizontal.

## Alteração
Em `src/components/sections/DecisionLogSection.tsx`, o Kanban atual usa `flex gap-3 overflow-x-auto pb-3` com colunas de `w-[320px]`, o que empilha todas as crises numa única linha horizontal. Vou mudar para uma grid com no máximo 2 colunas por linha, com cada coluna a ocupar a metade da largura disponível, permitindo ler tudo com scroll vertical.

## Detalhes técnicos
- Substituir o container `flex gap-3 overflow-x-auto pb-3` por `grid grid-cols-1 md:grid-cols-2 gap-3 pb-3`.
- Remover a largura fixa `w-[320px]` das colunas do Kanban, para que cada coluna preencha a célula da grid.
- Manter a altura máxima e scroll vertical dentro de cada coluna (`max-h-[70vh] overflow-y-auto`).
- Preservar todos os filtros (Ano/Mês), diálogos, empty states, contadores e comportamentos existentes.
- Garantir que em ecrãs pequenos (mobile) fica apenas 1 coluna (`grid-cols-1`).

## Ficheiro a alterar
- `src/components/sections/DecisionLogSection.tsx`