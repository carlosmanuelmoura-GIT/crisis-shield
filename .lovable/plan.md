# Fornecedores com Contratos e Tipo de Serviço

## 1. Fornecedor → Contratos

A lista de Fornecedores Críticos passa a ter dois níveis:

- **Linha principal (Fornecedor)**: nome do fornecedor, tipo de fornecedor e o número total de contratos associados, com uma seta para expandir.
- **Linha expandida (Contrato)**: sub-tabela com um contrato por linha, mostrando Nome do contrato, Tipo de Fornecedor, Funções, RTO Fornecedor (Conforme / Não conforme), Tipo de Serviço, Essencialidade, Alternativas Viáveis, Tempo de Substituição, Estratégia de Saída e Último Teste GCN.

Os registos que existem hoje passam a ser contratos, agrupados pelo fornecedor a que pertencem (entidade do catálogo de fornecedores). Nada se perde: cada registo atual fica como o seu primeiro contrato, com o nome do contrato preenchido a partir do nome atual.

O criar/editar passa a pedir:
- Fornecedor (escolhido do catálogo, ou criado na hora)
- Nome do contrato
- Restantes campos como hoje

Os KPIs, filtros e a Matriz de Concentração continuam a trabalhar ao nível do contrato (é aí que vive o risco), mas mostram também o número de fornecedores distintos.

## 2. Tipo de Serviço

Novo campo por contrato com as opções **CORE** e **ESPECÍFICO**, visível na tabela, no detalhe, no formulário, num novo filtro, no PDF e no import/export.

## 3. Renomeação

"Área Crítica" passa a chamar-se **"Processo Crítico"** em todos os sítios (filtro, tabela, formulário, detalhe, PDF, import/export e manual "Sobre a Aplicação"). Em inglês: "Critical Process".

## Notas técnicas

- Migração na tabela `suppliers`:
  - nova coluna `contract_name text not null default ''`
  - nova coluna `service_type text` (valores `core` / `especifico`)
  - `catalog_id` passa a ser a chave do agrupamento; para registos sem catálogo cria-se automaticamente a entrada em `supplier_catalog` a partir do `name` atual e liga-se
  - `contract_name` é preenchido com o `name` atual quando vazio
  - `critical_area` mantém o nome técnico da coluna (apenas mudam os rótulos na interface)
- `src/hooks/useSuppliers.ts`: tipos `ServiceType`, campos novos no `Supplier`/`SupplierInput`, e um seletor que agrupa contratos por fornecedor.
- `src/components/sections/SuppliersSection.tsx`: tabela agrupada com linhas expansíveis (estado local de expansão), novo filtro de Tipo de Serviço, formulário e painel de detalhe atualizados.
- `src/lib/generateSuppliersPDF.ts`: lista passa a sair agrupada por fornecedor com sublinhas de contrato e coluna de Tipo de Serviço.
- `src/components/sections/ImportExportSection.tsx`: colunas `Fornecedor`, `Contrato`, `Tipo de Servico` e `Processo Critico` no template e no import/export.
- `src/lib/appOverviewContent.ts`: atualizar a descrição do módulo.
