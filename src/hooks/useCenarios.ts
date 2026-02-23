import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DBCenario {
  id: string;
  roman: string;
  name_pt: string;
  name_en: string;
  description_pt: string;
  description_en: string;
  color: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBCenarioRecurso {
  id: string;
  cenario_id: string;
  recurso_id: string;
  created_at: string;
}

export function useCenarios() {
  return useQuery({
    queryKey: ["cenarios"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cenarios").select("*").order("roman");
      if (error) throw error;
      return data as DBCenario[];
    },
  });
}

export function useCreateCenario() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { roman?: string; name_pt: string; name_en?: string; description_pt?: string; description_en?: string; color?: string }) => {
      const { error } = await supabase.from("cenarios").insert({ ...data, owner_id: user?.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cenarios"] }),
  });
}

export function useUpdateCenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; roman?: string; name_pt: string; name_en?: string; description_pt?: string; description_en?: string; color?: string }) => {
      const { error } = await supabase.from("cenarios").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cenarios"] }),
  });
}

export function useDeleteCenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cenarios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cenarios"] }),
  });
}

export function useCenarioRecursos() {
  return useQuery({
    queryKey: ["cenario_recursos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cenario_recursos").select("*");
      if (error) throw error;
      return data as DBCenarioRecurso[];
    },
  });
}

export function useLinkCenarioRecurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { cenario_id: string; recurso_id: string }) => {
      const { error } = await supabase.from("cenario_recursos").insert(data);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cenario_recursos"] }),
  });
}

export function useUnlinkCenarioRecurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cenario_recursos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cenario_recursos"] }),
  });
}
