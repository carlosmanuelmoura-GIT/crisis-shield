ALTER TABLE public.checklist_state 
ADD COLUMN confirmed_by_department text NOT NULL DEFAULT '',
ADD COLUMN confirmed_by_person text NOT NULL DEFAULT '',
ADD COLUMN notes text NOT NULL DEFAULT '';