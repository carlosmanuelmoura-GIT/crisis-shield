# Ajustes visuais no ecrã Cenários de Crise

Aplicar três melhorias de apresentação ao layout de duas colunas já implementado em `src/components/sections/ScenariosSection.tsx`.

## Alterações

1. **Título na coluna de detalhe**
   - Adicionar um cabeçalho "TIPOS DE FALHA" / "FAILURE TYPES" no topo da coluna da direita, antes da grelha de cartões.

2. **Cursor no recurso que falha**
   - Nos cartões de tipo de falha (coluna da direita), alterar o cursor de `cursor-grab active:cursor-grabbing` para `cursor-pointer`.
   - Manter o arrastar-e-largar funcional; apenas o cursor de hover muda.

3. **Tamanho da fonte dos cenários**
   - Aumentar ligeiramente o texto do nome do cenário na lista da esquerda para ocupar melhor o ecrã (por exemplo, de `text-sm` para `text-base` ou equivalente).

## Ficheiro a alterar

- `src/components/sections/ScenariosSection.tsx`

## Não alterar

- Lógica de dados, hooks, drag-and-drop, diálogo de edição ou clonagem.
