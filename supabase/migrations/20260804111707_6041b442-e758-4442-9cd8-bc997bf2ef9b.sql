ALTER TABLE public.action_cards ADD COLUMN IF NOT EXISTS dr_type_id uuid REFERENCES public.dr_types(id);

UPDATE public.action_cards ac
SET dr_type_id = sub.dr_type_id
FROM (
  SELECT DISTINCT ON (bac.action_card_id) bac.action_card_id, bp.dr_type_id
  FROM public.bia_action_cards bac
  JOIN public.bia_processes bp ON bp.id = bac.bia_process_id
  WHERE bp.dr_type_id IS NOT NULL
  ORDER BY bac.action_card_id, bac.created_at
) sub
WHERE ac.id = sub.action_card_id AND ac.dr_type_id IS NULL;