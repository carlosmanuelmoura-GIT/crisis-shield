import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DBProcedureStep {
  id: string;
  procedure_id: string;
  text_pt: string;
  text_en: string;
  sort_order: number;
  checked: boolean;
  created_at: string;
  updated_at: string;
}

export function useProcedureSteps(procedureId?: string) {
  return useQuery({
    queryKey: ["procedure_steps", procedureId],
    enabled: !!procedureId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("procedure_steps" as any)
        .select("*")
        .eq("procedure_id", procedureId!)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as unknown as DBProcedureStep[];
    },
  });
}

export function useAllProcedureStepCounts() {
  return useQuery({
    queryKey: ["procedure_steps", "counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("procedure_steps" as any)
        .select("procedure_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        counts[r.procedure_id] = (counts[r.procedure_id] || 0) + 1;
      });
      return counts;
    },
  });
}

export function useCreateProcedureStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { procedure_id: string; text_pt: string; text_en: string; sort_order: number }) => {
      const { error } = await supabase.from("procedure_steps" as any).insert(data as any);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["procedure_steps", v.procedure_id] });
      qc.invalidateQueries({ queryKey: ["procedure_steps", "counts"] });
    },
  });
}

export function useUpdateProcedureStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, procedure_id, ...data }: { id: string; procedure_id: string; text_pt?: string; text_en?: string; sort_order?: number }) => {
      const { error } = await supabase.from("procedure_steps" as any).update(data as any).eq("id", id);
      if (error) throw error;
      return procedure_id;
    },
    onSuccess: (procedure_id) => qc.invalidateQueries({ queryKey: ["procedure_steps", procedure_id] }),
  });
}

export function useDeleteProcedureStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, procedure_id }: { id: string; procedure_id: string }) => {
      const { error } = await supabase.from("procedure_steps" as any).delete().eq("id", id);
      if (error) throw error;
      return procedure_id;
    },
    onSuccess: (procedure_id) => {
      qc.invalidateQueries({ queryKey: ["procedure_steps", procedure_id] });
      qc.invalidateQueries({ queryKey: ["procedure_steps", "counts"] });
    },
  });
}

export function useToggleProcedureStep() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, checked, procedure_id, procedure_title, step_index, step_text }: {
      id: string; checked: boolean; procedure_id: string; procedure_title: string; step_index: number; step_text: string;
    }) => {
      const { error } = await supabase.from("procedure_steps" as any).update({ checked } as any).eq("id", id);
      if (error) throw error;

      // If there's an active crisis, log to decision_log
      const { data: crises } = await supabase
        .from("crises")
        .select("id,status,crisis_date")
        .in("status", ["em_alerta", "crise_em_curso", "retorno"])
        .order("crisis_date", { ascending: false })
        .limit(1);
      const active = crises && crises[0];
      if (active) {
        await supabase.from("decision_log").insert({
          title: checked ? "✅ Passo executado" : "↩️ Passo revertido",
          text: `[${procedure_title}] Passo ${step_index}: ${step_text}`,
          author: "Sistema",
          owner_id: user?.id,
          crisis_id: (active as any).id,
        } as any);
      }
      return { procedure_id, hadCrisis: !!active };
    },
    onSuccess: ({ procedure_id, hadCrisis }) => {
      qc.invalidateQueries({ queryKey: ["procedure_steps", procedure_id] });
      if (hadCrisis) qc.invalidateQueries({ queryKey: ["decision_log"] });
    },
  });
}
