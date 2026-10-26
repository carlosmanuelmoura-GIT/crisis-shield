CREATE TABLE public.action_card_cenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_card_id uuid NOT NULL REFERENCES public.action_cards(id) ON DELETE CASCADE,
  cenario_id uuid NOT NULL REFERENCES public.cenarios(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (action_card_id, cenario_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.action_card_cenarios TO authenticated;
GRANT ALL ON public.action_card_cenarios TO service_role;
ALTER TABLE public.action_card_cenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth select acc" ON public.action_card_cenarios FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth insert acc" ON public.action_card_cenarios FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth delete acc" ON public.action_card_cenarios FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
INSERT INTO public.action_card_cenarios (action_card_id, cenario_id)
SELECT id, cenario_id FROM public.action_cards WHERE cenario_id IS NOT NULL ON CONFLICT DO NOTHING;
COMMENT ON COLUMN public.action_cards.recurso_id IS 'DEPRECATED: action cards no longer linked to failure type';
COMMENT ON COLUMN public.action_cards.dr_type_id IS 'DEPRECATED: action cards no longer linked to DR type';
COMMENT ON COLUMN public.action_cards.cenario_id IS 'DEPRECATED: replaced by action_card_cenarios';