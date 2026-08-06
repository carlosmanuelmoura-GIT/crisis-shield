# Painéis de detalhe dos Action Cards: abrir ao centro e maior

## Objetivo
Nos Action Cards departamentais e na Gestão de Crise, o painel de detalhe que hoje abre deslizando da direita deve passar a abrir **centrado no ecrã** e com **maior largura**, para aproveitar melhor o espaço disponível.

## Estado atual
- `src/components/sections/EmergencySection.tsx` usa `Sheet` + `SheetContent side="right"` com `sm:max-w-[520px]` para o detalhe do Action Card departamental.
- `src/components/sections/ProceduresSection.tsx` usa `Sheet` + `SheetContent side="right"` com `sm:max-w-xl` para o detalhe do Action Card de gestão de crise.

## Alterações propostas
1. **Substituir `Sheet` por `Dialog`** em ambos os componentes, aproveitando o posicionamento centrado nativo do componente `Dialog` do shadcn/ui.
2. **Aumentar a largura** do conteúdo para aproximadamente `max-w-4xl` (ou equivalente), mantendo margens responsivas em ecrãs pequenos.
3. **Manter o conteúdo interno intacto**: cabeçalho, badges, listas de BIAs/passos, botões de ação, scroll interno e botão de fecho.
4. **Ajustar classes de scroll/overflow** se necessário, porque o `DialogContent` tem comportamento de overflow diferente do `SheetContent`.
5. **Garantir fecho** por botão X, clique fora e tecla ESC, reutilizando os estados `selectedCardId` e `detailId` existentes.

## Ficheiros afetados
- `src/components/sections/EmergencySection.tsx`
- `src/components/sections/ProceduresSection.tsx`

## Validação
- Compilar a aplicação sem erros.
- Abrir o detalhe de um Action Card departamental e confirmar que o painel aparece centrado e maior.
- Abrir o detalhe de um Action Card de gestão de crise e confirmar o mesmo comportamento.
- Verificar que o scroll, os botões e o fecho funcionam corretamente.
