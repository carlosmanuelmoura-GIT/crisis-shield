import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DBCrisisPhase {
  id: string;
  crisis_id: string;
  phase_key: string;
  label_pt: string;
  label_en: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_PHASES: Omit<DBCrisisPhase, "id" | "crisis_id" | "created_at" | "updated_at">[] = [
  { phase_key: "alerta",         label_pt: "ALERTA & CONTENÇÃO",      label_en: "ALERT & CONTAINMENT",   icon: "🔔", color: "border-alert bg-alert/10",         sort_order: 0 },
  { phase_key: "declaracao",     label_pt: "DECLARAÇÃO DE CRISE",     label_en: "CRISIS DECLARATION",    icon: "🚨", color: "border-crisis bg-crisis/10",       sort_order: 1 },
  { phase_key: "ativacao",       label_pt: "ATIVAÇÃO & RECUPERAÇÃO",  label_en: "ACTIVATION & RECOVERY", icon: "⚡", color: "border-primary bg-primary/10",     sort_order: 2 },
  { phase_key: "retorno-inicio", label_pt: "INÍCIO DE RETORNO",       label_en: "RETURN START",          icon: "🔄", color: "border-accent bg-accent/10",       sort_order: 3 },
  { phase_key: "retorno-fim",    label_pt: "RETORNO E FIM DE CRISE",  label_en: "RETURN & END OF CRISIS",icon: "📋", color: "border-secondary bg-secondary/10", sort_order: 4 },
  { phase_key: "fim",            label_pt: "FIM DE CRISE",            label_en: "END OF CRISIS",         icon: "✅", color: "border-green-500 bg-green-500/10", sort_order: 5 },
];

export function useCrisisPhases(crisisId?: string) {
  return useQuery({
    queryKey: ["crisis_phases", crisisId],
    enabled: !!crisisId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crisis_phases" as any)
        .select("*")
        .eq("crisis_id", crisisId!)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as unknown as DBCrisisPhase[];
    },
  });
}

export function useUpdateCrisisPhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, crisis_id, ...data }: { id: string; crisis_id: string; label_pt?: string; label_en?: string; icon?: string; color?: string; sort_order?: number }) => {
      const { error } = await supabase.from("crisis_phases" as any).update(data as any).eq("id", id);
      if (error) throw error;
      return crisis_id;
    },
    onSuccess: (crisis_id) => qc.invalidateQueries({ queryKey: ["crisis_phases", crisis_id] }),
  });
}

export async function seedPhasesForCrisis(crisisId: string) {
  const rows = DEFAULT_PHASES.map((p) => ({ crisis_id: crisisId, ...p }));
  const { error } = await supabase.from("crisis_phases" as any).insert(rows as any);
  if (error && !String(error.message).includes("duplicate")) throw error;
}
