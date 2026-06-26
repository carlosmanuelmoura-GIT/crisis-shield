## Problema

No diálogo de **Editar Crise** (`CrisisControlSection.tsx`), ao adicionar novos elementos ao Gabinete de Gestão de Crise, eles desaparecem imediatamente.

**Causa:** o `useEffect` que carrega os membros existentes (linhas 441-445) corre sempre que `existingMembers` muda de referência. Como o React Query devolve uma nova referência em vários re-renders, o estado local `cabinetMembers` é continuamente reposto com a lista da BD, apagando o membro que o utilizador acabou de adicionar.

Adicionalmente, a secção "Constituição do Gabinete de Crise" está visualmente solta entre os outros campos do formulário, sem destaque.

## Alterações

**Ficheiro:** `src/components/sections/CrisisControlSection.tsx`

1. **Corrigir o reset do estado em edição**
   - Substituir o `useEffect` por uma inicialização única (usar uma `ref` ou flag `hasLoadedMembers`) que só popula `cabinetMembers` a partir de `existingMembers` na primeira vez que o diálogo abre em modo edição (por `editingCrisisId`).
   - Quando o diálogo fecha, repor a flag para que ao reabrir noutra crise se volte a carregar.

2. **Destacar visualmente o Gabinete de Gestão de Crise**
   - Envolver toda a secção (label + lista de membros + inputs de adicionar) numa caixa com `border rounded-lg p-3 bg-muted/30`, com um cabeçalho a `font-semibold` em vez do label pequeno actual.
   - Manter a mesma funcionalidade (listar, remover, adicionar membro com Nome + Função).

Sem alterações de BD, de hooks, nem de outras secções.