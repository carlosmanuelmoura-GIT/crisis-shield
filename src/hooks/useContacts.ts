import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Contact {
  id: string;
  owner_id: string | null;
  name: string;
  role_pt: string;
  role_en: string;
  phone: string;
  email: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

type ContactInsert = Omit<Contact, "id" | "owner_id" | "created_at" | "updated_at">;
type ContactUpdate = Partial<ContactInsert> & { id: string };

const TABLE = "contacts" as any;

export const useContacts = () =>
  useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from(TABLE).select("*").order("priority").order("name") as any;
      if (error) throw error;
      return (data ?? []) as Contact[];
    },
  });

export const useInsertContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: ContactInsert) => {
      const { error } = await supabase.from(TABLE).insert(c);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
};

export const useUpdateContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: ContactUpdate) => {
      const { error } = await supabase.from(TABLE).update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
};

export const useDeleteContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
};
