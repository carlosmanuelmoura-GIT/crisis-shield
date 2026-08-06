# Remover o separador "Edifícios" do Back Office

A gestão de edifícios passa a existir apenas na página "Autonomia Energética Edifícios", que já tem CRUD completo (criar, editar, eliminar, tier, autonomia, geradores, UPS, observações).

## O que muda

- Remover o separador "Edifícios" da barra de separadores do Back Office.
- Remover a respetiva listagem/tabela e o diálogo de criação/edição de edifícios.
- Nenhuma alteração de dados: a tabela de edifícios e todos os registos mantêm-se intactos e continuam a ser geridos na Autonomia Energética.
- A referência a edifícios no calendário de testes continua a funcionar (lê a mesma tabela).

## Detalhe técnico

Em `src/components/sections/BackOfficeSection.tsx`:
- Remover o `TabsTrigger` e o `TabsContent` com `value="buildings"`.
- Remover o `Dialog` de edifício e o estado associado (`bldDialog`, `editingBld`, `bldForm`, `openCreateBld`, `openEditBld`, `handleSaveBld`, `handleDeleteBld`).
- Remover os hooks `useBuildings`/`useCreateBuilding`/`useUpdateBuilding`/`useDeleteBuilding` e imports agora não usados (incluindo `BuildingIcon` se ficar órfão).
- Atualizar a nota em `src/components/sections/TestCalendarSection.tsx` que indica "Configure edifícios no Back Office" para apontar para Autonomia Energética.
- Ajustar a descrição do Back Office em `src/lib/appOverviewContent.ts` para deixar de listar "edifícios".
