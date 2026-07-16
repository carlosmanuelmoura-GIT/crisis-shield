
## Objetivo

Enriquecer a tabela **Edifícios** (Back Office) com os campos do ficheiro `Autonomias_Edificio.xlsx`, importar as 17 linhas, e atualizar o CRUD para permitir editar todos os campos.

## 1. Schema — novos campos em `public.buildings`

Adicionar as colunas (todas nullable):

| Coluna | Tipo | Origem XLS |
|---|---|---|
| `autonomia_horas_contingencia` | numeric | AUTONOMIA_HORAS_CONTINGENCIA |
| `depositos` | text | Depósitos |
| `combustivel_litros` | numeric | COMBUSTIVEL_LITROS |
| `num_geradores` | integer | Nº Geradores |
| `num_ups` | integer | Nº UPS |
| `observacoes` | text | Observações relevantes |

Mantém `name` como identificador (Edifício / Zona). Sem alteração de RLS/GRANTs.

## 2. Importar dados do XLS

Após a migração, inserir as 17 linhas do ficheiro (INSERT com `ON CONFLICT` no `name` — vou adicionar `UNIQUE(name)` para permitir upsert e evitar duplicados nas próximas importações).

Registos: EDIFÍCIO DE PORTUGAL (Torre Norte/Centro/Sul/Leste/CPD/Central Segurança), Álvaro Pais, Olivais, Sede, Castilho, Complexo Carregado, Filiais Praça Liberdade / Almada, Delegações Ponta Delgada / Funchal, Outros Edifícios, Quinta Fonte Santa.

## 3. Hook `useBuildings.ts`

- Estender interface `Building` com os 6 novos campos.
- `useCreateBuilding` / `useUpdateBuilding` passam a receber objeto completo (não só `name`).

## 4. CRUD UI — `BackOfficeSection.tsx` (tab "Edifícios")

- Diálogo de criar/editar passa a ter os campos: Nome, Autonomia (h), Depósitos (textarea curto), Combustível (L), Nº Geradores, Nº UPS, Observações (textarea).
- Tabela lista passa a mostrar colunas resumidas: Nome, Autonomia (h), Combustível (L), Geradores, UPS + ações. "Depósitos" e "Observações" ficam só no diálogo (tooltip/detalhe) para não sobrecarregar.
- `TestCalendarSection` continua a usar apenas `name` — sem impacto.

## Notas técnicas

- Migração ordem: ALTER TABLE add columns → ADD UNIQUE(name) → nenhum GRANT novo necessário (tabela já existia).
- Import dos dados via ferramenta de inserts após migração aprovada (usa `ON CONFLICT (name) DO UPDATE`).
