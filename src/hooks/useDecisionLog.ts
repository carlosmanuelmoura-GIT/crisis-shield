import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DBDecisionLog {
  id: string;
  text: string;
  author: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useDecisionLog() {
  return useQuery({
    queryKey: ["decision_log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decision_log")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DBDecisionLog[];
    },
  });
}

export function useCreateDecisionLog() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { text: string; author: string }) => {
      const { error } = await supabase.from("decision_log").insert({ ...data, owner_id: user?.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decision_log"] }),
  });
}

export function useUpdateDecisionLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; text: string; author: string }) => {
      const { error } = await supabase.from("decision_log").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decision_log"] }),
  });
}

export function useDeleteDecisionLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("decision_log").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decision_log"] }),
  });
}
