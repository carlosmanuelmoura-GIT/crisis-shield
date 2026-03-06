
# CRUD para Procedimentos e BIA

## Resumo
Os Procedimentos e os processos BIA estao atualmente guardados num ficheiro JSON estatico. Vamos criar tabelas na base de dados para cada um e adicionar funcionalidade completa de criar, editar e eliminar, seguindo o mesmo padrao usado nos Action Cards.

## Alteracoes

### 1. Criar tabelas na base de dados

**Tabela `procedures`:**
- `id` (uuid, PK)
- `title_pt` (text)
- `title_en` (text)
- `category_pt` (text)
- `category_en` (text)
- `content_pt` (text) -- conteudo markdown
- `content_en` (text)
- `owner_id` (uuid, nullable)
- `created_at`, `updated_at` (timestamptz)

**Tabela `bia_processes`:**
- `id` (uuid, PK)
- `name_pt` (text)
- `name_en` (text)
- `rto` (numeric) -- horas
- `rpo` (numeric) -- horas
- `criticality` (text) -- critical/high/medium
- `dependencies` (text[]) -- array de IDs
- `owner_id` (uuid, nullable)
- `created_at`, `updated_at` (timestamptz)

**Politicas RLS** (mesmo padrao dos action_cards):
- SELECT: todos os autenticados
- INSERT: utilizadores privilegiados
- UPDATE: owner ou privilegiados
- DELETE: especialista_gcn

**Dados iniciais**: seed com os dados atuais do JSON.

### 2. Criar hooks de dados

**`src/hooks/useProcedures.ts`** -- seguindo o padrao de `useActionCards.ts`:
- `useProcedures()` -- query
- `useCreateProcedure()`
- `useUpdateProcedure()`
- `useDeleteProcedure()`

**`src/hooks/useBIAProcesses.ts`**:
- `useBIAProcesses()` -- query
- `useCreateBIAProcess()`
- `useUpdateBIAProcess()`
- `useDeleteBIAProcess()`

### 3. Atualizar componentes

**`ProceduresSection.tsx`**:
- Substituir dados do contexto por `useProcedures()`
- Adicionar botao "Novo" no cabecalho
- Adicionar botoes Editar/Eliminar em cada card
- Dialog com formulario: titulo PT/EN, categoria PT/EN, conteudo PT/EN (textarea para markdown)

**`BIASection.tsx`**:
- Substituir dados do contexto por `useBIAProcesses()`
- Adicionar botao "Novo" no cabecalho
- Adicionar botoes Editar/Eliminar em cada processo
- Dialog com formulario: nome PT/EN, RTO, RPO, criticidade (select), dependencias (multi-select dos outros processos)
- Grafico e mapa de dependencias continuam a funcionar com os dados da BD

### 4. Limpar contexto

Remover `procedures` e `biaProcesses` do `AppContext.tsx` (ja nao serao necessarios la, pois os componentes usam os hooks proprios). Manter o `searchQuery` disponivel no contexto para filtragem.

---

### Detalhes tecnicos

- Migracao SQL cria as tabelas, RLS e insere os dados seed
- Triggers `update_updated_at_column` reutilizados para ambas as tabelas
- Os hooks usam `@tanstack/react-query` com `useQuery` e `useMutation`, invalidando queries apos mutacoes
- O formulario BIA usa inputs numericos para RTO/RPO e um multi-select para dependencias baseado nos processos existentes
