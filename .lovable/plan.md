Adicionar a possibilidade de editar o nome de cada ação (checklist item) dentro dos Action Cards, em ambas as vistas (lista e Kanban).

Alterações previstas:
1. **Novo hook** em `src/hooks/useActionCards.ts`: `useUpdateChecklistItem` para atualizar `text_pt` e `text_en` de um item existente na tabela `checklist_items`.
2. **Edição inline** em `src/components/sections/EmergencySection.tsx`:
   - Adicionar um ícone de lápis (Pencil) ao lado do ícone de eliminar (Trash2) em cada linha de ação, em ambas as vistas.
   - Ao clicar no lápis, o texto passa a ser uma `Input` com o valor atual.
   - Guardar ao pressionar `Enter` ou ao perder foco (`onBlur`); cancelar com `Escape`.
   - Na atualização, guardar o novo texto em ambos os campos `text_pt` e `text_en` (o mesmo comportamento usado na criação de novos itens).
   - Manter o checkbox e o botão de eliminar funcionalmente inalterados durante a edição.
3. **Sem migração de base de dados** necessária: a tabela `checklist_items` já tem os campos `text_pt` e `text_en`.

Após a implementação, validar que o nome da ação pode ser editado, guardado e que as alterações refletem imediatamente em ambas as línguas.