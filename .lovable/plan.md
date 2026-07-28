## Objetivo
Permitir eliminar a associação de uma BIA a um Action Card diretamente no painel lateral de detalhe do Action Card.

## Alterações

**Ficheiro:** `src/components/sections/EmergencySection.tsx` (secção "BIAs Associadas" no Sheet de detalhe, ~linhas 1015-1038)

- Em cada cartão de BIA associada, adicionar um botão de ação (ícone `X` / lixo) no canto superior direito.
- Ao clicar, mostrar `AlertDialog` de confirmação ("Eliminar associação desta BIA ao Action Card?" / "Remove this BIA link?").
- Ao confirmar, chamar `unlinkBIA.mutateAsync({ id: link.id })` (hook `useUnlinkBIAActionCard` já importado e disponível em `EmergencySection`).
- Mostrar toast de sucesso/erro coerente com o resto do ficheiro (PT/EN).
- Desativar o botão enquanto `unlinkBIA.isPending`.

## Fora do âmbito
- Sem alterações à tabela ou hooks (a mutação `useUnlinkBIAActionCard` já existe e é usada noutros pontos).
- Sem alterações ao diálogo de associação nem à vista de cartão.
