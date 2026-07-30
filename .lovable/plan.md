## Objetivo

Documentar, dentro do próprio Portal GCN, o que a aplicação faz — num novo separador do Back Office — com botão para descarregar essa documentação em PDF.

## 1. Novo separador "Sobre a Aplicação"

Em `BackOfficeSection.tsx`, adicionar um `TabsTrigger`/`TabsContent` com id `about` (ícone Info), como primeiro separador da lista.

Conteúdo apresentado em cartões por área, bilingue (PT/EN) seguindo o padrão `lang === "pt"`:

**GOVERNO GCN**
- Cenários de Crise — 6 cenários de desastre e respetivos Tipos de Falha, em acordeão.
- BIA — análises de impacto por processo, Kanban com descrição editável, gráficos por Tipo de BIA e Tipo de DR, ligação a plataformas CMDB.
- PCN Departamentais — planos por departamento, documentos multi-ficheiro.
- Pessoas Críticas — mapa/heatmap distrital por código postal.
- Contactos — diretório agrupado por função.
- SMS Express — envio de alertas via MEO Empresas.
- Calendário de Testes — testes ligados a edifícios, CMDB e macro processos.

**OPERAÇÕES GCN**
- Controlo da Gestão de Crise — ciclo de 6 fases, declaração (real/simulada/template), autorizações por estado, encerramento com aprovação.
- Action Cards Gestão de Crise — passos numerados, check com registo em log.
- Action Cards Departamentos — Kanban por cenário, painel lateral de detalhe, BIAs associadas, exportação PDF por departamento.
- Salas de Reuniões Virtuais.
- Log das Ações — registo cronológico consolidado por crise.

**DOCUMENTAÇÃO GCN** — repositório de documentos com categorias e URLs externos.

**BACK OFFICE** — tabelas mestras (perfis, processos, tipos de falha, cenários, plataformas, tipos de DR, edifícios, departamentos, categorias documentais) e Import/Export XLSX.

**TRANSVERSAL** — autenticação e perfis (Steering GCN / Técnico / Especialista), modo Satélite (baixa largura de banda), modo Crise, PT/EN, pesquisa global, PWA offline.

## 2. Botão "Gerar PDF"

No cabeçalho do separador, botão que gera o documento com `jspdf`, reutilizando o estilo de `src/lib/generateDeptActionCardsPDF.ts`.

## Detalhes técnicos

- Nova função `src/lib/generateAppOverviewPDF.ts` exportando `generateAppOverviewPDF(lang)`.
- Fonte única de conteúdo: `src/lib/appOverviewContent.ts` (array de secções `{ title, items[] }` em PT/EN) consumido tanto pela UI como pelo PDF — evita divergências.
- PDF: faixa de marca azul (`BRAND_BLUE` 30/64/148), título "PORTAL GCN — MANUAL FUNCIONAL", secções com barra de título, bullets com `splitTextToSize`, quebra de página automática, rodapé "Portal GCN · data · Página x/y".
- Download via `doc.save("Portal_GCN_Manual_Funcional_YYYY-MM-DD.pdf")`.
- Sem alterações de base de dados.
