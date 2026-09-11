# Anonimização de Fornecedores e Contratos

## Objetivo
Substituir os nomes reais de fornecedores e contratos por identificadores anónimos na tabela de fornecedores críticos, mantendo toda a restante informação (RTO, essencialidade, tipo, funções, etc.) intacta.

## Alterações

### Dados (SQL)
1. **Catálogo de fornecedores** (`supplier_catalog`): renomear cada entrada para `Fornecedor 1`, `Fornecedor 2`, … por ordem alfabética do nome atual (numeração determinística).
2. **Fornecedores** (`suppliers`):
   - `name` passa a `Fornecedor N` — para linhas ligadas ao catálogo, o número é o mesmo do catálogo; linhas sem catálogo (agrupadas por nome) recebem o mesmo número dentro do grupo, continuando a sequência.
   - `contract_name` passa a `Contrato 1`, `Contrato 2`, … dentro de cada fornecedor (agrupamento por `catalog_id`/`name`, ordenado por `created_at`).
   - `subcontractors` (4ª parte) passa a vazio para não revelar terceiros identificáveis.
3. Todos os outros campos (tipo, RTO, essencialidade, departamento, notas, funções) ficam inalterados.

### Código
Sem alterações de código — a UI, os relatórios PDF e a importação/exportação já leem os campos `name` e `contract_name` dinamicamente.

## Verificação
- Consultar a tabela após a atualização para confirmar nomes `Fornecedor N` / `Contrato N` e agrupamento consistente.
- Verificar visualmente a página Fornecedores Críticos (lista, matriz e PDF).
