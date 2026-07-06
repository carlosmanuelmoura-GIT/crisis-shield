## Melhorias na Importação de BIA

### 1. Descrição automática
No `importBIA` de `src/components/sections/ImportExportSection.tsx`, ao inserir cada linha em `bia_processes`, preencher também o campo `description` com:

```
<Nome_PT> · <Processo>
```

- `Nome_PT` = valor da coluna `Nome_PT` do ficheiro.
- `Processo` = nome do processo de negócio resolvido (ver ponto 2). Se não houver processo ligado, `description` fica apenas com `Nome_PT`.

Coerente com o default já usado no cartão Kanban e no placeholder do CRUD.

### 2. Resolução do processo a partir de `Business_Process_Nome`

A coluna `Business_Process_Nome` (equivalente ao "Business Process Name" mencionado) traz uma string no formato:

```
<qualquer coisa> - <Nome do Processo>
```

Novo algoritmo (aplicado apenas quando `Business_Process_ID` não vier preenchido):

1. Fazer `split` no **primeiro** `-`; usar a parte à direita, trim, como **Nome do Processo** procurado.  
   (Se não existir `-`, usar a string inteira, tal como hoje.)
2. Procurar em `business_processes` (case-insensitive, trim) por `processo === <nome extraído>`.
3. **Se encontrar**: usar esse `id` como `business_process_id` da BIA. Não altera o registo do processo.
4. **Se não encontrar**: criar um novo registo em `business_processes` com:
   - `processo` = nome extraído
   - `tipo_funcao`, `funcao`, `macro_processo` = `""` (ficam por preencher, o utilizador completa depois no Back Office)
   - `owner_id` = utilizador atual  
   Usar o `id` devolvido como `business_process_id`.

> Nota: os campos `tipo_funcao`, `funcao`, `macro_processo` vivem em `business_processes`, não em `bia_processes`. O "preenchimento automático" acontece via **ligação** ao processo correto — ao selecionar esse processo na BIA, os quatro campos (Tipo Função, Função, Macro Processo, Processo) aparecem automaticamente em toda a UI que os lê a partir de `business_processes` (cartões Kanban, filtros, etc.).

### 3. Cache de lookups em memória
Manter o `bpNameMap` já existente, mas atualizá-lo em tempo real após criar novos processos, para que várias linhas do mesmo ficheiro que referenciem o mesmo processo reutilizem o `id` recém-criado (sem duplicados).

### 4. Sem alterações a
- Esquema da base de dados
- Hooks (`useBIAProcesses`, `useBusinessProcesses`)
- Template de importação (as colunas mantêm-se; muda só a interpretação de `Business_Process_Nome`)
- CRUD da BIA e cartão Kanban (já usam o novo default de descrição)

### Ficheiros a alterar
- `src/components/sections/ImportExportSection.tsx` — função `importBIA`

### Questão em aberto
Se `Business_Process_Nome` não tiver `-`, devo:
- (a) usar a string inteira como nome do processo (comportamento assumido acima), ou
- (b) ignorar o valor e deixar a BIA sem processo ligado?

Assumi **(a)**. Diz se preferes (b).
