
CREATE TABLE public.procedure_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  procedure_id UUID NOT NULL REFERENCES public.procedures(id) ON DELETE CASCADE,
  text_pt TEXT NOT NULL DEFAULT '',
  text_en TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.procedure_steps TO authenticated;
GRANT ALL ON public.procedure_steps TO service_role;

ALTER TABLE public.procedure_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "procedure_steps_auth_select" ON public.procedure_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "procedure_steps_auth_insert" ON public.procedure_steps FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "procedure_steps_auth_update" ON public.procedure_steps FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "procedure_steps_auth_delete" ON public.procedure_steps FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_procedure_steps_updated_at
BEFORE UPDATE ON public.procedure_steps
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Data migration: parse existing content_pt / content_en bullets into rows
WITH pt_lines AS (
  SELECT p.id AS procedure_id,
         trim(regexp_replace(l, '^\s*(?:[-*]|\d+\.)\s+', '')) AS text_pt,
         row_number() OVER (PARTITION BY p.id ORDER BY ord) AS rn
  FROM public.procedures p
  CROSS JOIN LATERAL regexp_split_to_table(COALESCE(p.content_pt, ''), E'\n') WITH ORDINALITY AS s(l, ord)
  WHERE l ~ '^\s*(?:[-*]|\d+\.)\s+\S'
),
en_lines AS (
  SELECT p.id AS procedure_id,
         trim(regexp_replace(l, '^\s*(?:[-*]|\d+\.)\s+', '')) AS text_en,
         row_number() OVER (PARTITION BY p.id ORDER BY ord) AS rn
  FROM public.procedures p
  CROSS JOIN LATERAL regexp_split_to_table(COALESCE(p.content_en, ''), E'\n') WITH ORDINALITY AS s(l, ord)
  WHERE l ~ '^\s*(?:[-*]|\d+\.)\s+\S'
)
INSERT INTO public.procedure_steps (procedure_id, text_pt, text_en, sort_order)
SELECT COALESCE(pt.procedure_id, en.procedure_id),
       COALESCE(pt.text_pt, ''),
       COALESCE(en.text_en, ''),
       COALESCE(pt.rn, en.rn) * 10
FROM pt_lines pt
FULL OUTER JOIN en_lines en
  ON pt.procedure_id = en.procedure_id AND pt.rn = en.rn;
