# Action Cards Departamentais: Pausa Estratégica, novos campos e novo PDF

## 1. Pausa Estratégica no cartão
- Novo campo booleano "Pausa Estratégica" na tabela dos action cards (por defeito: não).
- No detalhe do Action Card: botão/interruptor "Associado a Pausa Estratégica" (âmbar quando ativo), grava de imediato.
- Badge âmbar discreto no cartão Kanban para leitura rápida.

## 2. Filtro de Pausa Estratégica
- Novo filtro na barra de Filtros: Todos / Com Pausa Estratégica / Sem Pausa Estratégica.
- Integrado na lógica de filtragem existente e no indicador de filtros ativos.

## 3. Novos campos no cabeçalho do cartão (a seguir às BIAs)
- **Regra de Ouro / Heurística** — texto livre (multi-linha curto), destacado em caixa âmbar no detalhe e no PDF.
- **Identificação da Autoridade de Ativação** — texto livre curto (ex.: "Coordenador DPG / Turno").
- Ambos editáveis no CRUD do Action Card e visíveis no painel de detalhe.

## 4. Novo PDF dos Action Cards (layout de referência)
Reescrever `generateDeptActionCardsPDF.ts` para A4 **landscape**, seguindo a imagem:
- **Cabeçalho do documento**: faixa branca com badge "EUROSISTEMA / GCN", título "GESTÃO DE CONTINUIDADE DE NEGÓCIO", subtítulo "MANUAL DE AÇÕES IMEDIATAS — {DEPARTAMENTO}"; à direita REF, CLASSIFICAÇÃO: RESERVADO e data da última revisão.
- **Barra de cenário**: faixa escura (navy) com badge "CENÁRIO {N}" e nome do cenário; à direita, lista de tipos de falha/DR. Por baixo, descrição do cenário em itálico.
- **Cartões em 2 colunas**: borda superior colorida pela severidade; linha de topo com ID, RTO e badge de severidade; título em maiúsculas; linha "PROCESSO: ...".
- **Caixa "REGRA DE OURO"** (fundo âmbar) com o texto do novo campo, quando preenchido.
- **"AÇÕES SEQUENCIAIS DE SOBREVIVÊNCIA"**: passos numerados em badges quadrados escuros (01, 02, ...), com a primeira palavra a negrito.
- **Rodapé do cartão**: "AUTORIDADE: {campo}" à esquerda e "REGISTO: LOG DA CRISE" à direita.
- **Rodapé da página**: "GCN // DOCUMENTO DE OPERAÇÃO DE EMERGÊNCIA" e numeração de páginas.
- Marca "PAUSA ESTRATÉGICA" no cartão quando aplicável.
- Fonte com acentuação correta e quebras de página automáticas mantendo os cartões inteiros.

## Detalhes técnicos
- Migração: adicionar a `public.action_cards` as colunas `strategic_pause boolean not null default false`, `golden_rule text not null default ''`, `activation_authority text not null default ''` (RLS/grants existentes mantêm-se).
- `src/hooks/useActionCards.ts`: novos campos no tipo `DBActionCard` e nas mutações de criar/atualizar.
- `src/components/sections/EmergencySection.tsx`: filtro, badge, botão de pausa, novos campos no formulário e no detalhe, passagem dos campos ao gerador de PDF.
- `src/lib/generateDeptActionCardsPDF.ts`: novo layout landscape conforme acima.
