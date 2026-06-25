import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DBBIAActionCard {
  id: string;
  bia_process_id: string;
  action_card_id: string;
  created_at: string;
}

export function useBIAActionCards() {
  return useQuery({
    queryKey: ["bia_action_cards"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bia_action_cards").select("*");
      if (error) throw error;
      return data as DBBIAActionCard[];
    },
  });
}

export function useLinkBIAActionCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { bia_process_id: string; action_card_id: string }) => {
      const { error } = await supabase.from("bia_action_cards").insert(data);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bia_action_cards"] }),
  });
}

export function useUnlinkBIAActionCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bia_action_cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bia_action_cards"] }),
  });
}
