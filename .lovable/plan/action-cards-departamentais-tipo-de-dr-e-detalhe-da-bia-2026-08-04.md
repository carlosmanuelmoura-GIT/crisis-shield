# Action Cards Departamentais: Tipo de DR e detalhe da BIA

## Objetivo
1. Ao associar uma BIA a um Action Card, o Tipo de DR dessa BIA passa a ficar gravado no cartão.
2. Os cartões passam a ser organizados em três níveis: Cenário > Tipo de DR > Tipo de Falha.
3. No detalhe do Action Card, clicar numa BIA associada abre o detalhe dessa BIA.

## Base de dados
- Adicionar a coluna `dr_type_id` (opcional, ligada à tabela de tipos de DR) à tabela dos action cards.
- Preenchimento inicial: para cartões que já têm BIAs associadas, copiar o Tipo de DR da primeira BIA associada.

## Comportamento
- **Associar BIA**: ao ligar uma BIA a um cartão sem Tipo de DR definido, o cartão herda automaticamente o Tipo de DR da BIA. Se o cartão já tiver um DR diferente, mantém-se o existente (o utilizador pode alterá-lo no CRUD).
- **CRUD do cartão**: novo campo "Tipo de DR" no formulário de criação/edição, com opção "Sem DR".
- **Agrupamento (lista e Kanban)**: Cenário (nível 1, como hoje) > Tipo de DR (nível 2, novo) > Tipo de Falha (nível 3). Cartões sem DR ficam num grupo "Sem DR" no fim. Os cabeçalhos mostram o código/label do DR com os respetivos RTO/RPO e a contagem de cartões.
- **Filtro**: novo filtro por Tipo de DR na barra de filtros, a par de Cenário/Departamento/Tipo de Falha.
- **Badge**: o Tipo de DR aparece como etiqueta no cartão e no cabeçalho do painel lateral.
- **Detalhe da BIA**: na lista "BIAs Associadas" do painel lateral, clicar no nome da BIA abre um diálogo com nome, descrição, criticidade, RTO/RPO, Tipo de DR, departamento e hierarquia de processo. O botão de eliminar associação mantém-se separado.

## Notas técnicas
- Ficheiros afetados: `src/hooks/useActionCards.ts` (campo `dr_type_id` no tipo e nas mutações de criar/atualizar), `src/components/sections/EmergencySection.tsx` (agrupamento, filtro, formulário, diálogo de detalhe da BIA).
- Tipos de DR lidos via `useDRTypes()` de `src/hooks/useCMDBPlatforms.ts`; ordenação dos grupos por `sort_order`.
- Migração inclui os GRANT/políticas já existentes na tabela (só adiciona coluna, sem alterar RLS).
