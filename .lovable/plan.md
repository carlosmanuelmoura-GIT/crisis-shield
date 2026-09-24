# Renomear Relatório Diesel para Relatório de Autonomia Energética

A coluna "Autonomia no momento" já existe no relatório PDF (coluna `AUTONOMIA NO MOMENTO` em `generateDieselReportPDF.ts`, linha 143). Resta apenas renomear o relatório.

## Alterações

1. **Botão no ecrã** (`src/components/sections/AutonomiaEnergeticaSection.tsx`, linha 284):
   - PT: "Relatório Diesel" → "Relatório de Autonomia Energética"
   - EN: "Diesel Report" → "Energy Autonomy Report"

2. **Título no PDF** (`src/lib/generateDieselReportPDF.ts`, linha 74):
   - "RELATÓRIO DIESEL — AUTONOMIA ENERGÉTICA DOS EDIFÍCIOS" → "RELATÓRIO DE AUTONOMIA ENERGÉTICA DOS EDIFÍCIOS"

3. **Nome do ficheiro descarregado** (linha 231):
   - `Relatorio_Diesel_YYYY-MM-DD.pdf` → `Relatorio_Autonomia_Energetica_YYYY-MM-DD.pdf`

4. Verificar no cabeçalho do ecrã e noutros pontos se existe alguma outra referência a "Relatório Diesel" (rótulos de cartões/indicadores como "RESERVA TOTAL DIESEL" mantêm-se, pois referem o combustível, não o nome do relatório).

## Verificação

- Confirmar na tabela do PDF que a coluna "Autonomia no momento" continua presente com horas e percentagem face à estimada.
- Validar o TypeScript e gerar o PDF a partir do botão renomeado.
