## Renomear "Criticidade" → "Tipo de BIA" com valores VITAL, DECISÃO, ANALÍTICA

Mantém-se a coluna `criticality` na base de dados (sem migração de schema) — apenas mudam os valores aceites e a apresentação. Migração de dados converte os valores antigos.

### 1. Migração de dados (UPDATE)
Mapear valores existentes na tabela `bia_processes`:
- `critical` → `vital`
- `high` → `decisao`
- `medium` / `low` / outros → `analitica`
- Atualizar default da coluna para `analitica`

### 2. UI — `src/components/sections/BIASection.tsx`
- Renomear label "Criticidade" → "Tipo de BIA" / "BIA Type"
- Substituir opções do Select por:
  - `vital` → VITAL
  - `decisao` → DECISÃO
  - `analitica` → ANALÍTICA
- Atualizar `critColor` para os 3 novos valores (vermelho / âmbar / cinza)
- Default do formulário passa a `analitica`

### 3. Import/Export — `src/components/sections/ImportExportSection.tsx`
- Renomear coluna `Criticidade` → `Tipo_BIA` no export e template
- Default no template: `analitica`
- Hint text actualizado
- Import: aceitar `Tipo_BIA` (e fallback `Criticidade` para compatibilidade), normalizar para um dos 3 valores

### 4. Hook
`src/hooks/useBIAProcesses.ts` mantém o campo `criticality: string` — sem alterações necessárias.

Nenhuma outra zona da app consome `criticality`.
