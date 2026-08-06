export interface OverviewItem {
  name: { pt: string; en: string };
  desc: { pt: string; en: string };
}
export interface OverviewSection {
  title: { pt: string; en: string };
  items: OverviewItem[];
}

export const APP_OVERVIEW_TITLE = {
  pt: "PORTAL GCN — MANUAL FUNCIONAL",
  en: "PORTAL GCN — FUNCTIONAL MANUAL",
};

export const APP_OVERVIEW_INTRO = {
  pt: "O Portal GCN é a plataforma de Gestão de Continuidade de Negócio: suporta o governo do programa (cenários, BIA, PCN, pessoas críticas, testes) e a operação em crise (declaração, fases, action cards, logs), com back office de tabelas mestras e importação/exportação de dados.",
  en: "Portal GCN is the Business Continuity Management platform: it supports programme governance (scenarios, BIA, BCP, critical people, tests) and crisis operations (declaration, phases, action cards, logs), with a back office for master tables and data import/export.",
};

export const APP_OVERVIEW: OverviewSection[] = [
  {
    title: { pt: "GOVERNO GCN", en: "BCM GOVERNANCE" },
    items: [
      {
        name: { pt: "Cenários de Crise", en: "Crisis Scenarios" },
        desc: {
          pt: "Catálogo dos 6 cenários de desastre e respetivos Tipos de Falha associados, apresentados em formato expansível com associação por arrastar-e-largar.",
          en: "Catalogue of the 6 disaster scenarios and their associated Failure Types, shown in an expandable format with drag-and-drop association.",
        },
      },
      {
        name: { pt: "BIA — Análise de Impacto no Negócio", en: "BIA — Business Impact Analysis" },
        desc: {
          pt: "Gestão das análises de impacto por processo em vista Kanban, com descrição editável (nome da BIA + processo), criticidade, gráficos interativos por Tipo de BIA e Tipo de DR, e ligação às plataformas CMDB.",
          en: "Management of impact analyses per process in a Kanban view, with editable description (BIA name + process), criticality, interactive charts by BIA Type and DR Type, and linkage to CMDB platforms.",
        },
      },
      {
        name: { pt: "PCN Departamentais", en: "Departmental BCPs" },
        desc: {
          pt: "Planos de continuidade por departamento, com cartões expansíveis e documentação multi-ficheiro (BIA, contactos, procedimentos).",
          en: "Continuity plans per department, with expandable cards and multi-file documentation (BIA, contacts, procedures).",
        },
      },
      {
        name: { pt: "Pessoas Críticas", en: "Critical People" },
        desc: {
          pt: "Registo das pessoas-chave por departamento e função, com mapa de calor distrital construído a partir do código postal.",
          en: "Register of key people per department and role, with a district heatmap built from postal codes.",
        },
      },
      {
        name: { pt: "Contactos", en: "Contacts" },
        desc: {
          pt: "Diretório de contactos de emergência agrupado por função, com telefone e email visíveis em linha.",
          en: "Emergency contact directory grouped by role, with inline phone and email.",
        },
      },
      {
        name: { pt: "Análise de Fornecedores Críticos", en: "Critical Supplier Analysis" },
        desc: {
          pt: "Avaliação de risco e dependência dos fornecedores críticos de TI, infraestruturas e pagamentos, com associação às funções de negócio, subcontratados de 4ª parte, alertas de RTO mismatch, estratégias de saída, testes GCN conjuntos, matriz de concentração 2x2 (essencialidade vs esforço de substituição) para identificar lock-in, e importação/exportação em XLSX.",
          en: "Risk and dependency assessment of critical IT, infrastructure and payment suppliers, with linkage to business functions, 4th-party subcontractors, RTO mismatch alerts, exit strategies, joint BCM tests, a 2x2 concentration matrix (essentiality vs replacement effort) to spot lock-in, and XLSX import/export.",
        },
      },

      {
        name: { pt: "SMS Express", en: "SMS Express" },
        desc: {
          pt: "Acesso rápido ao envio de alertas por SMS através do portal MEO Empresas, aberto em novo separador.",
          en: "Quick access to SMS alerting through the MEO Empresas portal, opened in a new tab.",
        },
      },
      {
        name: { pt: "Calendário de Testes", en: "Test Calendar" },
        desc: {
          pt: "Planeamento e registo dos testes de continuidade, associados a edifícios, plataformas CMDB e macro processos.",
          en: "Planning and recording of continuity tests, linked to buildings, CMDB platforms and macro processes.",
        },
      },
    ],
  },
  {
    title: { pt: "OPERAÇÕES GCN", en: "BCM OPERATIONS" },
    items: [
      {
        name: { pt: "Controlo da Gestão de Crise", en: "Crisis Management Control" },
        desc: {
          pt: "Declaração de crise (real, simulada ou template) e condução do ciclo de 6 fases em vista de duas colunas, com autorizações condicionadas ao estado (Em Alerta, Em Curso, Fim) e aprovação formal de encerramento.",
          en: "Crisis declaration (real, simulated or template) and management of the 6-phase cycle in a two-column view, with state-conditioned authorisations (Alert, Ongoing, End) and formal closure approval.",
        },
      },
      {
        name: { pt: "Action Cards Gestão de Crise", en: "Crisis Action Cards" },
        desc: {
          pt: "Cartões de ação da equipa de crise com passos numerados e editáveis; cada validação fica registada no log com data e hora.",
          en: "Crisis team action cards with numbered, editable steps; each check is recorded in the log with a timestamp.",
        },
      },
      {
        name: { pt: "Action Cards Departamentos", en: "Departmental Action Cards" },
        desc: {
          pt: "Kanban de cartões por cenário e tipo de falha, com painel lateral de detalhe, reordenação das ações, BIAs associadas e exportação de relatório PDF por departamento.",
          en: "Kanban of cards by scenario and failure type, with a detail side panel, action reordering, linked BIAs and PDF report export per department.",
        },
      },
      {
        name: { pt: "Autonomia Energética Edifícios", en: "Building Energy Autonomy" },
        desc: {
          pt: "Gestão dos edifícios e da sua autonomia em situação de falha energética: KPIs de autonomia, geradores e depósitos de combustível, classificação por Tier (Tipo 1, Tipo 2, Tipo 3 — Agência & Numerário e Tipo 4 — Agências), filtros por criticidade e geração do Relatório Diesel em PDF. Inclui o CRUD completo dos edifícios, anteriormente no Back Office.",
          en: "Management of buildings and their autonomy during a power outage: autonomy KPIs, generators and fuel tanks, Tier classification (Type 1, Type 2, Type 3 — Branch & Cash and Type 4 — Branches), criticality filters and Diesel Report PDF generation. Includes the full building CRUD, previously in the Back Office.",
        },
      },
      {

        name: { pt: "Salas de Reuniões Virtuais", en: "Virtual Meeting Rooms" },
        desc: {
          pt: "Acesso direto às salas de reunião permanentes usadas pela estrutura de crise.",
          en: "Direct access to the standing meeting rooms used by the crisis structure.",
        },
      },
      {
        name: { pt: "Log das Ações de Gestão de Crise", en: "Crisis Action Log" },
        desc: {
          pt: "Registo cronológico consolidado por crise (decisões, transições de estado e validações de checklist), com as crises mais recentes primeiro.",
          en: "Consolidated chronological log per crisis (decisions, state transitions and checklist validations), most recent crises first.",
        },
      },
    ],
  },
  {
    title: { pt: "DOCUMENTAÇÃO GCN", en: "BCM DOCUMENTATION" },
    items: [
      {
        name: { pt: "Repositório Documental", en: "Document Repository" },
        desc: {
          pt: "Biblioteca de políticas, normas e planos, organizada por categorias, com carregamento de múltiplos ficheiros e ligações externas.",
          en: "Library of policies, standards and plans, organised by category, supporting multi-file upload and external links.",
        },
      },
    ],
  },
  {
    title: { pt: "BACK OFFICE", en: "BACK OFFICE" },
    items: [
      {
        name: { pt: "Tabelas Mestras", en: "Master Tables" },
        desc: {
          pt: "CRUD de perfis de utilizador, processos de negócio, tipos de falha, cenários, plataformas CMDB, tipos de DR, departamentos e categorias documentais.",
          en: "CRUD for user roles, business processes, failure types, scenarios, CMDB platforms, DR types, departments and document categories.",
        },
      },
      {
        name: { pt: "Import / Export", en: "Import / Export" },
        desc: {
          pt: "Migração de dados em XLSX para plataformas, processos, BIAs e pessoas críticas, com templates alinhados às colunas de exportação.",
          en: "XLSX data migration for platforms, processes, BIAs and critical people, with templates aligned to the export columns.",
        },
      },
    ],
  },
  {
    title: { pt: "FUNCIONALIDADES TRANSVERSAIS", en: "CROSS-CUTTING FEATURES" },
    items: [
      {
        name: { pt: "Autenticação e Perfis", en: "Authentication and Roles" },
        desc: {
          pt: "Acesso restrito por login, com os perfis Steering GCN, Técnico de Departamento e Especialista GCN a determinar as permissões de cada ecrã.",
          en: "Login-restricted access, with Steering GCN, Department Technician and BCM Specialist roles determining permissions on each screen.",
        },
      },
      {
        name: { pt: "Modo Satélite e Modo Crise", en: "Satellite Mode and Crisis Mode" },
        desc: {
          pt: "Modo Satélite reduz a interface ao essencial para ligações de baixa largura de banda; o Modo Crise destaca visualmente o portal enquanto existe crise ativa.",
          en: "Satellite mode strips the interface down for low-bandwidth links; Crisis mode visually highlights the portal while a crisis is active.",
        },
      },
      {
        name: { pt: "Multilingue e Pesquisa Global", en: "Multilingual and Global Search" },
        desc: {
          pt: "Interface em Português e Inglês e pesquisa global com filtragem contextual em tempo real.",
          en: "Portuguese and English interface, plus global search with real-time contextual filtering.",
        },
      },
      {
        name: { pt: "Resiliência e Offline", en: "Resilience and Offline" },
        desc: {
          pt: "Permite ter os dados GCN  com este portal e garantir a consulta em situação de indisponibilidade.",
          en: "Cloud-synced data with local persistence for consultation during outages.",
        },
      },
    ],
  },
];
