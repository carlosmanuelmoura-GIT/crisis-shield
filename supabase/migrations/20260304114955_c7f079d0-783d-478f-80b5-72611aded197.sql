
-- Create departments table
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  owner_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged can insert departments" ON public.departments FOR INSERT TO authenticated WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update departments" ON public.departments FOR UPDATE TO authenticated USING ((auth.uid() = owner_id) OR is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete departments" ON public.departments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'especialista_gcn'::app_role));

-- Add department_id to action_cards
ALTER TABLE public.action_cards ADD COLUMN department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL;
