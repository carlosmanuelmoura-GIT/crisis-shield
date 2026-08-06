# Fornecedores Críticos: Tipo de Fornecedor e tabela de dependências

## 1. Novo campo "Tipo de Fornecedor"

Lista fixa de opções:
- Infraestrutura TI
- Energia
- Software
- Serviços SI/TI
- Manutenção de Infraestruturas Técnicas
- Telecomunicações
- Manutenção de Edifícios
- Pagamentos
- Emissão de Numerário

Onde aparece:
- Formulário de criação/edição: nova lista de seleção.
- Tabela principal: mostrado por baixo do nome do fornecedor (junto à área crítica).
- Filtros: novo filtro "Tipo de Fornecedor".
- Painel de detalhe: nova linha.
- Import/Export: nova coluna `Tipo_Fornecedor` no ficheiro e no template, com folha auxiliar com a lista de valores válidos.

## 2. Lista de fornecedores: colunas

- Remover a coluna "Departamento" do ecrã principal (mantém-se no detalhe e no formulário).
- Substituir a coluna única "Dependências" por três colunas separadas, cada uma com o seu cabeçalho e uma etiqueta visual (badge com cor por nível):
  - Essencialidade — Baixa / Média / Alta
  - Alternativas Viáveis — Múltiplas / Limitadas / Sem alternativas
  - Tempo de Substituição — <6m / 6-18m / >18m

Cada badge mantém a descrição do valor por extenso, com cor semântica (verde = risco baixo, âmbar = médio, vermelho = alto) para leitura rápida.

## Notas técnicas
- Migração: adicionar `supplier_type text` a `public.suppliers`.
- `useSuppliers.ts`: acrescentar `supplier_type` a `Supplier` e `SupplierInput`; exportar a constante com as 9 opções e respetivos rótulos PT/EN.
- `SuppliersSection.tsx`: novo Select no formulário, novo filtro `fType`, remoção da coluna Departamento, três colunas de dependência com componente de badge por nível, linha extra no detalhe.
- `ImportExportSection.tsx`: coluna `Tipo_Fornecedor` em `exportSuppliers`/`exportTemplateSuppliers` (folha `TiposFornecedor`) e parsing/validação em `importSuppliers`.
