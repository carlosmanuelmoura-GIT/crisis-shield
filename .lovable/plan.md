Mover a entrada "Salas de Reuniões" para o final da secção "OPERAÇÕES GCN" na barra lateral.

## Contexto
A barra lateral (`src/components/AppSidebar.tsx`) organiza a navegação em grupos. Dentro do grupo "OPERAÇÕES GCN" (constante `warRoomItems`), a entrada "Salas de Reuniões" encontra-se atualmente entre "Action Cards Departamentos" e "Autonomia Energética Edifícios". O utilizador pretende que seja a última entrada desse grupo.

## Alteração
Em `src/components/AppSidebar.tsx`, reordenar o array `warRoomItems` para que o item `{ id: "meetings", ... }` ocupe a última posição, mantendo os restantes itens na ordem atual.

Ordem resultante:
1. Controlo da Gestão de Crise
2. Action Cards Gestão de Crise
3. Action Cards Departamentos
4. Autonomia Energética Edifícios
5. Log das Acções Gestão Crise
6. Salas de Reuniões

## Ficheiros afetados
- `src/components/AppSidebar.tsx`

## Notas
- Alteração puramente de apresentação/ordenação; sem impacto em estado, backend ou outras funcionalidades.
- O texto da entrada já foi previamente atualizado para "Salas de Reuniões ".