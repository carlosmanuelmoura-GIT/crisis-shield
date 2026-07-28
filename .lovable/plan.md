## Alterações em `src/components/sections/EmergencySection.tsx`

### 1. Remover o identificador interno "AC · xxxxxx" nos cartões (modo cartão)
- Remover o `<span>AC · {card.id.slice(0, 6)}</span>` na vista de lista/expandido (~linha 600).
- Remover o `<span>AC · {card.id.slice(0, 6)}</span>` na vista Kanban (~linha 718).
- Manter o identificador apenas no cabeçalho do painel lateral de detalhe (linha 982), onde continua útil como referência.

### 2. Mostrar descrição das BIAs no painel de detalhe do Action Card
No `SheetContent` de detalhe (~linhas 1017–1020, antes do bloco "Checklist"), adicionar uma nova secção "BIAs associadas" que:
- Percorre `linkedBias` (já disponível na linha 969).
- Para cada link, procura a BIA em `biaProcesses` pelo `bia_process_id`.
- Renderiza um cartão compacto com:
  - **Nome da BIA** (`name_pt` / `name_en`) em destaque.
  - **Descrição** (`bia.description`) por baixo em texto secundário; se vazia, fallback para `Nome · Processo`.
- Se `linkedBias.length === 0`, não renderiza a secção (ou mostra mensagem discreta "Sem BIAs associadas").

Sem alterações de schema, hooks ou lógica de mutação — apenas UI.