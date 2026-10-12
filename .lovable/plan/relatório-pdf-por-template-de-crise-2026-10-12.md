# Relatório PDF por Template de Crise

## Objetivo
Em cada template de crise (separador "Templates" do Controlo da Gestão de Crise), um botão "Report PDF" que gera um documento com todas as fases e as respetivas checklists (ações).

## O que muda

1. **Novo gerador** `src/lib/generateCrisisTemplatePDF.ts` (A4 landscape, estilo dos outros relatórios GCN)
   - Cabeçalho: badge EUROSISTEMA / GCN, "GESTÃO DE CONTINUIDADE DE NEGÓCIO", subtítulo "TEMPLATE DE GESTÃO DE CRISE — FASES E CHECKLISTS", título e tipo do template, REF, classificação RESERVADO, data de emissão.
   - Por fase (ordem do template): barra navy com badge "FASE 0N", nome da fase na cor da fase e nº de ações.
   - Checklist numerada (01, 02, ...) com caixa de verificação vazia, texto da ação e, se existirem, Dep Origem, Quem deu a informação e Notas.
   - Fases sem ações mostram "(Sem ações definidas)".
   - Rodapé "GCN // DOCUMENTO DE OPERAÇÃO DE EMERGÊNCIA" e "PÁGINA X DE Y"; quebras de página automáticas.
   - Descarrega `Template_Crise_<titulo>_<data>.pdf`.

2. **Botão** em `CrisisControlSection.tsx`
   - Ícone de download em cada linha do separador Templates e também no topo do detalhe do template aberto.
   - Carrega as fases e ações do template no momento do clique (sem abrir o template), com indicação de "a gerar".
   - Texto PT/EN.

## Notas técnicas
- Usa `jspdf` (já instalado); leitura direta de `crisis_phases` e `crisis_phase_actions` filtradas pelo `crisis_id`, ordenadas por `sort_order`.
- Sem alterações à base de dados.
