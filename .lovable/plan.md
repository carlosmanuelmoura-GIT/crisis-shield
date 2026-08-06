# Fornecedores Críticos: posição no menu e relatório PDF

## 1. Ordem na barra lateral
Em GOVERNO GCN, mover "Fornecedores Críticos" para logo a seguir a "Pessoas Críticas", ficando:
Cenários Crise, BIA, PCN Departamentais, Pessoas Críticas, Fornecedores Críticos, Contactos, SMS Express, Calendário de Testes.

## 2. Botão "Exportar PDF"
Novo botão no topo da secção Fornecedores Críticos (ao lado de "Novo Fornecedor"), que descarrega um relatório com toda a informação em formato de tabela.

## 3. Conteúdo do relatório
1. Cabeçalho: título "Análise de Fornecedores Críticos", data de emissão.
2. Indicadores de topo: total de fornecedores, vulnerabilidade extrema/lock-in, alertas de RTO não conforme, GCN pendente/expirado.
3. Secção "Matriz de Concentração e Dependência" (primeira secção após os indicadores): os 4 quadrantes em tabela, com contagem e nomes dos fornecedores por quadrante, quadrante crítico destacado a vermelho.
4. Secção "Lista de Fornecedores": tabela com Fornecedor & Subcontratados, Tipo de Fornecedor, Área Crítica, Funções, Tipo de DR (RTO Processo), Conformidade RTO Fornecedor, Essencialidade, Alternativas, Tempo de Substituição, Estratégia de Saída, Último teste GCN, Departamento.
5. Secção "Detalhe por Fornecedor": um bloco por fornecedor com todos os campos, incluindo notas.
6. Rodapé com numeração de páginas.

O relatório respeita o idioma ativo (PT/EN) e exporta a lista já filtrada no ecrã.

## Notas técnicas
- `src/components/AppSidebar.tsx`: reordenar `operationalItems`.
- Novo `src/lib/generateSuppliersPDF.ts` usando `jspdf` + `jspdf-autotable`, seguindo o estilo de `generateDeptActionCardsPDF.ts`, com `doc.save()`.
- `src/components/sections/SuppliersSection.tsx`: botão que invoca o gerador com fornecedores filtrados, relações de funções, departamentos e tipos de DR já carregados.
- Sem alterações à base de dados.
