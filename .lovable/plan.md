
## Ajuste

### Valor por defeito da Descrição
Alterar o default de `BIA-<id> · <processo>` para **`<nome da BIA> · <processo>`**:
- Nome da BIA = `t(p.name_pt, p.name_en)` (idioma ativo).
- Processo = `businessProcesses.find(...).processo` do processo de negócio ligado à BIA; se não houver processo ligado, mostra apenas o nome.

Aplicado em dois sítios:
1. **Título do cartão Kanban** (`BIASection.tsx`): quando `p.description` está vazia, mostra `nome · processo`.
2. **Placeholder do campo Descrição no diálogo CRUD** (novo ou editar): mostra o mesmo `nome · processo` calculado dinamicamente a partir dos valores atuais do form (`form.name_pt` / `form.name_en` e `form.business_process_id`).

### Edição
Sem alterações estruturais — o campo Descrição já existe no diálogo CRUD (Nova/Editar BIA). Continua editável, guardado em `bia_processes.description`; se vazio, é usado o default calculado.

Sem alterações a base de dados nem a hooks.
