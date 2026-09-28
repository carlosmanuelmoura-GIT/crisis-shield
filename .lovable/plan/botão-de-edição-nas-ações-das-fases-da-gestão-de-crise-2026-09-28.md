# Botão de Edição nas Ações das Fases da Gestão de Crise

Separar a conclusão (checkbox) da edição de detalhes (botão lápis) nas ações das fases, em `src/components/sections/CrisisControlSection.tsx`.

## Alterações

1. **Checkbox (concluir)**: mantém o comportamento atual — abre o diálogo de conclusão (Dep Origem, Quem reportou, Notas) com os valores existentes pré-preenchidos.

2. **Novo botão de edição (ícone lápis)** junto a cada ação, visível quer esteja pendente quer concluída:
   - Abre o mesmo diálogo (max-w-2xl) em modo de edição: Dep Origem, Quem reportou, Notas (Textarea 4 linhas) e o próprio texto da ação.
   - Guarda sem alterar o estado checked; regista no log de decisões: `📝 Detalhes da ação atualizados` (ligado à crise ativa, como no toggle atual).

3. **Desmarcar o checkbox**: mantém a reversão atual, sem apagar os metadados.

## Detalhes técnicos

- Reutilizar o diálogo existente com um modo (`complete` vs `edit`); no modo `edit` o botão de guardar chama um update de `crisis_phase_actions` (text, info_department, info_person, notes) via mutação existente/nova em `useCrises.ts`, seguido de insert em `decision_log`.
- Ícone `Pencil` (lucide), botão ghost pequeno alinhado à direita de cada linha de ação.

## Verificação

- Validar TypeScript.
- Testar no preview: editar ação pendente e concluída, confirmar gravação e entrada no log; concluir e reverter via checkbox sem perder dados.
