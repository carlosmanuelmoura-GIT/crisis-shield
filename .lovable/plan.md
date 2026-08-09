# Pausa Estratégica nos Action Cards Departamentais

## Objetivo
Marcar cada Action Card departamental como associado (ou não) à Pausa Estratégica, e poder filtrar por esse critério.

## O que vai ser feito

1. **Novo campo na base de dados**
   - Adicionar à tabela dos action cards um campo booleano "Pausa Estratégica" (por defeito: não associado).

2. **Botão no cartão (detalhe)**
   - No ecrã de detalhe do Action Card, botão/interruptor "Associado a Pausa Estratégica" que liga/desliga e grava de imediato.
   - Estados visuais: ativo (âmbar, ícone de pausa) / inativo (neutro).

3. **Indicador no cartão Kanban**
   - Badge âmbar discreto "Pausa Estratégica" nos cartões marcados, para leitura rápida sem abrir o detalhe.

4. **Filtro**
   - Novo filtro na barra de Filtros com as opções: Todos / Com Pausa Estratégica / Sem Pausa Estratégica.
   - Integrado na lógica existente de filtragem e no indicador de "filtros ativos".

## Detalhes técnicos
- Migração: `ALTER TABLE public.action_cards ADD COLUMN strategic_pause boolean NOT NULL DEFAULT false;` (RLS/grants existentes mantêm-se).
- `src/hooks/useActionCards.ts`: incluir o campo no tipo e na mutação de update.
- `src/components/sections/EmergencySection.tsx`: estado `filterStrategicPause`, condição no `filtered`, novo `Select` nos filtros, badge no cartão e botão no diálogo de detalhe.
- Sem alterações ao PDF de report nesta fase.
