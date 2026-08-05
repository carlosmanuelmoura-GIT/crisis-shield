import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Building {
  id: string;
  name: string;
  tier: string | null;
  autonomia_horas_contingencia: number | null;
  depositos: string | null;
  combustivel_litros: number | null;
  num_geradores: number | null;
  num_ups: number | null;
  observacoes: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export type BuildingInput = {
  name: string;
  tier?: string | null;
  autonomia_horas_contingencia?: number | null;
  depositos?: string | null;
  combustivel_litros?: number | null;
  num_geradores?: number | null;
  num_ups?: number | null;
  observacoes?: string | null;
};


export function useBuildings() {
  return useQuery({
    queryKey: ["buildings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("buildings").select("*").order("name");
      if (error) throw error;
      return data as Building[];
    },
  });
}

export function useCreateBuilding() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: BuildingInput) => {
      const { error } = await supabase.from("buildings").insert({ ...input, owner_id: user?.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buildings"] }),
  });
}

export function useUpdateBuilding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & BuildingInput) => {
      const { error } = await supabase.from("buildings").update(input).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buildings"] }),
  });
}

export function useDeleteBuilding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("buildings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buildings"] }),
  });
}
