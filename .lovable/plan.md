
## Ajustes

### 1. Remover edição inline no cartão
- Remover o componente `BIADescription` e o uso do `useUpdateBIADescription` em `BIASection.tsx`.
- Remover ícones auxiliares (`RotateCcw`, `Check`) que deixam de ser necessários.

### 2. Título do cartão = Descrição
No cartão Kanban, substituir o atual título (`t(p.name_pt, p.name_en)`) por:
- `p.description` se estiver preenchido
- caso contrário, o default calculado `BIA-{id.slice(0,8).toUpperCase()} · {bp?.processo || nome}`

A linha secundária com `bp.processo` e a linha `RTO/RPO` mantêm-se.

### 3. Editar Descrição no CRUD (Dialog Nova/Editar BIA)
No `Dialog`:
- Adicionar campo **Descrição** (`Input` de linha única, ou `Textarea` se preferires — proponho `Input`) por baixo dos nomes PT/EN.
- Placeholder mostra o default calculado (`BIA-{id} · {processo}`) para o utilizador saber o que fica se deixar vazio.
- Estado `form.description` inicializado com `p.description ?? ""` no `openEdit`, e `""` no `openNew`.
- Ao guardar, enviar `description: form.description.trim() || null` para `useCreateBIAProcess` / `useUpdateBIAProcess`.

### 4. Hooks
- Estender `useCreateBIAProcess` e `useUpdateBIAProcess` para aceitar `description?: string | null`.
- Manter (ou remover) `useUpdateBIADescription` — proponho **remover** por já não ser usado.

Sem alterações a base de dados (a coluna `description` já existe).
