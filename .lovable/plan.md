## Objetivo
No "Controlo da Gestão de Crise", ao criar uma nova crise **Real** ou **Simulada** (aba "Crises Reais"), passar a perguntar qual o **template** a usar. Se for escolhido um template, a nova crise é criada como cópia integral das ações desse template. Se não for escolhido nenhum, a crise é criada vazia.

## Alterações
Ficheiro: `src/components/sections/CrisisControlSection.tsx`

1. **Diálogo de criação (aba "Crises Reais")**
   - Adicionar um novo campo `Select` "Template base" no `CrisisFormDialog`, listando todas as crises com `crisis_type = "template"` mais a opção "(Nenhum — crise vazia)".
   - Campo só aparece em modo **criação** de crise Real/Simulada (não aparece quando se está a editar, nem quando `formType === "template"`, nem quando já se está a clonar via botão Copy).
   - Estado novo: `formTemplateId: string | null` (default `null`).

2. **Submissão**
   - Em `handleSubmit`, se houver `formTemplateId` selecionado, passar `clone_from_id: formTemplateId` para `createCrisis.mutateAsync(...)`.
   - O hook `useCreateCrisis` já replica todas as `crisis_phase_actions` do `clone_from_id` — nenhuma alteração de hook ou de base de dados necessária.

3. **Reset**
   - Incluir `setFormTemplateId(null)` em `resetForm()`.
   - Em `openCreate(cloneId)` (botão Copy existente), pré-preencher `formTemplateId` com `cloneId` para refletir a fonte e manter coerência com o novo campo.

## Validação
- Aba "Crises Reais" → "Nova Crise": dropdown "Template base" visível, com lista de templates existentes + "Nenhum".
- Escolher template → submeter → nova crise aparece com todas as ações do template copiadas (verificável ao abrir a vista Kanban da nova crise).
- Não escolher template → nova crise é criada sem ações.
- Aba "Templates" → "Nova Crise": dropdown não aparece (criação de template continua igual).
- Editar crise existente: dropdown não aparece.
