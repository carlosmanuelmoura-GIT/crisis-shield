## Alterações

### 1. Base de dados
- Adicionar coluna `department_id` (uuid, nullable, FK → `departments.id`, ON DELETE SET NULL) à tabela `bia_processes`.

### 2. BIA Section (`src/components/sections/BIASection.tsx`)
- Adicionar `department_id` ao estado do formulário (criar/editar).
- Adicionar um Select "Departamento" no diálogo (a seguir ao Macro Processo), alimentado por `useDepartments`.
- Mostrar o nome do departamento no card/linha de cada BIA (junto ao DR Type e Business Process).
- Carregar `department_id` ao abrir edição.

### 3. Export BIA (`src/components/sections/ImportExportSection.tsx`)
- Adicionar colunas ao export e ao template:
  - `Departamento_ID`
  - `Departamento_Nome`
  - `DR_Type_Nome` (além do já existente `DR_Type_ID`)

### 4. Import BIA
Permitir importar identificando por **nome** (além do ID, mantendo retrocompatibilidade). Resolução:
- `DR_Type_Nome` → procura em `dr_types.name`; se `DR_Type_ID` vier, prevalece.
- `Business_Process_Nome` → já existe; manter.
- `Departamento_Nome` → procura em `departments.name`; `Departamento_ID` se fornecido prevalece.
- Se um nome não corresponder, a linha continua a ser importada mas o campo respectivo fica a `null` (e contabiliza-se um aviso no toast final).

### 5. Atualizar texto de ajuda
Atualizar a descrição/hint do upload BIA listando as novas colunas suportadas.

Não há alterações em lógica de negócio fora destes pontos.
