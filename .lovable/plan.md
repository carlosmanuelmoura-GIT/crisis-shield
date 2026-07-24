## Alterações

### 1. `src/components/sections/ProceduresSection.tsx` — Sheet lateral dos Action Cards da Gestão de Crise
- **Remover o bloco "Autoridade / Nível Requerido"** (linhas ~349–361) por completo.
- **Substituir os checkboxes** nas "Ações Sequenciais" (linhas ~387–406) por um badge numerado (`1.`, `2.`, …). Cada ação passa a ser um cartão estático com o número à esquerda em círculo/badge mono (mesmo estilo do número usado no EmergencySection) e o texto à direita — sem `Checkbox`, sem estado `localChecks`, sem toggling. Remover também o estado `localChecks` e o import de `Checkbox` (se deixar de ser usado no ficheiro).

### 2. `src/components/sections/EmergencySection.tsx` — Detalhe do Action Card Departamental
- **Remover o bloco "1. Contexto & BIAs"** (linhas ~967–987) do Sheet lateral. A restante checklist mantém-se; renumerar o cabeçalho de "2. Ações" para "Ações" (retirar o "2." já que deixa de existir "1.").

### 3. Estado FIM não atualiza numa crise REAL — investigação + fix
O código de transição existe em dois pontos:
- `handleEndCrisis` (linha 737) — botão "FIM DE CRISE" na Fase 6.
- Auto-transição ao concluir uma acção na fase `fim` (linha 703).

Ambos chamam `updateCrisis.mutateAsync({ status: "fim", ended_by })`, e o hook `useUpdateCrisis` já faz `setQueryData` + `invalidateQueries(["crises"])`. Como o utilizador reporta que numa **crise real** o estado não muda após aprovação, o diagnóstico ainda não está confirmado. Passos:

1. Reproduzir com Playwright numa crise real: navegar até à Fase 6, preencher "Aprovado por", clicar em "FIM DE CRISE", capturar `console`/`network` e verificar a resposta do `PATCH crises` e o valor de `crisis.status` após o refetch.
2. Verificar via `supabase--read_query` se a linha em `crises` é efetivamente atualizada (para descartar bloqueio de RLS específico ao tipo `real` — as políticas podem estar a filtrar por `owner_id`/role e a rejeitar o update sem erro visível).
3. Consoante o resultado:
   - Se o `UPDATE` falha por RLS/policy → ajustar a policy de UPDATE em `crises` para permitir ao Steering GCN fechar qualquer crise real.
   - Se o `UPDATE` passa mas a UI não reflete → forçar `await qc.invalidateQueries` + refetch da query específica `["crises"]` em `handleEndCrisis` e garantir que o `crisis` prop passado ao painel vem do cache atualizado (o componente pai pode estar a segurar uma referência stale).
   - Se o botão simplesmente não aparece na Fase 6 numa real → rever a condição `(crisis.status === "crise_em_curso" || crisis.status === "retorno") && isSteering` (linha 1031) — pode faltar cobrir outro estado intermédio das crises reais.

Sem tocar em mais nada fora destes 3 pontos.

## Notas técnicas
- Nada de migrações novas exceto se o passo 3 concluir que é necessário ajustar policy RLS.
- Sem alterações a hooks nem a outras secções.
