
-- 1) Action Cards: drop sub_capacidade_id, add cenario_id
ALTER TABLE public.action_cards DROP CONSTRAINT IF EXISTS action_cards_sub_capacidade_id_fkey;
ALTER TABLE public.action_cards DROP COLUMN IF EXISTS sub_capacidade_id;
ALTER TABLE public.action_cards ADD COLUMN IF NOT EXISTS cenario_id uuid REFERENCES public.cenarios(id) ON DELETE SET NULL;

-- 2) BIA <-> Action Cards junction
CREATE TABLE IF NOT EXISTS public.bia_action_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bia_process_id uuid NOT NULL REFERENCES public.bia_processes(id) ON DELETE CASCADE,
  action_card_id uuid NOT NULL REFERENCES public.action_cards(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bia_process_id, action_card_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bia_action_cards TO authenticated;
GRANT ALL ON public.bia_action_cards TO service_role;

ALTER TABLE public.bia_action_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view bia_action_cards"
  ON public.bia_action_cards FOR SELECT TO authenticated USING (true);

CREATE POLICY "Privileged can insert bia_action_cards"
  ON public.bia_action_cards FOR INSERT TO authenticated
  WITH CHECK (public.is_privileged(auth.uid()));

CREATE POLICY "Privileged can delete bia_action_cards"
  ON public.bia_action_cards FOR DELETE TO authenticated
  USING (public.is_privileged(auth.uid()));

-- 3) Allow privileged users (not only especialista) to delete checklist items
DROP POLICY IF EXISTS "Especialista can delete checklist items" ON public.checklist_items;
CREATE POLICY "Privileged can delete checklist items"
  ON public.checklist_items FOR DELETE TO authenticated
  USING (public.is_privileged(auth.uid()));
