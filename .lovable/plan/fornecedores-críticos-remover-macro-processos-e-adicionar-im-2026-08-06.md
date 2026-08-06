# Fornecedores Críticos: remover Macro Processos e adicionar Import/Export

## 1. Remover a associação a Macro Processos
No módulo Fornecedores Críticos:
- Retirar a coluna "Macro Processos" da tabela de fornecedores.
- Retirar a lista de seleção de macro processos do formulário de criação/edição.
- Retirar a linha "Macro Processos" do painel de detalhe.
- Manter a associação a Funções tal como está.

A tabela de ligação `supplier_macro_processes` deixa de ser usada pela aplicação (fica em base de dados sem impacto; pode ser eliminada mais tarde se quiser).

## 2. Import/Export de Fornecedores
Novo cartão "Fornecedores Críticos" na secção Importar/Exportar, com os mesmos três botões dos restantes: Exportar, Template e Importar.

Colunas do ficheiro:
- Nome
- Subcontratados
- Area_Critica
- RTO_Fornecedor_Horas
- RTO_Processo_Horas
- Essencialidade (low / medium / high)
- Alternativas (multiple / limited / none)
- Tempo_Substituicao (low / medium / high)
- Estrategia_Saida (validado / nao_testado / nao_existente)
- Ultimo_Teste_GCN (data)
- Departamento_Nome
- Notas
- Funcoes (uma ou mais, separadas por ";")

O template exportado traz uma linha de exemplo vazia e uma segunda folha "Funcoes" com a lista completa das funções existentes hoje na tabela de processos, para copiar/colar na coluna Funcoes.

Na importação: o departamento é resolvido pelo nome, as funções são validadas contra a lista existente e ligadas ao fornecedor; linhas com nome em falta são ignoradas e é apresentado um resumo de sucesso/erros, como nos restantes importadores.

## Notas técnicas
- `src/components/sections/SuppliersSection.tsx`: remover `macroList`, `macrosOf`, coluna da tabela, bloco de checkboxes do formulário e linha do detalhe; deixar de enviar `macro_processos`.
- `src/hooks/useSuppliers.ts`: remover `macro_processos` de `SupplierInput` e o ramo de macros em `syncRelations`/`useSupplierRelations`.
- `src/components/sections/ImportExportSection.tsx`: adicionar `exportSuppliers`, `exportTemplateSuppliers` (com folha extra `Funcoes` via `XLSX.utils.book_append_sheet`) e `importSuppliers`, mais um `ImportCard` correspondente; usar `useSuppliers`, `useSupplierRelations`, `useDepartments` e `useBusinessProcesses`.
