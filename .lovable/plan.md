## Objetivo
Nos Action Cards (drawer de detalhe), remover o rótulo "T+xx'" antes de cada ação e passar a mostrar apenas o número sequencial (1..n). Permitir reordenar as ações dentro do card.

## Alterações

### `src/components/sections/EmergencySection.tsx` (drawer de detalhe do Action Card)
- Substituir o `<span>T+05'</span>` por um badge com o número sequencial `{idx + 1}` (mono, fundo slate-100, largura fixa) — ordem baseada em `sort_order`.
- Adicionar controlos de reordenação por item, visíveis (ou em hover) ao lado esquerdo da ação:
  - Botão ↑ (mover para cima) — desativado no primeiro item
  - Botão ↓ (mover para baixo) — desativado no último item
- Implementar handler local `moveItem(itemId, direction)` que troca `sort_order` entre o item alvo e o vizinho, e persiste via Supabase (`update` em `checklist_items`). Depois invalida a query `checklist_items`.

### `src/hooks/useActionCards.ts`
- Adicionar mutação `useReorderChecklistItems` que recebe uma lista `[{ id, sort_order }]` e faz `update` em cada linha (ou em duas linhas para o caso de swap), invalidando `["checklist_items"]` no fim.

## Aceitação
- Nenhuma ação mostra "T+xx'". Cada ação mostra o seu índice 1..n conforme a ordem atual.
- Setas ↑/↓ em cada ação reordenam-na dentro do Action Card e a numeração é recalculada imediatamente.
- Ordem persistida em base de dados (`checklist_items.sort_order`) e mantida ao recarregar.
- Sem alterações de esquema; apenas UPDATEs a `sort_order`.

## Fora de âmbito
- Drag & drop com biblioteca externa (fica para eventual iteração, se pedires). Usamos setas ↑/↓ que são suficientes e não requerem dependências novas.
