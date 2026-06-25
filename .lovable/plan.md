## Substituir filtro "Plataformas" por "Action Card" (com pesquisa por nome) nas BIAs

### `src/components/sections/BIASection.tsx`

1. **Remover** o filtro de Plataformas da barra de filtros (Popover com checkboxes) e o estado `filterPlatformIds`.
2. **Remover** o painel "Impacto das Plataformas" (`platformImpact`) — dependia exclusivamente desse filtro.
3. **Adicionar** novo filtro **Action Card** na mesma posição:
   - Campo de texto livre (`Input` com ícone de pesquisa) onde o utilizador escreve parte do nome do Action Card.
   - Lista (Popover) com sugestões filtradas a partir de `actionCards` (já disponível via `useActionCards()`) pelo `title_pt`/`title_en`.
   - Selecionar uma sugestão fixa o filtro; botão `X` para limpar.
4. **Lógica de filtragem**: quando um Action Card está selecionado, filtrar `biaProcesses` para apenas as que têm ligação a esse Action Card via `biaActionCardLinks` (já carregado).
5. Atualizar o botão "Limpar filtros" e a condição que mostra "filtros ativos" para usarem o novo estado `filterActionCardId` em vez de `filterPlatformIds`.

Nenhuma alteração à base de dados ou a outros ficheiros.
