## Objetivo
No diálogo "Associar BIA" dos Action Cards Departamentais, mostrar apenas as BIAs do departamento do Action Card em causa e apresentar o Nome + Descrição de cada BIA.

## Alterações

**Ficheiro:** `src/components/sections/EmergencySection.tsx` (diálogo "Link BIA to Action Card", ~linhas 883-921)

1. **Filtrar por departamento**
   - Obter `card.department_id` a partir do `linkBiaDialogCard`.
   - Filtrar `biaProcesses` por `bia.department_id === card.department_id` (além de excluir as já associadas).
   - Se o Action Card não tiver departamento, manter lista completa (fallback) com aviso subtil.

2. **Substituir `Select` por lista visual**
   - Trocar o componente `Select` por uma lista scrollável (`max-h-[400px] overflow-auto`) de cartões clicáveis.
   - Cada item mostra:
     - **Nome da BIA** (`name_pt` / `name_en`) — destaque
     - **Descrição** (`description`) ou o fallback atual `Nome · Processo` em texto secundário
   - Selecção visual (ring/border) do item escolhido; `biaToLink` continua a armazenar o id.

3. **Empty state**
   - Se não existirem BIAs para o departamento: mensagem "Sem BIAs para este departamento".

4. **Largura do diálogo**
   - Aumentar `max-w-md` → `max-w-lg` para acomodar descrições.

Sem alterações de schema, hooks ou lógica de mutação — apenas UI do diálogo de associação.