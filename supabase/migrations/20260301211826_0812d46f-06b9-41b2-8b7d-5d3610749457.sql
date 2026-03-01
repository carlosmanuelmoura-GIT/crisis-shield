
-- Create sub_capacidades table linked to recursos
CREATE TABLE public.sub_capacidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recurso_id UUID NOT NULL REFERENCES public.recursos(id) ON DELETE CASCADE,
  name_pt TEXT NOT NULL,
  name_en TEXT NOT NULL DEFAULT '',
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add sub_capacidade_id to action_cards
ALTER TABLE public.action_cards ADD COLUMN sub_capacidade_id UUID REFERENCES public.sub_capacidades(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.sub_capacidades ENABLE ROW LEVEL SECURITY;

-- RLS policies (same pattern as recursos)
CREATE POLICY "Authenticated can view sub_capacidades" ON public.sub_capacidades FOR SELECT USING (true);
CREATE POLICY "Privileged can insert sub_capacidades" ON public.sub_capacidades FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update sub_capacidades" ON public.sub_capacidades FOR UPDATE USING ((auth.uid() = owner_id) OR is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete sub_capacidades" ON public.sub_capacidades FOR DELETE USING (has_role(auth.uid(), 'especialista_gcn'));

-- Trigger for updated_at
CREATE TRIGGER update_sub_capacidades_updated_at BEFORE UPDATE ON public.sub_capacidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
