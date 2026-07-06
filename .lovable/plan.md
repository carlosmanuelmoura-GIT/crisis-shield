
## Objetivo
Adicionar um campo **Descrição** editável em cada cartão Kanban da secção BIA. Por defeito, o valor é a concatenação de `ID da BIA + Processo` (ex.: `BIA-a1b2c3d4 · Faturação`). O utilizador pode editar e o valor fica persistido.

## Alterações

### 1. Base de dados
Migração para adicionar a coluna:
- `bia_processes.description` (`TEXT`, nullable)

Sem alterações a RLS/policies (a tabela já tem políticas ativas para todas as operações).

### 2. Hook `useBIAProcesses`
- Adicionar `description` à interface `DBBIAProcess`.
- Novo mutation hook `useUpdateBIADescription(id, description)` — atualização leve, sem exigir todos os outros campos do form principal.

### 3. UI — Cartão Kanban em `BIASection.tsx`
- Mostrar a descrição por baixo do título do cartão, em texto pequeno.
- Se `description` for `null/""`, mostrar o valor por defeito calculado: `BIA-{id.slice(0,8)} · {processo}` (usa o `processo` do `business_process` ligado; se não houver, usa o `name_pt/name_en` da BIA).
- Ícone lápis ao lado da descrição para entrar em modo edição inline (`Input`), com:
  - `Enter` ou `blur` → guardar via `useUpdateBIADescription`
  - `Escape` → cancelar
  - Botão "repor por defeito" (ícone) que apaga o campo (volta a mostrar o default calculado).

### 4. Dialogo de criar/editar BIA
Sem alterações. A descrição é gerida apenas inline no cartão (mais rápido para o utilizador). Se preferires também no dialog, diz.

## Detalhes técnicos
- Formato do default: `BIA-{shortId} · {processo}` onde `shortId = id.slice(0,8).toUpperCase()`. Assumo isto porque as BIAs usam UUID e não há ID sequencial visível na tabela. Se preferires outro formato (ex.: nº sequencial), indica.
- `description` guardado tal como escrito; a lógica "mostrar default se vazio" fica apenas na UI, para permitir "repor por defeito" apagando o campo.
