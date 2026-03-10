
-- Document categories reference table
CREATE TABLE public.document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_pt text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view document_categories" ON public.document_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged can insert document_categories" ON public.document_categories FOR INSERT TO authenticated WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update document_categories" ON public.document_categories FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete document_categories" ON public.document_categories FOR DELETE TO authenticated USING (has_role(auth.uid(), 'especialista_gcn'));

-- Document files table
CREATE TABLE public.document_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.document_categories(id) ON DELETE CASCADE,
  file_name text NOT NULL DEFAULT '',
  file_path text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view document_files" ON public.document_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged can insert document_files" ON public.document_files FOR INSERT TO authenticated WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Privileged can update document_files" ON public.document_files FOR UPDATE TO authenticated USING (is_privileged(auth.uid()));
CREATE POLICY "Privileged can delete document_files" ON public.document_files FOR DELETE TO authenticated USING (is_privileged(auth.uid()));

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

-- Storage RLS
CREATE POLICY "Authenticated can upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Anyone can view documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Privileged can delete documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents' AND is_privileged(auth.uid()));

-- Seed with current sidebar items
INSERT INTO public.document_categories (name_pt, name_en, sort_order) VALUES
  ('Política GCN', 'BCM Policy', 1),
  ('Procedimentos Normalidade e Alerta', 'Normal & Alert Procedures', 2),
  ('Glossário GCN', 'BCM Glossary', 3),
  ('Manual BIA', 'BIA Manual', 4),
  ('Planos de Continuidade de Negócio', 'Business Continuity Plans', 5),
  ('Plano de Gestão de Crise', 'Crisis Management Plan', 6),
  ('Plano Recuperação Tecnológica (DSI)', 'Tech Recovery Plan (DSI)', 7),
  ('Plano Emergência Interno (DLI)', 'Internal Emergency Plan (DLI)', 8),
  ('Plano Recursos Humanos (DPE)', 'HR Plan (DPE)', 9),
  ('Complexo do Carregado', 'Carregado Complex', 10),
  ('Acessos autorizados', 'Authorized Access', 11),
  ('Lugares por departamentos', 'Seats by Department', 12),
  ('Guia Prático Concur', 'Concur Guide', 13),
  ('Procedimento BOLT', 'BOLT Procedure', 14);
