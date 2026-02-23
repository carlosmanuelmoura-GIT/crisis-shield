
-- Create business_processes table
CREATE TABLE public.business_processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_pt TEXT NOT NULL,
  name_en TEXT NOT NULL DEFAULT '',
  description_pt TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_processes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated can view business_processes"
  ON public.business_processes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Privileged can insert business_processes"
  ON public.business_processes FOR INSERT
  TO authenticated WITH CHECK (is_privileged(auth.uid()));

CREATE POLICY "Owner or privileged can update business_processes"
  ON public.business_processes FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id OR is_privileged(auth.uid()));

CREATE POLICY "Especialista can delete business_processes"
  ON public.business_processes FOR DELETE
  TO authenticated USING (has_role(auth.uid(), 'especialista_gcn'));

-- Add business_process_id to action_cards
ALTER TABLE public.action_cards
  ADD COLUMN business_process_id UUID REFERENCES public.business_processes(id) ON DELETE SET NULL;

-- Trigger for updated_at
CREATE TRIGGER update_business_processes_updated_at
  BEFORE UPDATE ON public.business_processes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
