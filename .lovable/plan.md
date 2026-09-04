# Funcionalidades de automação e integrações/IA para o Portal GCN

## Contexto
O Portal GCN já cobre o ciclo de BCM: governo (cenários, BIA, PCN, fornecedores, pessoas críticas, testes), operações de crise (declaração, 6 fases, action cards, log) e back office (tabelas mestras, import/export). O que falta são as camadas de automação, notificação, audit trail e assistência inteligente que tornam a resposta a uma crise mais rápida e conforme.

## Objectivo
Adicionar funcionalidades nas áreas escolhidas pelo utilizador — **Automação das operações de crise** e **Integrações e IA** — de forma incremental, começando pelas de maior impacto imediato e menor dependência de credenciais externas.

## Proposta de funcionalidades

### 1. Central de alertas e notificações in-app
- Criar tabela `notifications` (user_id, type, title_pt, title_en, body_pt, body_en, link, read, created_at).
- Emitir notificações automaticamente em eventos: declaração de crise, mudança de fase, ativação/desativação de pausa estratégica, atribuição de action card, checklist por concluir.
- Adicionar ícone de sino no `Header` com contador de não lidas e painel de histórico.
- Marcar como lida ao clicar; opção "Marcar todas como lidas".

### 2. Audit trail / feed de atividade
- Criar tabela `audit_log` (table_name, record_id, action, old_values, new_values, user_id, created_at).
- Registar automaticamente alterações relevantes: transições de estado da crise, edição de action cards, alterações de perfis/roles, checklists validados.
- Adicionar separador "Audit Log" no Back Office com filtros por tabela, utilizador e data.
- Exportar para PDF/CSV.

### 3. Escalonamento automático de ações
- Usar os RTO dos `dr_types` para calcular prazos por action card.
- Criar tabela `action_escalations` (action_card_id, step_id, due_at, escalated_at, notified_users, status).
- Quando um passo não é validado dentro do prazo, gerar notificação para o próximo nível hierárquico ( Steering GCN → Especialista GCN → Técnico Dept.).
- Mostrar indicador visual (amarelo/vermelho) nos cartões com ações em atraso.

### 4. Dashboard de KPIs em tempo real
- Nova secção "Dashboard GCN" no menu GOVERNO GCN.
- Widgets: crises ativas, crises no último trimestre, action cards pendentes, BIAs por criticidade, testes a decorrer/vencidos, fornecedores não conformes, edifícios por tier.
- Gráficos com Recharts (já usado na BIA).
- Dados alimentados por views/aggregates simples no Supabase.

### 5. Assistente IA para gestão de crise
- Painel lateral tipo chat dentro do "Controlo da Gestão de Crise".
- Capacidades: resumir o log da crise atual, sugerir action cards relevantes com base no cenário/tipo de DR, responder a perguntas sobre BIA/fornecedores/contactos.
- Implementar via Edge Function `ai-crisis-assistant` usando Lovable AI Gateway (não requer chave externa).
- Guardar histórico de conversa na tabela `ai_chat_messages` (crisis_id, user_id, role, content, created_at).

### 6. Integração nativa de notificações externas (fase 2)
- Substituir o link externo do "SMS Express" por envio controlado pelo portal.
- Edge Function `send-notification` que suporte email (SMTP/Resend/SendGrid) e/ou SMS (MEO Empresas API).
- Requer configuração de secrets; só ativar quando o utilizador fornecer credenciais.
- Templates de mensagem por tipo de evento, em PT e EN.

## Ordem de implementação sugerida

```text
Fase 1 — Fundação
  1.1 Audit trail (audit_log + UI)
  1.2 Central de notificações in-app
  1.3 Dashboard de KPIs

Fase 2 — Automação
  2.1 Escalonamento automático de ações
  2.2 Gatilhos de notificação nos eventos de crise

Fase 3 — IA e integrações externas
  3.1 Assistente IA no controlo de crise
  3.2 Integração nativa email/SMS (quando houver credenciais)
```

## Detalhes técnicos

### Novas tabelas (todas com RLS + GRANTs)
- `notifications`: leitura apenas para o destinatário; insert via triggers/edge functions/service_role.
- `audit_log`: leitura apenas para `especialista_gcn`; insert via triggers/service_role.
- `action_escalations`: leitura para roles relevantes; insert/update via edge function.
- `ai_chat_messages`: leitura para participantes da crise; insert pelo utilizador autenticado.

### Triggers
- Reutilizar `update_updated_at_column()` para as novas tabelas.
- Novos triggers nas tabelas existentes (`crises`, `crisis_phases`, `checklist_state`, `action_cards`, `user_roles`) para escreverem em `audit_log` e/ou gerarem notificações.

### Edge Functions
- `ai-crisis-assistant`: valida JWT, recebe `crisis_id` + pergunta, consulta dados agregados e chama Lovable AI Gateway.
- `send-notification`: envio de email/SMS (só ativo com secrets configurados).
- `check-action-escalations`: executado periodicamente para verificar ações em atraso.

### UI/UX
- Seguir o design system existente: slate/azul, sem hardcoded colors, componentes shadcn, diálogos `max-w-3xl`, scroll interno.
- Novas entradas no `AppSidebar` e no `sectionMap` de `Index.tsx`.
- Textos em PT/EN via `t()` do `AppContext`.

### Segurança
- Nunca expor `service_role` no cliente.
- Notificações e audit log inseridos via security-definer triggers ou edge functions.
- RLS a garantir que um utilizador só vê as suas notificações e o audit log só é visível a `especialista_gcn`.

## Critérios de aceitação
- Utilizador vê notificações em tempo real no ícone do sino.
- Cada transição de estado de crise gera entrada no audit log.
- Dashboard apresenta KPIs sem recarregar a página.
- Assistente IA responde no contexto da crise ativa.
- Escalonamento gera notificação quando um passo excede o RTO.

## Próximos passos
Aprovar esta proposta para começar pela Fase 1, ou indicar quais funcionalidades quer priorizar/retirar.
