## Plan: Remover indicação de CC no Back Office - Departamentos

### Goal
Remover no Back Office, na entrada "Departamentos", qualquer indicação/visualização do "Comando e Controlo / Centro de Comando (CC)".

### Changes
1. **Listagem de departamentos** (`src/components/sections/BackOfficeSection.tsx`)
   - Remover o `Badge` "CC" exibido ao lado do nome do departamento quando `has_cc` é verdadeiro.

2. **Diálogo de criação/edição de departamento** (`src/components/sections/BackOfficeSection.tsx`)
   - Remover a checkbox e a label "Tem Centro de Comando (CC)" / "Has Command Center (CC)".

### Scope
- Apenas alterações de apresentação no componente `BackOfficeSection.tsx`.
- O campo `has_cc` na base de dados e no hook `useDepartments` mantém-se inalterado (continua a ser usado pela página PCN Departamentais para decidir quais departamentos mostram a "Lista de Acesso ao CC").
- Não são necessárias migrations.

### Validation
- Abrir a página Back Office → Departamentos e confirmar que:
  - Nenhuma linha da tabela mostra um badge "CC".
  - O formulário de novo/editar departamento não apresenta a checkbox de CC.