# Três ajustes: Fornecedores e Gestão de Crise

## 1. Copiar Subcontratados (4ª parte) → Nome do Contrato (bulk)

Operação única na base de dados sobre a tabela de fornecedores:
- Para cada registo com Subcontratados preenchido, o valor passa para o Nome do Contrato.
- O campo Subcontratados fica vazio.
- Registos sem Subcontratados ficam inalterados (mantêm o nome do contrato atual).

Os campos continuam ambos disponíveis no formulário e no detalhe — só os dados são movidos.

## 2. Acordeão de fornecedores fechado por defeito

Na lista de Fornecedores Críticos, todos os fornecedores passam a aparecer fechados ao entrar na página; a expansão continua a ser feita clicando na linha do fornecedor.

## 3. Pausa Estratégica nas crises reais

Novo estado por crise, visível apenas nas crises reais (não nos templates):

- Na fase **Declaração de Crise** aparece um botão **"Ativar Pausa Estratégica"** (visível para o perfil Steering GCN).
- Uma vez ativa, aparece um aviso destacado no topo do painel da crise: "PAUSA ESTRATÉGICA ATIVA" com a indicação de quem ativou e quando.
- Na fase **Retorno** (fim do retorno) aparece o botão **"Desligar Pausa Estratégica"**, disponível apenas quando a pausa está ativa.
- Cada ativação/desativação escreve uma entrada no Log de Ações da crise com data/hora e autor.

## Notas técnicas

- Migração na tabela `crises`: `strategic_pause boolean not null default false`, `strategic_pause_by text not null default ''`, `strategic_pause_at timestamptz`.
- Bulk update (mesma migração ou passo SQL): `update public.suppliers set contract_name = subcontractors, subcontractors = '' where coalesce(subcontractors,'') <> '';`
- `src/components/sections/SuppliersSection.tsx`: `expanded[g.key] ?? true` passa a `?? false`.
- `src/hooks/useCrises.ts`: novos campos em `DBCrisis` e no payload de `useUpdateCrisis`.
- `src/components/sections/CrisisControlSection.tsx`: banner de pausa + botões nas fases `declaracao` e `retorno`, condicionados a `crisis.crisis_type !== "template"` e `isSteering`; log via `useLogDecisionFromCrisis`.
