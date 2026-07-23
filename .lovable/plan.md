## Objetivo

Aplicar aos **Action Cards da Gestão de Crise** (`ProceduresSection.tsx`) o mesmo padrão visual dos Action Cards Departamentais (`EmergencySection.tsx`), inspirado nas imagens:
- **Figura 1**: 3 tabs de fase no topo (Preparação / Gestão da Crise / Fim da Crise) + grid de 2 colunas com cartões resumo.
- **Figura 2**: Painel lateral (Sheet) que abre ao clicar num cartão, com secções bem estruturadas (Autoridade, Descrição & Objetivo, Ações sequenciais com checkboxes numeradas, Regra de ouro).

Reutiliza tokens e cores do design system já existente (nada de cores hardcoded).

---

## Alterações — só em `src/components/sections/ProceduresSection.tsx`

### 1. Layout principal — tabs no topo + grid

Substituir o layout atual (stepper à esquerda + lista à direita) por:

- **Topo**: 3 cartões-tab horizontais em `grid grid-cols-3 gap-3`, cada um mostrando:
  - Rótulo `FASE 0X` + ícone (Wrench/AlertTriangle/CheckCircle2 dos `lucide-react`)
  - Nome da fase (PT/EN)
  - Badge com contagem (`X Cards`)
  - Fase ativa: `ring-2 ring-primary` + fundo mais saturado; inativas: `opacity-70 hover:opacity-100`
  - Usa as cores já definidas em `PHASES` (`border-blue-400 bg-blue-50/40`, etc.)
- **Abaixo**: cabeçalho "FASE X ATIVA · Nome" + hint "Clique num cartão para abrir a vista operacional completa"
- **Grid de cartões** em `grid grid-cols-1 lg:grid-cols-2 gap-3` (drag & drop mantém-se)

### 2. Cartão resumo (na grid)

Cada cartão passa a mostrar (sem markdown expandido):
- Badge com **código curto** no topo esquerdo (ex. `AC_GCC_01`) — gerado a partir do índice na fase (`AC_GCC_${(i+1).toString().padStart(2,'0')}`)
- Badge à direita: `⚙ N Passos` (contagem de linhas numeradas / bullets do markdown PT)
- **Título** em uppercase
- **Descrição curta** (primeiras ~2 linhas de texto do markdown, sem headings) truncada
- Rodapé: ícone user + `category_pt/en` à esquerda, "Ver Card →" à direita
- Ícones de ação (clone/edit/delete/grip) visíveis só no hover, canto superior direito
- Click no corpo → abre Sheet lateral

### 3. Sheet lateral de detalhe (novo)

Adicionar `Sheet` (side="right", `w-full sm:max-w-xl`) que abre ao clicar num cartão. Estrutura:

- **Header**: badges (`AC_GCC_XX`, nome da fase) + botão X
- **Título** grande em uppercase
- **Bloco "AUTORIDADE / NÍVEL REQUERIDO"**: card com `border-primary/40 bg-primary/5`, mostra `category_pt/en` + ícone escudo (`ShieldCheck`)
- **Bloco "DESCRIÇÃO & OBJETIVO"**: primeiro parágrafo do markdown (texto antes das listas)
- **Bloco "AÇÕES SEQUENCIAIS (HEURÍSTICAS)"**: parse do markdown — cada item de lista (`- ` ou `N.`) vira um cartão com checkbox e numeração `1.`, `2.`, etc. Estado dos checkboxes é **apenas visual local** (não persiste, já que estes procedures não têm tabela de checklist_state associada — usar `useState<Record<string,boolean>>`)
- **Bloco "REGRA DE OURO ANTIFRÁGIL"** (opcional): se houver uma secção `## Regra de ouro` ou `### Regra` no markdown, destacar em card `border-alert bg-alert/10`
- **Footer**: botões `Copiar` (copia markdown), `Editar` (abre o Dialog CRUD existente), `Concluído` (fecha o sheet)

### 4. Parser de markdown estruturado

Nova função helper local `parseProcedure(md: string)` que devolve:
```ts
{ description: string; actions: string[]; goldenRule?: string }
```
- `description`: junta parágrafos até encontrar a primeira lista ou heading de "ações"
- `actions`: extrai bullets/numerados na secção principal
- `goldenRule`: texto sob heading "Regra de ouro" (case-insensitive)

Manter `renderMd` só como fallback caso não haja estrutura.

### 5. Preservar comportamento existente

- Drag & drop para reordenar continua a funcionar (grip no canto)
- Dialog CRUD PT/EN atual mantém-se inalterado
- Filtro por `searchQuery` continua
- Botão "Novo" no cabeçalho da grid

---

## Notas técnicas

- Sem migração DB, sem novos hooks — puramente refactor visual sobre `useProcedures`.
- Estado dos checkboxes do Sheet é local por sessão; não persiste (estes cards são "guias operacionais", não checklists com auditoria).
- Cores via tokens (`bg-primary/5`, `border-primary/40`, `bg-alert/10`, `border-alert`) — nunca `bg-blue-*` hardcoded fora dos tokens já existentes em `PHASES`.
- Ícone da fase mapeia `preparacao → Wrench`, `gestao → AlertTriangle`, `fim → CheckCircle2`.

Nenhum outro ficheiro é editado.
