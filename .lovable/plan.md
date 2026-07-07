## Contexto
No detalhe de uma crise (vista Kanban) existem duas caixas informativas no topo que mostram:
- "🚨 Declarada por: ..." (quando `crisis.declared_by` está preenchido)
- "✅ Fim aprovado por: ..." (quando `crisis.ended_by` está preenchido)

Estas caixas aparecem tanto em crises reais/simuladas como nos templates de crise.

## Alteração proposta
Remover estas duas caixas informativas de topo **apenas quando se está a visualizar um template** (`crisis.crisis_type === "template"`), mantendo-as visíveis nas crises reais/simuladas.

## Ficheiro a alterar
- `src/components/sections/CrisisControlSection.tsx`

## Detalhe técnico
No bloco `{/* Declaration / End info */}` (c. linhas 793-803), envolver as duas `div` informativas numa condição que verifica se a crise não é um template:

```jsx
{crisis.crisis_type !== "template" && (
  <>
    {crisis.declared_by && (...)}
    {crisis.ended_by && (...)}
  </>
)}
```

## O que NÃO muda
- Os campos "Autorizado por" e botão "DECLARAR CRISE" na fase "Declaração de Crise".
- Os campos "Aprovado por" e botão "FIM DE CRISE" na fase "Fim de Crise".
- O comportamento em crises reais/simuladas.

## Nota
Se pretendias remover estas caixas em **todas** as vistas de crise (reais e templates), diz-me para ajustar o plano.