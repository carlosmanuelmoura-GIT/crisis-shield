## Objetivo

Criar, a partir do documento anexo, um conjunto de procedimentos de Gestão de Crise na tabela existente `procedures` — visíveis na secção **Procedimentos Gestão Crise**. Sem alterações de schema, sem alterações de UI.

## Procedimentos a inserir

Categoria comum: **"Gestão de Crise"** (PT/EN).
Conteúdo em Markdown no campo `content_pt`; `content_en` recebe o mesmo conteúdo (placeholder, até existir tradução). Todos sem `owner_id` (geridos centralmente).

| # | Título PT |
|---|-----------|
| 1 | Classificação do Tipo de Crise |
| 2 | Gabinete de Gestão de Crise — Modelo de Governação |
| 3 | Preparação Antes da Crise |
| 4 | Ativação da Crise |
| 5 | Gestão da Crise em Curso |
| 6 | Registo de Decisões e Evidências |
| 7 | Recuperação, Retorno e Encerramento |
| 8 | Lições Aprendidas e Melhoria Contínua |

O conteúdo de cada procedimento reproduz fielmente o texto, listas e tabelas das secções correspondentes do documento (tabelas convertidas para Markdown).

## Execução

Um único `INSERT INTO public.procedures` com as 8 linhas, com `ON CONFLICT DO NOTHING` por título para evitar duplicados se já existirem.

## Notas

- Os procedimentos ficam imediatamente visíveis e filtráveis pela categoria "Gestão de Crise" na página Procedimentos Gestão Crise.
- Podem depois ser editados pelos utilizadores privilegiados via a UI já existente.
- Sem alteração da tabela, RLS, hooks ou componentes.