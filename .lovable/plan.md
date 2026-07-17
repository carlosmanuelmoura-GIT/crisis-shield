Objetivo: alterar apenas os textos visíveis (labels) do conceito "Recurso" para "Tipo de Falha" em todas as páginas web, mantendo inalterados os identificadores de código, tabelas da base de dados e variáveis internas.

Ficheiros e alterações previstas:

1. `src/components/CrisisFAB.tsx`
   - "Recurso(s) que se perderam" → "Tipo de Falha(s) que se perdeu/perdeu"
   - "Resource(s) lost" → "Failure Type(s) lost"
   - "Recursos perdidos:" → "Tipos de Falha perdidos:"
   - "Resources lost:" → "Failure Types lost:"
   - "Sem recursos configurados." → "Sem tipos de falha configurados."
   - "No resources configured." → "No failure types configured."

2. `src/components/sections/ScenariosSection.tsx`
   - "Arraste recursos entre cenários" → "Arraste tipos de falha entre cenários"
   - "Drag resources between scenarios" → "Drag failure types between scenarios"
   - "Editar Recurso" → "Editar Tipo de Falha"
   - "Edit Resource" → "Edit Failure Type"
   - "Recurso atualizado" → "Tipo de Falha atualizado"
   - "Resource updated" → "Failure Type updated"
   - "Recurso clonado" → "Tipo de Falha clonado"
   - "Resource cloned" → "Failure Type cloned"
   - "Recurso movido" → "Tipo de Falha movido"
   - "Resource moved" → "Failure Type moved"
   - "rec." / "res." → "fal." / "fail."
   - "Clonar recurso" → "Clonar tipo de falha"
   - "Clone resource" → "Clone failure type"

3. `src/components/sections/BackOfficeSection.tsx`
   - Tab "Recursos" / "Resources" → "Tipos de Falha" / "Failure Types"
   - "Novo Recurso" → "Novo Tipo de Falha"
   - "New Resource" → "New Failure Type"
   - "Editar Recurso" → "Editar Tipo de Falha"
   - "Edit Resource" → "Edit Failure Type"
   - "Recursos que se perdem" → "Tipos de Falha que se perdem"
   - "Resources lost" → "Failure Types lost"
   - "Nenhum recurso configurado." → "Nenhum tipo de falha configurado."
   - "No resources configured." → "No failure types configured."
   - "Associar Recurso ao Cenário" → "Associar Tipo de Falha ao Cenário"
   - "Link Resource to Scenario" → "Link Failure Type to Scenario"
   - "Selecionar recurso..." → "Selecionar tipo de falha..."
   - "Select resource..." → "Select failure type..."

4. `src/components/sections/EmergencySection.tsx`
   - "Recurso" (filtro) → "Tipo de Falha"
   - "Resource" (filter) → "Failure Type"
   - "Recurso: {groupLabel}" → "Tipo de Falha: {groupLabel}"
   - "Resource: {groupLabel}" → "Failure Type: {groupLabel}"
   - "Recurso que se perde" → "Tipo de Falha que se perde"
   - "Resource lost" → "Failure Type lost"

Notas:
- Não serão alterados nomes de tabelas (`recursos`), hooks (`useRecursos`), variáveis (`recurso_id`, `selectedRecursos`) nem comentários internos de código, a menos que sejam visíveis na UI.
- As traduções em inglês seguirão o equivalente "Failure Type".
- Após as alterações, será executada uma verificação de build para garantir que não houve erros de sintaxe.