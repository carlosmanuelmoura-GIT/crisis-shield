export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      action_cards: {
        Row: {
          business_process_id: string | null
          capability: string | null
          created_at: string
          id: string
          owner_id: string | null
          severity: string
          title_en: string
          title_pt: string
          updated_at: string
        }
        Insert: {
          business_process_id?: string | null
          capability?: string | null
          created_at?: string
          id?: string
          owner_id?: string | null
          severity?: string
          title_en?: string
          title_pt: string
          updated_at?: string
        }
        Update: {
          business_process_id?: string | null
          capability?: string | null
          created_at?: string
          id?: string
          owner_id?: string | null
          severity?: string
          title_en?: string
          title_pt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_cards_business_process_id_fkey"
            columns: ["business_process_id"]
            isOneToOne: false
            referencedRelation: "business_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      bia_processes: {
        Row: {
          created_at: string
          criticality: string
          dependencies: string[]
          id: string
          name_en: string
          name_pt: string
          owner_id: string | null
          rpo: number
          rto: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          criticality?: string
          dependencies?: string[]
          id?: string
          name_en?: string
          name_pt: string
          owner_id?: string | null
          rpo?: number
          rto?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          criticality?: string
          dependencies?: string[]
          id?: string
          name_en?: string
          name_pt?: string
          owner_id?: string | null
          rpo?: number
          rto?: number
          updated_at?: string
        }
        Relationships: []
      }
      business_processes: {
        Row: {
          created_at: string
          funcao: string
          id: string
          macro_processo: string
          owner_id: string | null
          processo: string
          tipo_funcao: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          funcao?: string
          id?: string
          macro_processo?: string
          owner_id?: string | null
          processo?: string
          tipo_funcao?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          funcao?: string
          id?: string
          macro_processo?: string
          owner_id?: string | null
          processo?: string
          tipo_funcao?: string
          updated_at?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          action_card_id: string
          created_at: string
          id: string
          sort_order: number
          text_en: string
          text_pt: string
        }
        Insert: {
          action_card_id: string
          created_at?: string
          id?: string
          sort_order?: number
          text_en?: string
          text_pt: string
        }
        Update: {
          action_card_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          text_en?: string
          text_pt?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_action_card_id_fkey"
            columns: ["action_card_id"]
            isOneToOne: false
            referencedRelation: "action_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_state: {
        Row: {
          checked: boolean
          checklist_item_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checked?: boolean
          checklist_item_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checked?: boolean
          checklist_item_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_state_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_log: {
        Row: {
          author: string
          created_at: string
          id: string
          owner_id: string | null
          text: string
          updated_at: string
        }
        Insert: {
          author?: string
          created_at?: string
          id?: string
          owner_id?: string | null
          text: string
          updated_at?: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          owner_id?: string | null
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      meeting_rooms: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string | null
          platform: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          platform?: string
          updated_at?: string
          url?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          platform?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      procedures: {
        Row: {
          category_en: string
          category_pt: string
          content_en: string
          content_pt: string
          created_at: string
          id: string
          owner_id: string | null
          title_en: string
          title_pt: string
          updated_at: string
        }
        Insert: {
          category_en?: string
          category_pt?: string
          content_en?: string
          content_pt?: string
          created_at?: string
          id?: string
          owner_id?: string | null
          title_en?: string
          title_pt: string
          updated_at?: string
        }
        Update: {
          category_en?: string
          category_pt?: string
          content_en?: string
          content_pt?: string
          created_at?: string
          id?: string
          owner_id?: string | null
          title_en?: string
          title_pt?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_privileged: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "steering_gcn" | "tecnico_departamento" | "especialista_gcn"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["steering_gcn", "tecnico_departamento", "especialista_gcn"],
    },
  },
} as const
