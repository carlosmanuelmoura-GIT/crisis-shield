

# GCN Survival Intranet — "Antifragile Crisis Portal"

Portal de intranet de Gestão de Continuidade de Negócio, desenhado para operar em condições extremas. SPA ultra-leve, mobile-first, com estética industrial/militar.

---

## 🎨 Design & Estética
- **Tema escuro militar**: fundo cinza escuro/charcoal, texto claro de alto contraste
- **Acentos de cor**: Vermelho (emergência), Amarelo (alerta), Verde (OK)
- **Tipografia**: system fonts (sem downloads de fontes)
- **Mobile-first**: todos os controlos operáveis com polegar num ecrã pequeno
- **Bilingue**: PT por defeito com toggle EN no header

---

## 🧭 Navegação & Layout
- **Header fixo** com: logo/título, toggle Modo Satélite, toggle idioma, barra de pesquisa global, botão flutuante "DECLARAR CRISE"
- **Menu principal** (sidebar colapsável em mobile) com 3 domínios: Emergência, Operacional, War Room

---

## 🚨 Domínio: EMERGÊNCIA
- **Action Cards**: cards flexíveis (lidos do JSON) com checklists interativos — itens marcáveis com estado persistido em LocalStorage
- **Contactos Linha Vermelha**: lista pesquisável com botão "clique para ligar" (`tel:`) e link SMS rápido
- **SMS Express**: link para envio rápido de SMS com mensagem pré-preenchida

## ⚙️ Domínio: OPERACIONAL
- **Procedimentos Críticos**: documentos em Markdown renderizados, organizados por pasta, pesquisáveis
- **BIA (Análise de Impacto)**: gráficos de dependência simples com semáforo de criticidade usando Recharts
- **Estado dos Serviços**: painel semáforo (Verde/Amarelo/Vermelho) com timestamp da última atualização

## 🏛️ Domínio: WAR ROOM
- **Links de Reunião**: botões diretos para Jitsi/Teams pré-configurados
- **Log de Decisões**: cronologia onde qualquer utilizador adiciona notas rápidas, tudo guardado em LocalStorage com timestamp

---

## 🔧 Funcionalidades Técnicas

### Modo Satélite (Toggle no Header)
Ao ativar: remove imagens, ícones SVG pesados, sombras e animações. Muda para modo "apenas texto" com alto contraste e layout ultra-comprimido.

### Botão DECLARAR CRISE
Botão flutuante fixo (estilo FAB). Ao premir: muda o tema inteiro para vermelho de alerta e abre automaticamente o primeiro Action Card de emergência.

### Leitura de `crisis_data.json`
Função que importa/lê um ficheiro JSON centralizado (`crisis_data.json`) que contém todos os dados: action cards, contactos, procedimentos, BIA, serviços. Simula o output de sync OneDrive.

### Pesquisa Global
Barra de pesquisa instantânea que filtra procedimentos, contactos e action cards em tempo real (client-side, sem servidor).

### Log de Crise (LocalStorage)
Todas as entradas do log e estados de checklists persistidos em LocalStorage para sobreviver a quedas de ligação.

### PWA (Progressive Web App)
Configuração de manifest.json e service worker para cache offline dos procedimentos e dados consultados.

---

## 📦 Dados Demo
Dados fictícios realistas pré-carregados no `crisis_data.json`: ~6 action cards (incêndio, ciberataque, inundação, pandemia, falha elétrica, falha telecomunicações), ~10 contactos, ~5 procedimentos, e mapa de dependências BIA.

