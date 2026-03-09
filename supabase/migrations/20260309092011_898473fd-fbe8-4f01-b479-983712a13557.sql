ALTER TABLE public.crisis_phase_actions 
ADD COLUMN info_department TEXT NOT NULL DEFAULT '',
ADD COLUMN info_person TEXT NOT NULL DEFAULT '',
ADD COLUMN notes TEXT NOT NULL DEFAULT '';