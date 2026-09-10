# Autonomia no momento (Infraestruturas & Autonomia Energética)

Nova coluna com a autonomia real medida no momento, com semáforo de comparação face à autonomia estimada.

## O que muda no ecrã

- Nova coluna "Autonomia no momento" na tabela, ao lado da autonomia estimada:
  - horas atuais + equivalente em dias
  - percentagem face à autonomia estimada, com semáforo:
    - vermelho: < 30%
    - amarelo: 30% a 80%
    - verde: > 80%
  - data/hora da última leitura por baixo do valor
  - "—" quando ainda não há leitura registada
- Filtro por Tier e pesquisa mantêm-se; a ordenação da tabela não muda.

## CRUD

- No diálogo de criar/editar edifício, dois novos campos:
  - "Autonomia no momento (h)" — número, opcional
  - "Data da leitura" — preenchida automaticamente com a data/hora atual sempre que o valor de horas é alterado, e editável manualmente
- Guardar/limpar funcionam como nos restantes campos; o cálculo automático do Tier continua a usar a autonomia de contingência (estimada), não a atual.

## Relatório PDF

- O Relatório Diesel passa a incluir a autonomia no momento e a respetiva percentagem em cada linha, e um novo indicador no resumo com o número de edifícios em vermelho (< 30%).

## Notas técnicas

- Migração na tabela `buildings`: `autonomia_atual_horas numeric null` e `autonomia_atual_medida_em timestamptz null`.
- `src/hooks/useBuildings.ts`: acrescentar os dois campos a `Building` e `BuildingInput`.
- `src/components/sections/AutonomiaEnergeticaSection.tsx`: campos no formulário, coluna na tabela e helper de semáforo (`ratio = atual / estimada`).
- `src/lib/generateDieselReportPDF.ts`: nova coluna e indicador de resumo; larguras das colunas reajustadas.
- Mantém o design system atual (tokens semânticos, badges shadcn), sem cores fixas fora da paleta já usada.
