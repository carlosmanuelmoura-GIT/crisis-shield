# Renomear tiers na Autonomia Energética

## Alterações
- "Tier 3 · Regional" passa a "Tier 3 · Agência & Numerário" (PT) / "Tier 3 · Branch & Cash" (EN).
- "Tier 3 · Frágil" / filtro "Frágeis (apenas UPS)" passa a "Tier 4 · Agências" (PT) / "Tier 4 · Branches" (EN).

## Detalhe técnico
Em `src/components/sections/AutonomiaEnergeticaSection.tsx`: atualizar os rótulos no mapa de tiers (linhas ~47-50) e nas opções de filtro (linhas ~197-200). Sem mudanças na lógica de cálculo do tier nem na base de dados; a chave interna `fragil` mantém-se.
