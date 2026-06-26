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
  funcao: string;
  macro_processo: string;
  recurso_id: string | null;
  cenario_id: string | null;
  department_id: string | null;
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
  confirmed_by_department: string;
  confirmed_by_person: string;
  notes: string;
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
    mutationFn: async ({ itemId, checked, confirmed_by_department, confirmed_by_person, notes }: { itemId: string; checked: boolean; confirmed_by_department?: string; confirmed_by_person?: string; notes?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("checklist_state")
        .upsert(
          {
            user_id: user.id,
            checklist_item_id: itemId,
            checked,
            confirmed_by_department: confirmed_by_department || '',
            confirmed_by_person: confirmed_by_person || '',
            notes: notes || '',
          } as any,
          { onConflict: "user_id,checklist_item_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist_state"] }),
  });
}

export function useClearAllChecklistStates() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("checklist_state")
        .update({ checked: false })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist_state"] }),
  });
}

export function useCreateActionCard() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { title_pt: string; title_en: string; severity: string; capability?: string; funcao?: string; macro_processo?: string; recurso_id?: string; cenario_id?: string; department_id?: string }) => {
      const { error } = await supabase.from("action_cards").insert({
        title_pt: data.title_pt,
        title_en: data.title_en,
        severity: data.severity,
        capability: data.capability || null,
        funcao: data.funcao || '',
        macro_processo: data.macro_processo || '',
        recurso_id: data.recurso_id || null,
        cenario_id: data.cenario_id || null,
        department_id: data.department_id || null,
        owner_id: user?.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action_cards"] }),
  });
}

export function useUpdateActionCard() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title_pt: string; title_en: string; severity: string; capability?: string; funcao?: string; macro_processo?: string; recurso_id?: string; cenario_id?: string; department_id?: string }) => {
      const { error } = await supabase.from("action_cards").update({
        title_pt: data.title_pt,
        title_en: data.title_en,
        severity: data.severity,
        capability: data.capability || null,
        funcao: data.funcao || '',
        macro_processo: data.macro_processo || '',
        recurso_id: data.recurso_id || null,
        cenario_id: data.cenario_id || null,
        department_id: data.department_id || null,
      } as any).eq("id", id);
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

export function useUpdateChecklistItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const { error } = await supabase
        .from("checklist_items")
        .update({ text_pt: text, text_en: text })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist_items"] }),
  });
}
