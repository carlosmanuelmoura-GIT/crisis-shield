## Plano de correção

1. **Fase 6 deve colocar estado FIM**
   - Ajustar a ação da fase `fim` para atualizar explicitamente a crise para `status = "fim"` e gravar o campo `ended_by`.
   - Garantir que o botão “FIM DE CRISE” aparece e funciona quando a crise está em `crise_em_curso` ou `retorno`.
   - Depois da alteração, invalidar/refrescar os dados da crise para que o badge de estado mude imediatamente para “FIM”.

2. **CRUD das 6 fases deve existir e ser visível**
   - Manter o botão de edição da fase no painel de detalhe à direita, junto ao título da fase.
   - Tornar o CRUD robusto mesmo quando a fase ainda vem do fallback local e ainda não tem `id` na base de dados.
   - No guardar, usar `upsert` por `crisis_id + phase_key` para criar/atualizar a fase sem depender de um `id` já existente.
   - Atualizar a lista de fases depois de guardar para refletir imediatamente as alterações.

3. **Permissões e seed das fases**
   - Confirmar/ajustar via migração as permissões da tabela `crisis_phases` para permitir leitura e edição a utilizadores autenticados.
   - Garantir que crises antigas que ainda não têm as 6 fases gravadas recebem automaticamente as fases padrão.

4. **Validação final**
   - Verificar no código que a fase 6 aciona `status="fim"`.
   - Verificar que o diálogo “Editar Fase” abre, guarda nome/ícone/cor e atualiza o ecrã.
   - Verificar que não há regressão na navegação em duas colunas das fases.