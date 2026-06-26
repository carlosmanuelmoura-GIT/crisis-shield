## Alterações em Procedimentos Gestão Crise

**Ficheiro:** `src/components/sections/ProceduresSection.tsx`

1. **Layout 2 colunas em vez de 3**
   - Mudar grid de `lg:grid-cols-3` para `lg:grid-cols-2`.
   - Manter as 3 fases (PREPARAÇÃO, GESTÃO DA CRISE, FIM DA CRISE) — duas na primeira linha, uma na segunda (ou ajustar conforme preferência; por defeito fluxo natural do grid).

2. **Drag-and-drop dentro da mesma caixa (reordenação)**
   - Adicionar campo `sort_order` (int) à tabela `procedures` via migração; inicializar com base na ordem atual.
   - Atualizar `useProcedures` para ler/escrever `sort_order` e ordenar por `phase` + `sort_order`.
   - No `onDrop`:
     - Se o destino é a mesma fase → reordenar (recalcular `sort_order` dos itens da coluna conforme posição do alvo).
     - Se é outra fase → comportamento atual (mudar `phase`) + colocar no fim (maior `sort_order`).
   - Adicionar handlers `onDragOver`/`onDrop` em cada cartão para detetar a posição alvo dentro da coluna (inserir antes do cartão sobre o qual se larga).

Sem outras alterações de UI ou lógica.
