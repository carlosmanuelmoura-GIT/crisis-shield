# Fornecedores Críticos: RTO por Tipo de DR e conformidade do fornecedor

## O que muda

### RTO do Processo
Deixa de ser um número livre em horas. Passa a ser escolhido a partir da tabela de referência de Tipos de DR (a mesma usada nas BIAs). Ao escolher o Tipo de DR, o RTO em horas associado é mostrado automaticamente (ex.: "DR1 — 4h").

### RTO do Fornecedor
Deixa de ser um número livre. Passa a ser uma lista com duas opções: **Conforme** e **Não conforme** (indica se o fornecedor cumpre o RTO exigido pelo processo).

### Tabela, detalhe e KPIs
- Coluna "RTO Fornecedor" mostra badge verde "Conforme" ou badge vermelho "Não conforme".
- Coluna passa a mostrar por baixo o Tipo de DR do processo em vez de horas.
- O KPI "Alertas de RTO Mismatch" passa a contar os fornecedores marcados como "Não conforme".
- Painel de detalhe atualizado em conformidade.

### Filtro
O filtro "Estado de RTO" passa a ter as opções: Todos / Conforme / Não conforme. Adiciona-se ainda um filtro por Tipo de DR do processo.

### Import/Export
As colunas `RTO_Fornecedor_Horas` e `RTO_Processo_Horas` são substituídas por:
- `RTO_Fornecedor_Conformidade` (Conforme / Nao conforme)
- `Tipo_DR_Processo` (código do Tipo de DR, ex. DR1)

O template inclui uma folha adicional com os Tipos de DR disponíveis.

## Notas técnicas
- Migração: em `suppliers`, adicionar `dr_type_id uuid references public.dr_types(id)` e `supplier_rto_compliant boolean`. Migrar dados existentes: `supplier_rto_compliant = NOT (rto_supplier_hours > rto_process_hours)`; `dr_type_id` deduzido por correspondência de `rto_process_hours` com `dr_types.rto` quando existir. As colunas antigas ficam na base de dados sem uso pela aplicação.
- `useSuppliers.ts`: acrescentar os campos a `Supplier`/`SupplierInput`; `hasRtoMismatch` passa a `s.supplier_rto_compliant === false`.
- `SuppliersSection.tsx`: substituir os dois inputs numéricos por dois Selects (Tipo de DR via `useDRTypes`/consulta a `dr_types`, e conformidade), atualizar coluna da tabela, filtro `fRto`, novo filtro `fDr`, e linhas do detalhe.
- `ImportExportSection.tsx`: atualizar `exportSuppliers`, `exportTemplateSuppliers` (folha `TiposDR`) e `importSuppliers` (resolução do Tipo de DR por código e parsing de conformidade).
