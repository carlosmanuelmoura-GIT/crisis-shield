
-- Add business_process_id and dr_type_id to bia_processes
ALTER TABLE public.bia_processes
  ADD COLUMN IF NOT EXISTS business_process_id uuid REFERENCES public.business_processes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS dr_type_id uuid REFERENCES public.dr_types(id) ON DELETE SET NULL;
