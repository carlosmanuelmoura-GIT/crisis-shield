## Objetivo

Acrescentar ao PDF "Manual Funcional" uma secção final com snapshots dos ecrãs da aplicação, um por funcionalidade principal, a seguir à apresentação das funcionalidades.

## 1. Capturar os screenshots

Capturo os ecrãs da aplicação em execução (Playwright, viewport desktop, sessão autenticada) para cada funcionalidade principal:

- Cenários de Crise
- BIA
- PCN Departamentais
- Pessoas Críticas
- Contactos
- Calendário de Testes
- Controlo da Gestão de Crise
- Action Cards Gestão de Crise
- Action Cards Departamentos
- Log das Ações
- Documentação GCN
- Back Office

Cada imagem é otimizada (JPEG, largura ~1400px) e guardada em `src/assets/screenshots/`, carregada para o CDN via pointers `.asset.json` para não pesar no repositório.

## 2. Catálogo de snapshots

Novo ficheiro `src/lib/appOverviewScreens.ts`: lista ordenada de `{ id, caption: { pt, en }, asset }` ligando cada imagem à respetiva funcionalidade, com legendas bilingues alinhadas aos nomes já usados em `appOverviewContent.ts`.

## 3. PDF

Em `src/lib/generateAppOverviewPDF.ts`, após as secções de funcionalidades:

- Nova página com barra de título azul: "ANEXO — ECRÃS DA APLICAÇÃO" / "ANNEX — APPLICATION SCREENS".
- Uma imagem por bloco, escalada à largura útil mantendo o rácio, com legenda numerada por baixo ("Fig. 1 — Cenários de Crise").
- Duas imagens por página quando cabem; caso contrário nova página automática.
- Rodapé e numeração de páginas mantêm-se (já são desenhados no fim para todas as páginas).

## 4. UI do Back Office

No separador "Sobre a Aplicação", adicionar uma galeria dos mesmos snapshots (grelha de miniaturas com legenda, clique para ampliar em diálogo), reutilizando o mesmo catálogo para UI e PDF.

## Detalhes técnicos

- As imagens são embebidas no PDF via `doc.addImage` a partir de data URLs obtidos com `fetch` + `FileReader` no momento da geração; a função `generateAppOverviewPDF` passa a ser `async` e o botão mostra estado "A gerar…".
- Formato JPEG com compressão para manter o PDF abaixo de poucos MB.
- Sem alterações de base de dados.
