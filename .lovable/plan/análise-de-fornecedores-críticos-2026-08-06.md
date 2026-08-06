# Análise de Fornecedores Críticos

Novo módulo em GOVERNO GCN para avaliar risco, dependência e conformidade dos fornecedores críticos (TI, infraestruturas físicas, sistemas de pagamentos), destacando pontos únicos de falha, incompatibilidades de RTO e risco de 4ª parte.

## Estrutura do ecrã

Entrada na barra lateral: "Fornecedores Críticos" (GOVERNO GCN), com duas tab pages.

### Tab 1 — Lista de Fornecedores
Cartões de resumo no topo:
- Total de Fornecedores Críticos
- Vulnerabilidade Extrema / Lock-in (essencialidade Alta + sem alternativas viáveis)
- Alertas de RTO Mismatch (RTO Fornecedor > RTO Processo)
- GCN Pendente/Expirado (sem teste conjunto nos últimos 12 meses ou sem data)

Filtros: Área Crítica, Nível de Dependência (essencialidade), Estado de RTO (OK / Mismatch) e pesquisa por nome.

Tabela com as colunas:
1. Fornecedor & Subcontratados — nome principal + infraestrutura de 4ª parte, ex. "Vendor X (AWS Europe)"
2. Funções — uma ou mais, a partir da tabela de processos existente
3. Macro Processos — um ou mais, a partir da tabela de processos existente
4. RTO Fornecedor — badge verde se <= RTO Processo, badge vermelho de alerta se >
5. Dependência — três badges: Essencialidade (Low/Medium/High), Alternativas Viáveis (Multiple/Limited/No viable alternatives), Tempo de Substituição (<6m / 6-18m / >18m)
6. Estratégia de Saída — Validado / Não Testado / Não Existente
7. Data do último teste GCN conjunto
8. Departamento responsável (tabela de departamentos existente)
9. Ações — ver detalhe e editar

Criar/editar num diálogo centrado com todos os campos acima; detalhe completo num painel com toda a informação, incluindo notas e subcontratados.

### Tab 2 — Matriz de Concentração e Dependência
Heatmap 2x2 interativo:
- Eixo Y: Esforço de Substituição — Baixo (<6m) vs Alto (>18m)
- Eixo X: Essencialidade — Baixa/Média vs Alta
- Quadrante crítico a vermelho: "Vulnerabilidade Extrema / Lock-in" (Essencialidade Alta + Substituição >18m + sem alternativas)
- Clicar num quadrante leva à lista já filtrada por esse perfil; cada célula mostra a contagem e os nomes dos fornecedores.

## Dados de exemplo
Serão criados 5 fornecedores: SIBS, AWS, Starlink/SpaceX, Bloomberg/Refinitiv e Vendor X Software, com os RTO, dependências e mismatches indicados.

## Notas técnicas
- Nova tabela `suppliers` (nome, subcontratados/4ª parte, área crítica, rto_fornecedor_horas, rto_processo_horas, essencialidade, alternativas, tempo_substituicao, estrategia_saida, ultimo_teste_gcn, department_id, notas, owner_id, timestamps) com GRANTs, RLS para utilizadores autenticados e trigger de updated_at.
- Tabelas de ligação `supplier_functions` e `supplier_macro_processes` referenciando valores de `business_processes` (função e macro processo), com GRANTs e RLS.
- Tabela de referência `supplier_catalog` para os nomes de fornecedores usados no CRUD.
- RTO do Processo guardado no registo do fornecedor (em horas) para permitir a comparação direta exigida pelo badge.
- Novo hook `src/hooks/useSuppliers.ts` seguindo o padrão React Query dos hooks existentes.
- Nova secção `src/components/sections/SuppliersSection.tsx`, registada em `src/pages/Index.tsx` e em `src/components/AppSidebar.tsx`, bilingue PT/EN e com os tokens do design system atual.
- Entrada correspondente adicionada ao manual em `src/lib/appOverviewContent.ts`.
