# Autonomia Energética Edifícios

Nova entrada no menu OPERAÇÕES GCN com um painel de monitorização de autonomia energética dos edifícios, no estilo da imagem de referência, usando os dados já existentes na tabela de edifícios.

## Navegação

- Novo item "Autonomia Energética Edifícios" em OPERAÇÕES GCN (ícone raio), a seguir a "Sala de Reuniões Virtuais".
- PT: "Autonomia Energética Edifícios" / EN: "Building Power Autonomy".

## Ecrã

Cabeçalho com título, subtítulo "Monitorização Contínua do Perímetro Operacional GCN" e dois botões: "Relatório Diesel" (PDF) e "Novo Edifício".

Quatro cartões de indicadores calculados a partir dos dados:
- Reserva total de diesel (soma dos litros)
- Nó core (edifício com maior autonomia) — horas e dias
- Edifícios frágeis (sem gerador, apenas UPS) — contagem
- Total de geradores e total de UPS

Barra de filtros por Tier (Todos / Tier 1 / Tier 2 / Tier 3) e caixa de pesquisa por nome.

Tabela com: Edifício, Tier/Criticidade (badge), Geradores & UPS, Combustível (L) com barra de proporção, Autonomia estimada (horas + dias), Observações, e ações Ver/Editar.

## Tier automático

Calculado a partir da autonomia em horas, sem alterar a base de dados:
- >= 48h → Tier 1 - Crítico (roxo/azul)
- 12h a 48h → Tier 2 - Intermédio (âmbar)
- < 12h com gerador → Tier 3 - Regional (cinza)
- sem gerador → Tier 3 - Frágil (vermelho)
- Sem autonomia registada → "Por validar"

A coluna "Diálise Diesel" da imagem não é incluída (não existe esse dado).

## CRUD

Diálogo de criação/edição com os campos existentes: nome, autonomia (horas), depósitos, combustível (L), nº geradores, nº UPS, observações. Eliminação com confirmação. Usa os hooks já existentes de edifícios.

## Relatório PDF

Botão "Relatório Diesel" gera e descarrega um PDF com cabeçalho institucional, data, resumo dos indicadores e tabela dos edifícios agrupada por Tier, no mesmo estilo dos relatórios já existentes na aplicação.

## Notas técnicas

- Novo `src/components/sections/AutonomiaEnergeticaSection.tsx`, registado no mapa de secções de `Index.tsx` com o id `autonomia-energetica`.
- Reutiliza `src/hooks/useBuildings.ts` (sem alterações de schema).
- Novo `src/lib/generateDieselReportPDF.ts` com jsPDF, seguindo o padrão de `generateDeptActionCardsPDF.ts`.
- Cores e tipografia dos tokens do design system existente (sem cores fixas).
