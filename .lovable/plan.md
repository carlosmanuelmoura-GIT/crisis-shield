## Redesign de Cenários de Crise

Substituir a vista atual (lista de cenários + lista de recursos abaixo) por uma grelha sempre visível com os 6 cenários como caixas grandes, 3 por linha, cada uma contendo os seus recursos perdidos como mini-cartões kanban.

### Layout

```text
┌──── CENÁRIO I ────┐  ┌──── CENÁRIO II ───┐  ┌──── CENÁRIO III ──┐
│ [icon] Nome       │  │ [icon] Nome       │  │ [icon] Nome       │
│ ─────────────────│  │ ─────────────────│  │ ─────────────────│
│ ▢ Recurso A      │  │ ▢ Recurso C      │  │ ▢ Recurso E      │
│ ▢ Recurso B      │  │ ▢ Recurso D      │  │ ▢ Recurso F      │
└───────────────────┘  └───────────────────┘  └───────────────────┘
┌──── CENÁRIO IV ───┐  ┌──── CENÁRIO V ────┐  ┌──── CENÁRIO VI ───┐
│ ...               │  │ ...               │  │ ...               │
└───────────────────┘  └───────────────────┘  └───────────────────┘
```

### Alterações em `src/components/sections/ScenariosSection.tsx`

- Remover o estado `selected` e a secção inferior "Recursos que se perdem".
- Grelha principal: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4` ocupando toda a largura do ecrã.
- Cada cenário renderizado como caixa maior (`Card`) com:
  - Cabeçalho com borda colorida do cenário (`border-l-4` + cor do cenário), número romano em destaque, nome PT/EN, ícone e contador de recursos.
  - Corpo interno tipo "coluna kanban" com fundo subtil (`bg-muted/30 rounded-md p-2`) listando os recursos associados.
  - Cada recurso é um mini-cartão (`Card` compacto) com ícone, nome e — opcional — badges com os outros cenários onde também aparece.
  - Estado vazio: mensagem "Sem recursos associados".
- Manter cores, ícones e i18n (PT/EN) já existentes.
- Sem alterações de dados/hooks/migrations — apenas apresentação.

### Notas

- A interacção de clique para filtrar deixa de fazer sentido porque tudo é mostrado em paralelo; remover.
- Altura das caixas igualada via `h-full` + `flex flex-col` para alinhamento visual da grelha.
