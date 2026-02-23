import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DBDecisionLog {
  id: string;
  title: string;
  text: string;
  author: string;
  owner_id: string | null;
  crisis_started_at: string | null;
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
    mutationFn: async (data: { title?: string; text: string; author: string; crisis_started_at?: string | null }) => {
      const { error } = await supabase.from("decision_log").insert({
        title: data.title || "",
        text: data.text,
        author: data.author,
        owner_id: user?.id,
        crisis_started_at: data.crisis_started_at || null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decision_log"] }),
  });
}

export function useUpdateDecisionLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; text: string; author: string }) => {
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
