CREATE OR REPLACE FUNCTION public.clear_checklist_state_on_crisis_end()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'fim' AND (OLD.status IS NULL OR OLD.status <> 'fim') THEN
    DELETE FROM public.checklist_state;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER clear_checklist_state_on_crisis_end
AFTER UPDATE ON public.crises
FOR EACH ROW
EXECUTE FUNCTION public.clear_checklist_state_on_crisis_end();

GRANT EXECUTE ON FUNCTION public.clear_checklist_state_on_crisis_end() TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_checklist_state_on_crisis_end() TO service_role;