Implementar uma legenda visível no topo da secção de Action Cards (Emergência) que explique o código de cores da severidade (Crítico/Alto/Médio), utilizando os rótulos e cores já existentes.

### Alterações
- **Ficheiro:** `src/components/sections/EmergencySection.tsx`
- Adicionar um componente de legenda no topo, junto ao cabeçalho ou logo acima dos filtros, com:
  - Crítico → vermelho (crise)
  - Alto → laranja/alerta
  - Médio → tom neutro/padrão
- Usar os textos já traduzidos (PT/EN) com base no `lang` do contexto.
- Reutilizar as definições existentes `severityColors` e `severityLabels` para manter consistência.
- Mostrar a legenda em ambas as vistas (Kanban e Lista).

### Notas técnicas
- Não alterar a estrutura de dados (`severity` mantém-se na tabela `action_cards`, hooks e tipos).
- A legenda deve ser compacta para não ocupar espaço excessivo (ex: linha horizontal com chips/badges coloridos).
- Não adicionar dependências externas.