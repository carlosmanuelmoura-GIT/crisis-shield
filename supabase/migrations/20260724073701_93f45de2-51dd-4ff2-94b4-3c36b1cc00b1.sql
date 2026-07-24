CREATE OR REPLACE FUNCTION public.clear_checklist_state_on_crisis_end()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'fim' AND (OLD.status IS NULL OR OLD.status <> 'fim') THEN
    DELETE FROM public.checklist_state WHERE id IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$function$;