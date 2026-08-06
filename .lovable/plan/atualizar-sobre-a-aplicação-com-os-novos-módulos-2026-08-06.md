# Atualizar "Sobre a Aplicação" com os novos módulos

O manual funcional do Back Office já descreve "Análise de Fornecedores Críticos" em GOVERNO GCN, mas ainda não reflete duas atualizações recentes: o módulo de Autonomia Energética de Edifícios e o import/export de fornecedores.

## Alterações

1. **Autonomia Energética Edifícios** (nova entrada em OPERAÇÕES GCN, antes de "Salas de Reuniões")
   - KPIs de autonomia, classificação por Tier (Tipo 1 a Tipo 4 — Agências / Agência & Numerário), filtros e geração do Relatório Diesel em PDF.
   - Substitui a antiga gestão de Edifícios do Back Office (o CRUD dos edifícios vive agora aqui, incluindo o campo Tier).

2. **Fornecedores Críticos** — rever e atualizar a descrição existente para refletir o estado atual: sem associação a Macro Processos, com associação a Funções, matriz de concentração 2x2, alertas de RTO mismatch e import/export dedicado.

3. **Import / Export (Back Office)** — acrescentar fornecedores críticos à lista de entidades migráveis, mencionando o template com a folha auxiliar "Funcoes".

4. **Tabelas Mestras (Back Office)** — retirar a menção a Edifícios, se aplicável, dado que passou para Autonomia Energética.

Todos os textos em Português e Inglês, mantendo o estilo das entradas existentes. O PDF gerado passa a incluir automaticamente as novas secções.

## Detalhe técnico

Edição única em `src/lib/appOverviewContent.ts` (estrutura `APP_OVERVIEW`). Nenhuma alteração de componentes ou base de dados; `generateAppOverviewPDF.ts` e o separador "Sobre a Aplicação" leem diretamente deste ficheiro.
