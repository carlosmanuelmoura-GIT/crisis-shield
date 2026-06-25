
ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS has_cc BOOLEAN NOT NULL DEFAULT false;

-- Preenche code dos existentes pelo prefixo antes do '-'
UPDATE public.departments
SET code = UPPER(TRIM(SPLIT_PART(name, '-', 1)))
WHERE code IS NULL AND name LIKE '%-%';

-- Fallback para qualquer existente sem '-': usa primeiras 3 letras maiúsculas do nome
UPDATE public.departments
SET code = UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^A-Za-z]', '', 'g'), 1, 3))
WHERE code IS NULL;

-- Drop partial index criado antes, se existir
DROP INDEX IF EXISTS public.departments_code_unique;

-- Unique constraint real (necessária para ON CONFLICT)
ALTER TABLE public.departments
  ADD CONSTRAINT departments_code_key UNIQUE (code);

-- Seed dos 22 departamentos sem duplicar
INSERT INTO public.departments (code, name, has_cc) VALUES
  ('DAS', 'Departamento de Auditoria e Supervisão', false),
  ('DAU', 'Departamento de Auditoria', false),
  ('DCC', 'Departamento de Contabilidade e Controlo', false),
  ('DCM', 'Departamento de Comunicação', false),
  ('DCR', 'Departamento de Controlo de Risco', true),
  ('DDE', 'Departamento de Desenvolvimento Económico', false),
  ('DEE', 'Departamento de Estudos Económicos', false),
  ('DES', 'Departamento de Estatística', false),
  ('DET', 'Departamento de Estabilidade', false),
  ('DJU', 'Departamento Jurídico', false),
  ('DMR', 'Departamento de Mercados e Reservas', true),
  ('DPE', 'Departamento de Pessoas', false),
  ('DPG', 'Departamento de Pagamentos', true),
  ('DRE', 'Departamento de Relações Internacionais', false),
  ('DLI', 'Departamento de Logística e Instalações', false),
  ('DSC', 'Departamento de Supervisão Comportamental', false),
  ('DSI', 'Departamento de Sistemas de Informação', true),
  ('DSP', 'Departamento de Supervisão Prudencial', false),
  ('GAB', 'Gabinete', false),
  ('GPD', 'Gabinete de Planeamento e Design', false),
  ('SEC', 'Secretariado', false),
  ('SECDRC', 'Secretariado - DRC', false)
ON CONFLICT (code) DO NOTHING;

UPDATE public.departments SET has_cc = true WHERE code IN ('DCR','DMR','DPG','DSI');
