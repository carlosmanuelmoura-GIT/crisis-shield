# Autonomia no momento + ajustes no diálogo das ações das fases da crise

## 1) Autonomia no momento = autonomia estimada
Atualização de dados na tabela de edifícios: para todos os edifícios, o valor de "autonomia no momento" (`autonomia_atual_horas`) passa a ser igual à "autonomia estimada" (`autonomia_horas_contingencia`), e a data da leitura é marcada com o momento da atualização. A tabela, os filtros e o PDF passam a refletir estes valores automaticamente.

## 2) Diálogo de confirmação das ações das fases (Controlo de Gestão de Crise)
No ecrã de controlo da crise, ao marcar uma ação de uma fase abre um diálogo de confirmação. Ajustes:
1. A primeira etiqueta passa a ser **"Dep Origem"** (hoje é "DEP Origem da Informação").
2. O campo **Notas** passa de caixa de uma linha para uma **área de texto maior** (várias linhas).
3. O **diálogo fica maior** (largura alargada).
4. Ao abrir o diálogo numa ação que já tem informação registada, os campos aparecem **pré-preenchidos com o conteúdo existente**, em vez de virem vazios — assim confirmar não apaga o que lá estava.

## Detalhes técnicos
- **Dados**: uma migração/UPDATE em `public.buildings`: `autonomia_atual_horas = autonomia_horas_contingencia`, `autonomia_atual_medida_em = now()` para todas as linhas.
- **Código**: apenas `src/components/sections/CrisisControlSection.tsx`:
  - Label do primeiro campo alterada para "Dep Origem".
  - Campo Notas: `Input` → `Textarea` com ~4 linhas.
  - `DialogContent`: de `max-w-md` para `max-w-2xl`.
  - `handleToggle`: ao abrir o diálogo, preencher `confirmForm` com `info_department`, `info_person` e `notes` já existentes na ação (em vez de limpar para "").

## Validação
- Confirmar que todos os edifícios mostram autonomia no momento igual à estimada.
- Abrir o diálogo de confirmação numa ação já com dados e verificar que os campos vêm preenchidos e o diálogo está maior.
