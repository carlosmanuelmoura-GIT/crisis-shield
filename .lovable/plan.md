## Objetivo
Substituir os campos de texto de uma única linha por áreas de texto (textarea) de multi-linha nos passos dos Action Cards, de modo a ser possível ver pelo menos 3 linhas de conteúdo.

## Escopo
- **Action Cards de Gestão de Crise** (`src/components/sections/ProceduresSection.tsx`)
  - Campo de edição inline de cada passo no drawer.
  - Campo de adição de novo passo.
- **Action Cards de Departamentos** (`src/components/sections/EmergencySection.tsx`)
  - Campo de edição inline de cada ação no drawer.
  - Campo de adição de nova ação.

## Alterações técnicas
1. Em `ProceduresSection.tsx`:
   - Adicionar import do componente `Textarea`.
   - Substituir o `<Input>` de edição de passo por `<Textarea rows={3} ... />`.
   - Substituir o `<Input>` de novo passo por `<Textarea rows={3} ... />`.
   - Ajustar classes de altura/padding para manter alinhamento com checkbox, número de sequência e botões.

2. Em `EmergencySection.tsx`:
   - Substituir o `<Input>` de edição de ação por `<Textarea rows={3} ... />`.
   - Substituir o `<Input>` de nova ação por `<Textarea rows={3} ... />`.
   - Manter o comportamento de Enter/Escape na edição (possivelmente ajustar para Ctrl+Enter ou blur).
   - Garantir que o texto das ações também seja apresentado com quebra de linha visível no modo de leitura.

## Critérios de aceitação
- Os campos de texto dos passos/ações mostram pelo menos 3 linhas de altura.
- O texto com múltiplas linhas é visível e editável sem scroll excessivo.
- O layout do drawer mantém-se organizado (checkbox, numeração, botões alinhados ao topo).
- Não há regressão nas funcionalidades de check, edição, eliminação e reordenação.

## Não inclui
- Alterações ao modelo de dados ou backend.
- Alterações ao fluxo de logs ou permissões.