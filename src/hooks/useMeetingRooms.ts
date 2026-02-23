import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DBMeetingRoom {
  id: string;
  name: string;
  platform: string;
  url: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useMeetingRooms() {
  return useQuery({
    queryKey: ["meeting_rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meeting_rooms")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as DBMeetingRoom[];
    },
  });
}

export function useCreateMeetingRoom() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { name: string; platform: string; url: string }) => {
      const { error } = await supabase.from("meeting_rooms").insert({ ...data, owner_id: user?.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meeting_rooms"] }),
  });
}

export function useUpdateMeetingRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; platform: string; url: string }) => {
      const { error } = await supabase.from("meeting_rooms").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meeting_rooms"] }),
  });
}

export function useDeleteMeetingRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("meeting_rooms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meeting_rooms"] }),
  });
}
