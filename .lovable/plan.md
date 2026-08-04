# Relatório PDF do Log de Ações de Crise

## Objetivo
Permitir exportar em PDF o log de ações de cada crise, com o botão colocado dentro do acordeão da respetiva crise.

## O que muda

1. **Novo gerador de PDF** (`src/lib/generateCrisisLogPDF.ts`)
   - Cabeçalho: "Log das Ações de Gestão de Crise", título da crise, data, tipo (Real/Simulada) e estado.
   - Tabela cronológica ascendente com: nº sequencial, data/hora, nome da ação, descrição e autor.
   - Entradas de sistema (🚨/✅/📋) aparecem como linhas destacadas, sem autor.
   - Rodapé com numeração de páginas e data de emissão; quebra de página automática.
   - Ficheiro descarregado (`doc.save`) com nome tipo `log-crise-<titulo>-<data>.pdf`, seguindo o padrão já usado no relatório de Action Cards.

2. **Botão no acordeão** (`src/components/sections/DecisionLogSection.tsx`)
   - Dentro de `AccordionContent`, no topo do conteúdo de cada crise, um botão "Exportar PDF" (ícone de download), alinhado à direita.
   - Desativado quando a crise não tem ações registadas.
   - Usa os dados já carregados (`group.entries` + `group.crisis`), sem novas queries.
   - Textos bilingues PT/EN conforme `lang`.

## Notas técnicas
- Reutiliza `jspdf` (já instalado) e o estilo visual/cores do gerador existente `generateDeptActionCardsPDF.ts`.
- Sem alterações à base de dados.
