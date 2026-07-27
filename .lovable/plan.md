
## Objetivo

Para cada departamento com BIAs (exceto DSP), criar Action Cards agrupados por **Macro Processo**, atribuindo automaticamente Cenário e Tipo de Falha (Recurso) mais prováveis, e preencher `checklist_items` com 4–6 ações padrão por cartão.

## Escopo

23 departamentos com BIAs (exceto DSP), totalizando ~90–110 Macro Processos distintos → um Action Card por Macro Processo:
DAS, DAU, DCC, DCM, DCR, DDE, DEE, DES, DET, DIN, DJU, DLI, DMR, DPE, DPG, DRE, DSC, DSI, GPD, SEC, UAF.
(GAB e GCN não têm BIAs → ignorados.)

## Regra de atribuição Cenário + Tipo de Falha

Aplicada a partir do `tipo_funcao` / `funcao` / `macro_processo`:

| Perfil do Macro Processo | Cenário | Tipo de Falha |
|---|---|---|
| Processos dependentes de sistemas core (Contabilização, Reporte, BCFT, Liquidações, Fundos, Risco Financeiro, Pagamentos, Mercados, Estatísticas, Emissão Tesouraria) | I — Indisponibilidade de sistemas | Falha de Sistemas de Negócio Core |
| Comunicação, Apoio a órgãos, Relações Internacionais/Institucionais | I — Indisp. sistemas | Falha de Sistemas de Comunicação |
| Sistemas de Informação (DSI) | VI — Ciberataque | Ransomware / Falha de Base Dados (conforme processo) |
| Proteção de Dados (GPD), Auditoria, Conformidade | VI — Ciberataque | Data Breach (Exfiltração de Dados) |
| Logística/Instalações, Segurança, Arquivo/Museu, Presença física | II — Indisp. edifícios | Interdição de Acesso ao Edifício / Falha AVAC / Inundação |
| Recursos Humanos, Compensação, Salários, Gestão relação colaborador | III — Indisp. RH | Ausência Massiva por Doença |
| Ação Sancionatória, Jurídico-Regulatória, Regulação, Secretariado, Órgãos de decisão | III — Indisp. RH | Indisponibilidade de Líderes Chave |
| SIBS / Sistemas de Pagamento externos (DPG) | IV — Fornecedores críticos | Falha da SIBS |
| Fornecedores de SW crítico (DSI subconjunto) | IV — Fornecedores críticos | Falha de fornecedor de Software Crítico |

Regra determinística aplicada em SQL com `CASE` sobre `funcao`/`macro_processo`.

## Estrutura dos Action Cards

Para cada `(department_id, macro_processo)` único:

- `title_pt` = `"AC {DEPT} · {Macro Processo}"`
- `title_en` = tradução direta (mantém Macro Processo em PT quando não há tradução)
- `funcao`, `macro_processo` = da BIA
- `capability` = `funcao`
- `severity` = derivada da criticidade máxima das BIAs do grupo (`Muito Alta`/`Alta`→`high`, `Média`→`medium`, resto→`low`)
- `cenario_id` + `recurso_id` conforme tabela acima
- `department_id` = do dept

## Checklist items padrão (5 ações por cartão)

Template genérico adaptado ao cenário atribuído, ex. para Cenário I (sistemas):
1. Confirmar indisponibilidade e acionar equipa DSI
2. Ativar procedimento de contingência do Macro Processo
3. Comunicar às partes interessadas (interno + externo)
4. Registar impactos e decisões no log de crise
5. Validar retoma e reportar ao GCN

Templates equivalentes para Cenários II/III/IV/VI.

## Implementação (SQL numa única migração de dados via insert tool)

1. `INSERT INTO action_cards` com `SELECT DISTINCT` sobre `bia_processes JOIN business_processes` filtrado por `d.code <> 'DSP'`, aplicando `CASE` para `cenario_id`, `recurso_id`, `severity`.
2. `INSERT INTO checklist_items` gerando 5 itens por cartão a partir de um `VALUES` correlacionado ao cenário do cartão.
3. Sem duplicação: cláusula `WHERE NOT EXISTS` para não recriar o cartão do DSP nem eventuais cartões pré-existentes com mesmo `(department_id, macro_processo)`.

## Fora do escopo

- Nenhuma alteração de UI/código React.
- Sem alteração de schema.
- DSP mantido inalterado.
