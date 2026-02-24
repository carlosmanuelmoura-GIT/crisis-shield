
-- Add funcao and macro_processo text columns to action_cards
ALTER TABLE public.action_cards ADD COLUMN funcao text NOT NULL DEFAULT '';
ALTER TABLE public.action_cards ADD COLUMN macro_processo text NOT NULL DEFAULT '';

-- Migrate existing data from business_process_id to the new columns
UPDATE public.action_cards ac
SET funcao = bp.funcao, macro_processo = bp.macro_processo
FROM public.business_processes bp
WHERE ac.business_process_id = bp.id;

-- Drop the business_process_id FK column
ALTER TABLE public.action_cards DROP COLUMN business_process_id;
