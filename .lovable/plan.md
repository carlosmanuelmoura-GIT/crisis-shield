# Reordenar filtros dos Action Cards Departamentais

## Objetivo
Na secção dos Action Cards Departamentais (`EmergencySection`), alterar a ordem dos filtros para que o **Cenário** apareça primeiro e o **Tipo de DR** em segundo lugar.

## Alteração pretendida
Ordem atual:
1. Tipo de DR
2. Cenário
3. Departamento
4. Tipo de Falha

Nova ordem:
1. Cenário
2. Tipo de DR
3. Departamento
4. Tipo de Falha

## Ficheiro a alterar
- `src/components/sections/EmergencySection.tsx` — reordenar os 4 blocos `<Select>` dentro do cartão de filtros (comentário `Filters: Cenário, Departamento, Recurso`), mantendo todos os estados, labels e comportamentos existentes.

## Notas técnicas
- Não é necessário alterar a lógica de filtragem (`filtered`/`groupedByCenario`), apenas a disposição visual dos dropdowns.
- O layout em grid (`sm:grid-cols-4`) permanece inalterado.
