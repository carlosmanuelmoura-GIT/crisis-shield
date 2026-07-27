## Objetivo
Adicionar um botão **"Report"** nos Action Cards Departamentais que gera um PDF imprimível dos cartões do departamento selecionado, agrupados por cenário de desastre, replicando o estilo visual do manual em anexo (cabeçalhos coloridos, ações numeradas 1.º, 2.º, 3.º…).

## Localização do botão
No `EmergencySection.tsx`, ao lado do seletor de Departamento (na barra de filtros), adicionar botão **"Report PDF"** com ícone. Fica desativado se nenhum departamento estiver selecionado.

## Estrutura do PDF
- **Cabeçalho de página** (repetido em cada página):
  - Ícone escudo + título "GESTÃO DE CONTINUIDADE DE NEGÓCIO"
  - Subtítulo: `MANUAL DE AÇÕES IMEDIATAS — {Nome do Departamento}`
  - Faixa azul separadora
- **Corpo** — agrupado por cenário (Cenário I, II, III…):
  - Título de cenário como secção (nome + descrição curta)
  - Grelha de 2–3 cartões por linha, cada cartão contém:
    - Cabeçalho colorido pela severidade (vermelho/âmbar/amarelo/verde) com título do card em maiúsculas
    - Linha meta: `Cenário · Tipo de Falha · Macro Processo`
    - Lista numerada de todas as ações do checklist: `1.º …`, `2.º …`
  - Quebra de página automática entre cenários quando não couber
- **Rodapé**: `Portal GCN · {data} · Página X / Y`

## Implementação técnica
- Biblioteca cliente-side: **jsPDF + jspdf-autotable** (leve, sem dependências server).
- Novo ficheiro `src/lib/generateDeptActionCardsPDF.ts` com função `generatePDF(dept, cards, checklistItems, cenarios)`:
  - Recebe departamento, action cards filtrados, itens de checklist e mapa de cenários já em memória (React Query).
  - Renderiza cabeçalho, agrupa `cards` por `cenario_id`, desenha "cartões" com `rect` arredondado + texto.
  - Cores tiradas do design system (mesmas variáveis usadas nos badges de severidade).
  - Fonte Helvetica (jsPDF built-in suporta latim-1 acentuado com encoding correto; testar acentos PT).
- No `EmergencySection.tsx`:
  - Importa a função e handler `handleGenerateReport()` que passa os dados já disponíveis.
  - Abre o PDF em nova aba (`doc.output("bloburl")`) — o utilizador imprime a partir do visualizador.

## Fora de âmbito
- Não altera dados, hooks nem esquema de BD.
- Não gera PDF para "todos os departamentos" nem para Gestão de Crise (só departamentais).
- Sem rodapé de contactos de emergência (não pedido).
