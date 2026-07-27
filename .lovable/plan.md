# Action Cards — Departamento de Supervisão Prudencial (DSP)

## Contexto

O DSP tem 12 BIAs registadas, todas de criticidade **analítica**, distribuídas por 6 Macro Processos. Vou criar **1 Action Card por Macro Processo** (agrupando as BIAs relacionadas), com um conjunto de passos operacionais por cartão.

## Cartões a criar

| Código | Título | Macro Processo | Nº BIAs | Tipo DR dominante |
|---|---|---|---|---|
| DSP_REG | Regulação — Contingência de Aconselhamento e 2º Nível | Regulação | 2 | DR2/DR4 |
| DSP_AUT | Autorizações — Continuidade de Registos e Autorizações | Autorizações | 4 | DR1/DR2 |
| DSP_SSM | Supervisão SSM — Continuidade sobre Instituições Significativas | Supervisão SSM | 1 | DR2 |
| DSP_NSSM | Supervisão Non SSM — Off-Site / On-Site / Horizontal | Supervisão Non SSM | 3 | DR2 |
| DSP_RI_INST | Relações Institucionais — Secretariado Técnico | Relações Institucionais | 1 | DR4 |
| DSP_RI_INT | Relações Internacionais — Aconselhamento Institucional | Relações Internacionais - Aconselhamento | 1 | DR2 |

Todos os cartões:
- `department_id` = DSP (`08d520e1-...`)
- `severity` = `high` (analítica → high; sem BIAs críticas)
- `funcao` e `macro_processo` preenchidos conforme tabela BIA
- `title_pt` = título acima, `title_en` = tradução equivalente

## Passos (checklist_items)

Cada cartão terá **5 passos numerados** (`sort_order` 1-5), cobrindo o ciclo típico de continuidade:

1. Ativar equipa mínima de continuidade e comunicar cadeia de comando
2. Priorizar dossiers/processos em curso com prazos regulatórios/legais críticos
3. Ativar canais alternativos de comunicação com contrapartes (BCE/SSM/entidades supervisionadas)
4. Registar decisões e desvios ao procedimento normal no Log da Crise
5. Reavaliar continuidade e reportar ponto de situação à Estrutura GCN

Os textos serão adaptados ao contexto específico de cada Macro Processo (ex.: DSP_AUT foca em registos e prazos de autorização; DSP_SSM foca em coordenação com o Joint Supervisory Team).

## Execução

Uma única migração de INSERT via `supabase--insert`:
- 6 linhas em `public.action_cards`
- 30 linhas em `public.checklist_items` (6 × 5)

Sem alterações de schema, código, ou UI — apenas dados.

## Ponto a confirmar

Prefere:
- **(A)** 6 cartões agrupados por Macro Processo (proposta acima), ou
- **(B)** 12 cartões, um por cada BIA individual (mais granular, mais trabalho de gestão)?

Se não indicar, avanço com a opção (A).
