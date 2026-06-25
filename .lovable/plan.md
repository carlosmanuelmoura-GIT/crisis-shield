## Igualar diálogo de edição de Recursos no Back Office ao da Gestão de Crise

O diálogo da Gestão de Crise (`ScenariosSection.tsx`) tem mais campos do que o do Back Office. Vamos alinhar os dois.

### Alterações em `src/components/sections/BackOfficeSection.tsx`

Atualizar o estado e o diálogo dos Recursos para incluir os mesmos campos do `ScenariosSection`:

- **Estado `recForm`**: passar a incluir `name_pt`, `name_en`, `description_pt`, `description_en`, `icon` (em vez dos atuais 3 campos).
- **`openCreateRec` / `openEditRec`**: inicializar todos os campos (icon default `"Monitor"`).
- **Diálogo (`recDialog`)**:
  - Largura `max-w-2xl` (como na Gestão de Crise).
  - Grelha de 2 colunas em `md`.
  - Campos: Nome PT, Nome EN, Ícone (select com a mesma `iconMap`: Server, Building2, Users, Truck, MapPin, ShieldAlert, Monitor, Home, UserCheck, Network, Zap), Descrição PT (Textarea, 3 linhas), Descrição EN (Textarea, 3 linhas).
  - Rodapé com botões "Cancelar" + "Guardar".
- Adicionar imports necessários (`Textarea`, ícones para o `iconMap`).
- Sem alterações de BD nem de hooks (o `useUpdateRecurso` já aceita estes campos).
