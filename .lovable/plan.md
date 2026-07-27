## Objetivo
No "Log das Acções Gestão Crise", dentro de cada crise, apresentar TODOS os logs (sistema + decisões manuais) numa única lista ordenada cronologicamente do mais antigo para o mais novo, sem separar por tipo.

## Alterações — `src/components/sections/DecisionLogSection.tsx`

1. Remover a separação entre `systemEntries` e `decisionEntries` dentro do `AccordionContent` (linhas 262-263 e 294-354).
2. Renderizar `group.entries` (já ordenado ASC em `useMemo`) numa única iteração:
   - Detetar entradas de sistema com a mesma heurística atual (`title === ""` e `text` começa com 🚨/✅/📋) para manter o estilo compacto (linha muted) sem botões de editar/eliminar.
   - As restantes entradas continuam a renderizar como Card com autor, título e ações Editar/Eliminar.
3. Manter o badge do contador no header — passa a contar `group.entries.length` (total).

Sem alterações de dados, hooks ou SQL.
