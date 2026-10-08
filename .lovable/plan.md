# Template de apoio às crises reais

## Objetivo
Adicionar, no topo do detalhe de um template de crise e à direita do estado, dois recursos de apoio ao Gabinete de Gestão de Crises:

- **Situações Report Template**: um único ficheiro por template/crise.
- **Agente AI de suporte**: uma URL editável com ação para abrir numa nova janela.

Ao criar uma crise real a partir de um template, ambos ficam disponíveis na nova crise real.

## Implementação

1. **Guardar os novos dados por crise**
   - Acrescentar ao registo de crise o nome e localização privada do ficheiro e a URL do Agente AI.
   - Manter o ficheiro no armazenamento privado do portal, associado ao template ou à crise concreta.
   - Permitir consulta e alteração apenas a utilizadores autenticados, conforme definido.

2. **Adicionar os campos ao topo do detalhe**
   - Reorganizar o cabeçalho para manter o estado da crise e apresentar, à sua direita, os dois campos.
   - No campo **Situações Report Template**, permitir carregar, abrir/descarregar, substituir e remover um ficheiro.
   - Aceitar HTML e os formatos documentais já usados no portal (PDF, Word, Excel e PowerPoint).
   - No campo **Agente AI de suporte**, permitir editar/guardar a URL e abrir a ligação numa nova janela.
   - Mostrar estados claros para ficheiro inexistente, carregamento e erros.

3. **Passagem do template para a crise real**
   - Ao criar uma crise real com um template base, copiar a URL para a nova crise.
   - Criar uma cópia independente do ficheiro para a nova crise, evitando que uma substituição posterior na crise real altere o template original.
   - Manter o comportamento atual de cópia das ações e fases.

4. **Atualizar a lógica do portal**
   - Alargar os dados e operações das crises para ler e atualizar os novos campos.
   - Atualizar imediatamente o ecrã após carregar, substituir, remover ou guardar.
   - Apresentar os dois recursos tanto no detalhe do template como no detalhe da crise real criada a partir dele.

5. **Validar**
   - Testar upload, abertura, substituição e remoção do ficheiro.
   - Testar URL válida, gravação e abertura do Agente AI.
   - Criar uma crise real a partir de um template e confirmar que recebe uma cópia independente do ficheiro e a URL.
   - Confirmar o comportamento para todos os utilizadores autenticados e verificar o portal em ecrãs desktop e mobile.

## Detalhes técnicos
- Alteração aditiva da tabela `crises`, sem afetar crises existentes.
- Ficheiros guardados no armazenamento privado existente, numa pasta própria por crise, com regras específicas para utilizadores autenticados.
- URLs externas serão validadas como `http`/`https` antes de serem guardadas ou abertas.
- A alteração será concentrada no detalhe e nos hooks da Gestão de Crise; não altera o módulo geral de Documentação.
