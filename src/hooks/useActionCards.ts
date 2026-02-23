import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DBActionCard {
  id: string;
  owner_id: string | null;
  title_pt: string;
  title_en: string;
  severity: string;
  capability: string | null;
  business_process_id: string | null;
  recurso_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBChecklistItem {
  id: string;
  action_card_id: string;
  text_pt: string;
  text_en: string;
  sort_order: number;
}

export interface DBChecklistState {
  id: string;
  checklist_item_id: string;
  checked: boolean;
}

export function useActionCards() {
  return useQuery({
    queryKey: ["action_cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("action_cards")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data as DBActionCard[];
    },
  });
}

export function useChecklistItems(cardId?: string) {
  return useQuery({
    queryKey: ["checklist_items", cardId],
    queryFn: async () => {
      let q = supabase.from("checklist_items").select("*").order("sort_order");
      if (cardId) q = q.eq("action_card_id", cardId);
      const { data, error } = await q;
      if (error) throw error;
      return data as DBChecklistItem[];
    },
  });
}

export function useChecklistStates() {
  return useQuery({
    queryKey: ["checklist_state"],
    queryFn: async () => {
      const { data, error } = await supabase.from("checklist_state").select("*");
      if (error) throw error;
      return data as DBChecklistState[];
    },
  });
}

export function useToggleChecklistState() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ itemId, checked }: { itemId: string; checked: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("checklist_state")
        .upsert(
          { user_id: user.id, checklist_item_id: itemId, checked },
          { onConflict: "user_id,checklist_item_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist_state"] }),
  });
}

export function useCreateActionCard() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { title_pt: string; title_en: string; severity: string; capability?: string; business_process_id?: string; recurso_id?: string }) => {
      const { error } = await supabase.from("action_cards").insert({
        ...data,
        owner_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action_cards"] }),
  });
}

export function useUpdateActionCard() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title_pt: string; title_en: string; severity: string; capability?: string; business_process_id?: string; recurso_id?: string }) => {
      const { error } = await supabase.from("action_cards").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action_cards"] }),
  });
}

export function useDeleteActionCard() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("action_cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action_cards"] }),
  });
}

export function useCreateChecklistItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: { action_card_id: string; text_pt: string; text_en: string; sort_order: number }) => {
      const { error } = await supabase.from("checklist_items").insert(data);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist_items"] }),
  });
}

export function useDeleteChecklistItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("checklist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist_items"] }),
  });
}
