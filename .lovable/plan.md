## Objetivo
Transformar a apresentação dos cenários de crise em `ScenariosSection.tsx` para que cada caixa/cenário possa ser aberta e fechada de forma harmónica, mantendo toda a funcionalidade atual (drag-and-drop, edição, clonagem, badges).

## Alterações previstas

### 1. Estrutura de apresentação
- Substituir o grid de `Card` estáticos por um `Accordion` do shadcn/ui (tipo `multiple`, para permitir vários cenários abertos ao mesmo tempo).
- Cada cenário torna-se um `AccordionItem`.
- O cabeçalho do cartão passa a ser o `AccordionTrigger` e contém:
  - Label "CENÁRIO {roman}"
  - Nome do cenário
  - Badge com a contagem de tipos de falha
  - Indicador visual de expandir/colapsar (seta/chevron)
- O conteúdo atual dos tipos de falha fica dentro do `AccordionContent`.

### 2. Preservação de funcionalidades
- Manter as classes de cor e destaque (`border-l-4 ${s.color}`).
- Preservar os eventos de drag-and-drop no cartão como um todo, para que ainda seja possível largar tipos de falha no cenário mesmo quando colapsado. O trigger e a área de drop continuarão a responder aos eventos.
- Manter a edição por duplo clique nos tipos de falha e o botão de clonar.
- Preservar o estado de hover/destaque durante o drag (`dragOver`).

### 3. Comportamento de abertura
- Por defeito, todos os cenários vêm abertos (`defaultValue` com todos os IDs), para não esconder conteúdo de imediato.
- O utilizador pode clicar no cabeçalho para colapsar/expandir individualmente.

### 4. Ficheiros a alterar
- `src/components/sections/ScenariosSection.tsx`
  - Importar `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`.
  - Reestruturar o mapeamento dos cenários para usar o accordion.
  - Ajustar classes de padding e layout para manter o aspeto actual.

## Não incluído neste plano
- Alterações às tabelas da base de dados.
- Alterações aos hooks `useCenarios`, `useRecursos`, `useCenarioRecursos`.
- Alterações às regras de negócio ou permissões.

## Validação
- Verificar visualmente no preview que cada cenário tem cabeçalho clicável e que o conteúdo expande/colapsa com animação suave.
- Confirmar que o drag-and-drop de tipos de falha entre cenários continua a funcionar.
- Confirmar que a edição por duplo clique e a clonagem continuam operacionais.