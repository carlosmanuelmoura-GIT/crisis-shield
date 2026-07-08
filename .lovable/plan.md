# Nova paleta e estilo visual (base: HTML anexo)

Aplicar o estilo do `dashboard_action_cards.html` como novo design system global da aplicação, substituindo o tema atual creme/bronze do Banco de Portugal por um look moderno slate/branco com acentos azul e semáforos vivos.

## Direção visual

- **Fundo geral**: `slate-50` (`#f8fafc`), superfícies em branco puro.
- **Texto**: `slate-900` principal, `slate-500` para labels/uppercase.
- **Sidebar & header de destaque**: `slate-900` com texto branco (substitui o castanho actual). Acentos em `slate-400`/branco translúcido.
- **Acento primário (acções, foco, links)**: `blue-600` (`#2563eb`).
- **Semáforos de severidade / estado de crise**:
  - Crítico / Crisis → `red-600`
  - Alto / Alerta → `amber-500`
  - Médio → `yellow-400`
  - OK / Sucesso → `emerald-500`
- **Tipografia**: Inter (300–900) como fonte principal, JetBrains Mono para códigos/timers (`T+05'`, IDs). Adicionar via `<link>` no `index.html`.
- **Formas**: cantos `rounded-xl`/`rounded-2xl`, sombras suaves (`shadow-sm`, `shadow-md`), bordas `slate-200`.
- **Labels/títulos**: uppercase, tracking largo, `font-black`, tamanhos `text-[10px]`–`text-xs`.
- **Modo crise**: mantém-se, mas passa a escurecer header/sidebar para tons `red-950`/`slate-950` em vez do vermelho actual.
- **Modo satélite**: mantido (preto/branco, sem sombras).

## Ficheiros a alterar

1. **`src/index.css`** — reescrever tokens HSL de `:root`:
   - `--background` → slate-50, `--foreground` → slate-900
   - `--card`, `--popover` → branco
   - `--primary` → blue-600, `--ring` → blue-600
   - `--secondary`, `--muted`, `--accent` → variações de slate-100/200
   - `--border`, `--input` → slate-200/300
   - `--sidebar-background` → slate-900, `--sidebar-foreground` → slate-100, `--sidebar-primary` → blue-500, `--sidebar-accent` → slate-800, `--sidebar-border` → slate-800
   - `--crisis-red` → red-600, `--alert-yellow` → amber-500, `--ok-green` → emerald-500
   - `--radius` → `0.75rem` (rounded-xl base)
   - Ajustar `.crisis-active` para variação slate-950/red-950
   - Trocar `font-family` base para Inter, adicionar utilitário `.mono` (JetBrains Mono)

2. **`index.html`** — adicionar `<link>` para Google Fonts (Inter + JetBrains Mono) e actualizar `<title>`/meta se necessário.

3. **`tailwind.config.ts`** — sem breaking changes (tokens continuam ligados às CSS vars); adicionar `fontFamily.sans = ['Inter', ...]` e `fontFamily.mono = ['JetBrains Mono', ...]`.

4. **Sem alterações a componentes/lógica**: todos os componentes já usam tokens semânticos (`bg-background`, `bg-sidebar`, `text-primary`, `bg-crisis`, `bg-alert`, `bg-ok`). A troca de tokens propaga automaticamente. Só é excepção corrigir eventuais casos residuais que usem cores hard-coded (a verificar com `rg` durante a implementação).

## Memória a actualizar

Substituir a regra Core «Light theme, cream bg, dark brown/bronze sidebar, gold accents» por «Light theme slate/white, sidebar slate-900, acento azul, semáforos red/amber/yellow/emerald, fontes Inter + JetBrains Mono».

## O que fica igual

- Estrutura de layout, largura total desktop, dialogs `max-w-3xl`.
- Comportamento de modo satélite, modo crise, i18n, permissões.
- Nenhuma alteração a Supabase, React Query, hooks ou lógica de negócio.
