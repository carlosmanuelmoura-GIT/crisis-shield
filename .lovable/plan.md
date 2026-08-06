# Verificação: scroll e botão de fechar nos detalhes de Action Cards

## Objetivo
Confirmar que os novos painéis de detalhe dos Action Cards (Departamentos e Gestão de Crise) têm scroll ativo e que o botão de fechar é apenas o ícone de cruz, sem texto.

## Estado atual confirmado
- **Scroll**: ambos os dialogs já usam scroll interno:
  - `EmergencySection.tsx`: `<ScrollArea className="flex-1">` dentro do `DialogContent`.
  - `ProceduresSection.tsx`: `<div className="flex-1 overflow-y-auto">` dentro do `DialogContent`.
- **Botão de fechar**: cada dialog tem um botão customizado no header com apenas `<X />`, mas o componente base `DialogContent` do shadcn/ui também injeta um botão de fechar padrão no canto superior direito.

## Ajustes a fazer
1. Remover os botões de fechar customizados dos headers de `EmergencySection.tsx` e `ProceduresSection.tsx`.
2. Usar unicamente o botão de fechar padrão do `DialogContent` (apenas o ícone `X`).
3. No dialog de `EmergencySection.tsx`, ajustar a cor do botão padrão para contrastar com o header escuro (`bg-slate-900`), garantindo que a cruz seja visível.
4. Validar visualmente que:
   - O scroll funciona quando o conteúdo excede a altura do dialog.
   - Apenas uma cruz de fechar é apresentada em cada dialog.

## Ficheiros afetados
- `src/components/sections/EmergencySection.tsx`
- `src/components/sections/ProceduresSection.tsx`
- `src/components/ui/dialog.tsx` (apenas leitura/validação, sem alterações esperadas)
