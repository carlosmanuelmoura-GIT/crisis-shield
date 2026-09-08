# Relatório PDF do Manual da Gestão de Crise

## Objetivo
Adicionar no "Manual da Gestão de Crise" um botão que gera um PDF com todos os action cards, agrupados por fase da gestão de crise, no mesmo estilo visual do relatório dos Action Cards Departamentais.

## O que muda

### 1. Novo gerador de PDF (`src/lib/generateCrisisManualPDF.ts`)
Reutiliza o layout de `generateDeptActionCardsPDF.ts` (A4 landscape), adaptado:

- **Cabeçalho do documento**: badge "EUROSISTEMA / GCN", título "GESTÃO DE CONTINUIDADE DE NEGÓCIO", subtítulo "MANUAL DE GESTÃO DE CRISE — ACTION CARDS", REF, classificação RESERVADO e data da última revisão.
- **Barra de fase** (equivalente à barra de cenário): faixa navy com badge "FASE 01 / 02 / 03" e o nome da fase (Preparação, Gestão da Crise, Fim de Crise), com o ícone/estilo já usado no ecrã.
- **Cartões em 2 colunas** por fase: código do card (AC_PRP / AC_GCC / AC_END + número sequencial), título em maiúsculas, linha de categoria.
- **Caixa "REGRA DE OURO"** (fundo âmbar) quando o conteúdo do card tiver essa informação, usando a mesma extração já feita no ecrã.
- **"AÇÕES SEQUENCIAIS"**: passos numerados em badges quadrados escuros (01, 02, ...), vindos da tabela de passos de cada card.
- **Rodapé do cartão**: "REGISTO: LOG DA CRISE".
- **Rodapé da página**: "GCN // DOCUMENTO DE OPERAÇÃO DE EMERGÊNCIA" e numeração de páginas.
- Quebras de página automáticas mantendo cada cartão inteiro.
- Ficheiro descarregado com nome `Manual_Gestao_Crise_<data>.pdf`.

### 2. Botão no ecrã (`src/components/sections/ProceduresSection.tsx`)
- Botão "Report PDF" (ícone de download) no cabeçalho da secção, junto às ações existentes.
- Gera sempre o manual completo (as três fases), independentemente da fase selecionada no ecrã.
- Desativado enquanto os dados carregam ou se não existirem action cards.
- Texto bilingue PT/EN.

### 3. Carregamento dos passos
- O ecrã só carrega os passos do card aberto. Para o PDF é necessário obter todos os passos de uma vez: adicionar em `src/hooks/useProcedureSteps.ts` um `useAllProcedureSteps()` que devolve todos os registos ordenados por `procedure_id` e `sort_order`.

## Notas técnicas
- Reutiliza `jspdf` (já instalado) e as constantes de cor/estilo do gerador dos departamentos; a lógica partilhada de desenho do cartão é copiada e adaptada (os campos diferem: procedures não têm severidade, cenário, RTO nem autoridade de ativação).
- Onde o relatório dos departamentos mostra severidade e RTO, o manual mostra a categoria do card e o número de ações.
- Sem alterações à base de dados.
