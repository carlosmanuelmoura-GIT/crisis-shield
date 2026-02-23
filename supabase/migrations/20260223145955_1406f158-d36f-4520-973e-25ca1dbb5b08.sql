
ALTER TABLE public.business_processes DROP CONSTRAINT IF EXISTS business_processes_tipo_funcao_check;
ALTER TABLE public.business_processes RENAME COLUMN tipo_funcao TO tipo_funcao_old;
ALTER TABLE public.business_processes ADD COLUMN tipo_funcao TEXT NOT NULL DEFAULT '';
ALTER TABLE public.business_processes ADD COLUMN funcao TEXT NOT NULL DEFAULT '';
ALTER TABLE public.business_processes ADD COLUMN macro_processo TEXT NOT NULL DEFAULT '';
ALTER TABLE public.business_processes ADD COLUMN processo TEXT NOT NULL DEFAULT '';
UPDATE public.business_processes SET tipo_funcao = tipo_funcao_old;
ALTER TABLE public.business_processes DROP COLUMN tipo_funcao_old;
ALTER TABLE public.business_processes DROP COLUMN name_pt;
ALTER TABLE public.business_processes DROP COLUMN name_en;
ALTER TABLE public.business_processes DROP COLUMN description_pt;
ALTER TABLE public.business_processes DROP COLUMN description_en;
