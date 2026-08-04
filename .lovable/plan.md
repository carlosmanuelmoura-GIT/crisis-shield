# Cenários de Crise em layout de duas colunas

Substituir a apresentação atual em acordeão (grelha de 3 colunas) por um layout de seleção mestre/detalhe, igual ao usado no Controlo de Gestão de Crise.

## Comportamento

- **Coluna esquerda (1/3)**: lista vertical com os 6 cenários, um a seguir ao outro. Cada item mostra o número romano, o nome do cenário e um contador de tipos de falha associados. O cenário selecionado fica destacado (barra de cor lateral, fundo realçado).
- **Coluna direita (2/3)**: cartão de detalhe do cenário selecionado, com o cabeçalho do cenário e a grelha dos tipos de falha que falham nesse cenário.
- Por defeito abre o primeiro cenário selecionado.
- Em ecrã pequeno, as duas colunas empilham (lista em cima, detalhe em baixo).

## Funcionalidades mantidas

- Arrastar um tipo de falha do painel de detalhe para um cenário da lista da esquerda move a associação (mesma lógica de drop atual, com destaque visual no alvo).
- Duplo clique num tipo de falha abre o diálogo de edição.
- Botão de clonar tipo de falha.
- Badges com os outros cenários onde o mesmo tipo de falha aparece.
- Textos bilingues PT/EN.

## Detalhes técnicos

- Ficheiro único: `src/components/sections/ScenariosSection.tsx`.
- Remover `Accordion`/`AccordionItem`/`AccordionContent` e introduzir estado `selectedScenarioId` (inicializado com o primeiro cenário assim que os dados carregam).
- Estrutura `grid grid-cols-1 lg:grid-cols-3 gap-4`, com `lg:col-span-1` para a lista e `lg:col-span-2` para o detalhe, replicando o padrão de `CrisisControlSection.tsx` (linhas ~899-940).
- Os handlers de drop passam a estar nos itens da lista da esquerda; `dragOver` continua a guardar o id do cenário alvo.
- Sem alterações à base de dados nem aos hooks (`useCenarios`, `useCenarioRecursos`, `useRecursos`).
