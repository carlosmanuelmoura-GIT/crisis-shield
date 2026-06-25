## Alterações na página BIAS

### 1. Substituir gráfico de barras por Pie Chart
- Remover o `BarChart` actual.
- Adicionar um **PieChart** (recharts) agrupando BIAs por **Tipo de BIA** (VITAL / DECISÃO / ANALÍTICA), cores alinhadas ao `critColor` já usado.
- Legenda + tooltip com contagem.

### 2. Pie Chart interactivo (filtro por slice)
- Estado novo `selectedTipoBIA` em `BIASection`.
- `onClick` num slice define o filtro; clicar de novo no mesmo slice limpa.
- Slice activo destacado (stroke + opacidade reduzida nos restantes).
- A lista por baixo respeita este filtro, combinado com os filtros existentes (pesquisa, departamento, action card).

### 3. Apresentação das BIAs por Departamento em acordeão
- Substituir a listagem linear por um `Accordion` (shadcn) com um item por **Departamento**.
- Cabeçalho: nome do departamento + badge com nº de BIAs.
- BIAs sem departamento agrupadas num item "Sem departamento".
- Departamentos ordenados alfabeticamente.

### 4. Dentro de cada departamento: cartões Kanban por Tipo de DR
- Ao expandir um departamento, mostrar as BIAs em **colunas Kanban**, uma coluna por **Tipo de DR** (`dr_types`).
- Coluna extra "Sem DR" para BIAs sem `dr_type_id`.
- Cada cartão mantém as acções actuais (editar, eliminar, ligar plataformas, ligar action cards, badges de processo/departamento/tipo BIA/action cards).
- Layout: colunas com scroll horizontal quando necessário; sem drag-and-drop nesta iteração (o Tipo de DR continua editável pelo diálogo existente).

### Ficheiros afectados
- `src/components/sections/BIASection.tsx` — única alteração; usa `Accordion`, `Card` (shadcn) e `recharts` já presentes no projecto.

### Fora de âmbito
- Sem alterações de schema, hooks ou import/export.
- Sem alterações ao diálogo de criação/edição de BIA.
