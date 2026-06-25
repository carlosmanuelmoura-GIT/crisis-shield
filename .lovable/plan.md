## Objetivo

Transformar a página **PCN Departamentais** numa página dinâmica baseada na tabela `departments`, mantendo as mesmas secções (Procedimentos, Lista de Contactos, Lista de Acesso ao CC, BIA, Documentos, Fornecedores). Importar os 22 departamentos hardcoded para a tabela `departments` sem duplicar os que já existam.

## 1. Migração de base de dados

Alterar `public.departments`:
- Adicionar `code TEXT UNIQUE` (ex: DAS, DSI…)
- Adicionar `has_cc BOOLEAN NOT NULL DEFAULT false` (controla a secção "Lista de Acesso ao CC")

Seed dos 22 departamentos atualmente hardcoded **sem duplicar**:
- Inserir por `code` com `ON CONFLICT (code) DO NOTHING`
- Para departamentos pré-existentes na tabela cujo `name` coincida com um dos 22, fazer `UPDATE` a preencher o `code` e `has_cc` em vez de inserir nova linha (match por `name` quando `code IS NULL`)

Departamentos com `has_cc = true`: DCR, DMR, DPG, DSI.

Os `pcn_documents` continuam ligados via `dept_code` (texto), pelo que mantêm-se válidos.

## 2. Refactor da página `PCNDepartamentaisSection.tsx`

- Remover o array hardcoded `departments`.
- Carregar departamentos via `useDepartments()` (já existe), ordenados por `code`/`name`.
- Render dos cartões accordion usa `dept.code`, `dept.name` e `dept.has_cc` vindos da BD.
- Mesma lógica de upload/listagem/eliminação de documentos por secção (`proc`, `contacts`, `cc`, `bia`, `fornecedores`).
- Se `has_cc` for false, a secção "Lista de Acesso ao CC" não aparece (comportamento atual preservado).
- Filtro de pesquisa por `code`/`name` mantém-se.

## 3. CRUD dos departamentos

Mantém-se no **Back Office > Departamentos** (já existente). Adicionar nesse formulário os novos campos `code` e `has_cc` para o utilizador poder criar/editar novos departamentos que aparecerão automaticamente na página PCN Departamentais.

## Resumo técnico

- Migration: `ALTER TABLE departments ADD COLUMN code`, `has_cc`; UPDATE por nome; INSERT ON CONFLICT.
- `useDepartments` passa a devolver `code` e `has_cc` (tipos regenerados pós-migração).
- `PCNDepartamentaisSection.tsx` consome a lista dinâmica.
- `BackOfficeSection.tsx` (secção Departamentos) ganha inputs `code` e checkbox `has_cc`.