## Objetivo

Atribuir, aos 6 Action Cards do DSP (Supervisão Prudencial), o **cenário de desastre mais provável** (`cenario_id`) e o **tipo de falha mais apropriado** (`recurso_id`) — dois campos que já existem em `public.action_cards` mas estão vazios nestes cartões.

## Mapeamento proposto

Racional: o trabalho do DSP é analítico/regulatório e depende fortemente de (a) sistemas de informação para aceder a dossiers e bases de registos, (b) canais de comunicação com BCE/SSM/entidades supervisionadas, e (c) presença física em inspeções on-site. Daí a predominância do Cenário I, com Cenário II para o cartão que integra on-site e Cenário III para o Secretariado Técnico (dependente de pessoas-chave).

| Cartão | Cenário mais provável | Tipo de Falha |
|---|---|---|
| DSP_REG — Regulação | **I** — Indisponibilidade de sistemas | Falha de Sistemas de Negócio Core |
| DSP_AUT — Autorizações | **I** — Indisponibilidade de sistemas | Falha de Base Dados com Corrupção de Dados |
| DSP_SSM — Supervisão SSM | **I** — Indisponibilidade de sistemas | Falha de Sistemas de Comunicação |
| DSP_NSSM — Supervisão Non SSM (Off/On-Site/Horizontal) | **II** — Indisponibilidade de edifícios | Interdição de Acesso ao Edifício |
| DSP_RI_INST — Relações Institucionais (Secretariado Técnico) | **III** — Indisponibilidade de RH | Indisponibilidade de Líderes Chave |
| DSP_RI_INT — Relações Internacionais (Aconselhamento) | **I** — Indisponibilidade de sistemas | Falha de Sistemas de Comunicação |

## Execução

Um único `UPDATE` em `public.action_cards` (via ferramenta de insert/update), filtrando pelos 6 cartões DSP e preenchendo `cenario_id` e `recurso_id` conforme a tabela acima. Sem alterações de schema, código ou UI.

## Ponto a confirmar

Concorda com este mapeamento? Se preferir, posso alternativamente:
- **(A)** atribuir o mesmo cenário (I — Sistemas) a todos os 6 cartões, por ser o denominador comum, ou
- **(B)** ajustar cartões específicos que queira mudar (indique quais).

Sem indicação, avanço com o mapeamento da tabela.