# Download real do Template de Ponto de Situação

## Problema
Ao clicar em Download num ficheiro HTML do campo "Template de Ponto de Situação", o navegador abre o código-fonte HTML numa nova aba em vez de descarregar o ficheiro para o disco.

## Alteração

1. **Download com gravação no disco**
   - No detalhe do template/crise (Controlo da Gestão de Crise), o botão de Download deixa de abrir o ficheiro numa nova aba.
   - Passa a obter a ligação temporária (URL assinada) do ficheiro privado, ler o conteúdo e gravá-lo no disco local com o nome original, através de um elemento `<a download>` criado em memória.
   - O ficheiro HTML descarregado abre depois como página Web formatada ao clicar duas vezes no disco.

2. **Nome do ficheiro clicável**
   - Clicar no nome do ficheiro também executa o mesmo download para o disco (em vez de abrir no browser).

3. **Estados e erros**
   - Mostrar estado de carregamento enquanto o download é preparado.
   - Mostrar mensagem de erro se o download falhar, mantendo o ficheiro associado intacto.

## Validação
- Confirmar que o download de um ficheiro HTML grava no disco com o nome correto.
- Confirmar que o ficheiro abre como página Web formatada a partir do disco.
- Verificar o estado de compilação do portal.

## Âmbito técnico
- Alteração apenas na apresentação/interação do detalhe da crise (`CrisisControlSection.tsx`).
- Sem alterações à estrutura de dados, permissões ou armazenamento.
