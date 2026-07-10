## Objetivo

Nos **Action Cards Departamentos** (`EmergencySection`), transformar a experiência para que o clique num cartão abra um **painel/drawer lateral à direita** com o detalhe completo do Action Card, inspirado na maquete HTML fornecida. Toda a edição, adição de ações e marcação de checkboxes passa a ocorrer nesse painel.

## Alterações

### `src/components/sections/EmergencySection.tsx`
1. Adicionar estado `selectedCardId` e substituir o toggle inline (expand/collapse Kanban e Lista) por uma seleção que abre um `Sheet` (drawer shadcn) do lado direito.
2. Cartões passam a mostrar apenas o essencial: `ID` badge, título, sub-capacidade/recurso, badge de severidade, mini-progresso `X/Y`. Ao clicar em qualquer parte do cartão → abre o drawer com o detalhe. Cartão selecionado ganha borda/ring destacado.
3. Remover os botões de ação (Editar / Duplicar / Eliminar / Link BIA) e a checklist expandida de dentro dos cartões — passam todos para o drawer.
4. Novo componente `<ActionCardDrawer>` (mesmo ficheiro) usando `Sheet` com `side="right"` e `w-[480px]`, replicando o visual do HTML anexo:
   - **Header** slate-900 escuro com texto branco: badge do ID (mono, bg branco/slate translúcido), badge de severidade (`Crítico` vermelho / `Alto` âmbar / `Médio` amarelo / `Baixo` verde), título em uppercase black, subtítulo com sub-capacidade, botão `X` de fechar, botões de ação (Editar, Duplicar, Eliminar, Link BIA) na toolbar.
   - **Body** com scroll:
     - Bloco "Gatilhos / Contexto" (usa `capability` e badges de BIAs ligadas com botão remover).
     - Bloco "Ações" (checklist) — cada item com checkbox, texto editável inline, botões edit/delete visíveis em hover, e input + botão `+` no fim para adicionar nova ação (comportamento atual de `handleAddItem`).
     - Bloco "Regras de Ouro" opcional se `notes`/`golden_rules` existir (por agora renderiza só se preenchido; sem nova coluna DB).
   - **Footer** sticky com contador de progresso e botão principal desativado quando checklists bloqueados.
5. Aplicar tokens de cor do HTML anexo (já presentes em `index.css`): `bg-slate-900`, `text-slate-50`, `bg-slate-50`, badges `bg-red-600`/`bg-amber-500`/`bg-yellow-400`/`bg-emerald-500`, mono para IDs (`font-mono`). Sem cores hardcoded fora dos utilitários Tailwind já disponíveis.
6. Manter todas as regras de negócio existentes: bloqueio de checklists sem crise ativa, diálogo de confirmação com Departamento/Pessoa/Notas, invalidação de queries.
7. O `Dialog` de criação/edição (`openCreate`/`openEdit`) mantém-se e é aberto a partir do botão "Editar" dentro do drawer.

## Aceitação
- Clicar num cartão (Kanban ou Lista) abre um painel à direita com o detalhe do Action Card.
- Toda a edição, checklist e adição de ações acontece no painel — os cartões ficam limpos.
- Visual do painel usa a paleta slate/branco + badges de severidade da maquete HTML.
- Fechar (X, ESC ou clique fora) volta à vista de cartões sem perder estado.
