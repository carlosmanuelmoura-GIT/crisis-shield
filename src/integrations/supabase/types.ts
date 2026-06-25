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
          capability: string | null
          cenario_id: string | null
          created_at: string
          department_id: string | null
          funcao: string
          id: string
          macro_processo: string
          owner_id: string | null
          recurso_id: string | null
          severity: string
          title_en: string
          title_pt: string
          updated_at: string
        }
        Insert: {
          capability?: string | null
          cenario_id?: string | null
          created_at?: string
          department_id?: string | null
          funcao?: string
          id?: string
          macro_processo?: string
          owner_id?: string | null
          recurso_id?: string | null
          severity?: string
          title_en?: string
          title_pt: string
          updated_at?: string
        }
        Update: {
          capability?: string | null
          cenario_id?: string | null
          created_at?: string
          department_id?: string | null
          funcao?: string
          id?: string
          macro_processo?: string
          owner_id?: string | null
          recurso_id?: string | null
          severity?: string
          title_en?: string
          title_pt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_cards_cenario_id_fkey"
            columns: ["cenario_id"]
            isOneToOne: false
            referencedRelation: "cenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_cards_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_cards_recurso_id_fkey"
            columns: ["recurso_id"]
            isOneToOne: false
            referencedRelation: "recursos"
            referencedColumns: ["id"]
          },
        ]
      }
      bia_action_cards: {
        Row: {
          action_card_id: string
          bia_process_id: string
          created_at: string
          id: string
        }
        Insert: {
          action_card_id: string
          bia_process_id: string
          created_at?: string
          id?: string
        }
        Update: {
          action_card_id?: string
          bia_process_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bia_action_cards_action_card_id_fkey"
            columns: ["action_card_id"]
            isOneToOne: false
            referencedRelation: "action_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bia_action_cards_bia_process_id_fkey"
            columns: ["bia_process_id"]
            isOneToOne: false
            referencedRelation: "bia_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      bia_process_platforms: {
        Row: {
          bia_process_id: string
          created_at: string
          id: string
          platform_id: string
        }
        Insert: {
          bia_process_id: string
          created_at?: string
          id?: string
          platform_id: string
        }
        Update: {
          bia_process_id?: string
          created_at?: string
          id?: string
          platform_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bia_process_platforms_bia_process_id_fkey"
            columns: ["bia_process_id"]
            isOneToOne: false
            referencedRelation: "bia_processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bia_process_platforms_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "cmdb_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      bia_processes: {
        Row: {
          business_process_id: string | null
          created_at: string
          criticality: string
          dependencies: string[]
          dr_type_id: string | null
          id: string
          name_en: string
          name_pt: string
          owner_id: string | null
          rpo: number
          rto: number
          updated_at: string
        }
        Insert: {
          business_process_id?: string | null
          created_at?: string
          criticality?: string
          dependencies?: string[]
          dr_type_id?: string | null
          id?: string
          name_en?: string
          name_pt: string
          owner_id?: string | null
          rpo?: number
          rto?: number
          updated_at?: string
        }
        Update: {
          business_process_id?: string | null
          created_at?: string
          criticality?: string
          dependencies?: string[]
          dr_type_id?: string | null
          id?: string
          name_en?: string
          name_pt?: string
          owner_id?: string | null
          rpo?: number
          rto?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bia_processes_business_process_id_fkey"
            columns: ["business_process_id"]
            isOneToOne: false
            referencedRelation: "business_processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bia_processes_dr_type_id_fkey"
            columns: ["dr_type_id"]
            isOneToOne: false
            referencedRelation: "dr_types"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
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
      cenario_recursos: {
        Row: {
          cenario_id: string
          created_at: string
          id: string
          recurso_id: string
        }
        Insert: {
          cenario_id: string
          created_at?: string
          id?: string
          recurso_id: string
        }
        Update: {
          cenario_id?: string
          created_at?: string
          id?: string
          recurso_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cenario_recursos_cenario_id_fkey"
            columns: ["cenario_id"]
            isOneToOne: false
            referencedRelation: "cenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cenario_recursos_recurso_id_fkey"
            columns: ["recurso_id"]
            isOneToOne: false
            referencedRelation: "recursos"
            referencedColumns: ["id"]
          },
        ]
      }
      cenarios: {
        Row: {
          color: string
          created_at: string
          description_en: string
          description_pt: string
          id: string
          name_en: string
          name_pt: string
          owner_id: string | null
          roman: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description_en?: string
          description_pt?: string
          id?: string
          name_en?: string
          name_pt: string
          owner_id?: string | null
          roman?: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description_en?: string
          description_pt?: string
          id?: string
          name_en?: string
          name_pt?: string
          owner_id?: string | null
          roman?: string
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
          confirmed_by_department: string
          confirmed_by_person: string
          id: string
          notes: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checked?: boolean
          checklist_item_id: string
          confirmed_by_department?: string
          confirmed_by_person?: string
          id?: string
          notes?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checked?: boolean
          checklist_item_id?: string
          confirmed_by_department?: string
          confirmed_by_person?: string
          id?: string
          notes?: string
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
      cmdb_platforms: {
        Row: {
          created_at: string
          dr_type_id: string | null
          id: string
          name: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dr_type_id?: string | null
          id?: string
          name: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dr_type_id?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cmdb_platforms_dr_type_id_fkey"
            columns: ["dr_type_id"]
            isOneToOne: false
            referencedRelation: "dr_types"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          owner_id: string | null
          phone: string
          priority: string
          role_en: string
          role_pt: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          name: string
          owner_id?: string | null
          phone?: string
          priority?: string
          role_en?: string
          role_pt?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          owner_id?: string | null
          phone?: string
          priority?: string
          role_en?: string
          role_pt?: string
          updated_at?: string
        }
        Relationships: []
      }
      crises: {
        Row: {
          cloned_from_id: string | null
          created_at: string
          crisis_date: string
          crisis_type: string
          declared_by: string
          ended_by: string
          id: string
          owner_id: string | null
          status: Database["public"]["Enums"]["crisis_status"]
          title: string
          updated_at: string
        }
        Insert: {
          cloned_from_id?: string | null
          created_at?: string
          crisis_date?: string
          crisis_type?: string
          declared_by?: string
          ended_by?: string
          id?: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["crisis_status"]
          title: string
          updated_at?: string
        }
        Update: {
          cloned_from_id?: string | null
          created_at?: string
          crisis_date?: string
          crisis_type?: string
          declared_by?: string
          ended_by?: string
          id?: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["crisis_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crises_cloned_from_id_fkey"
            columns: ["cloned_from_id"]
            isOneToOne: false
            referencedRelation: "crises"
            referencedColumns: ["id"]
          },
        ]
      }
      crisis_cabinet_members: {
        Row: {
          created_at: string
          crisis_id: string
          id: string
          name: string
          role: string
        }
        Insert: {
          created_at?: string
          crisis_id: string
          id?: string
          name: string
          role?: string
        }
        Update: {
          created_at?: string
          crisis_id?: string
          id?: string
          name?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "crisis_cabinet_members_crisis_id_fkey"
            columns: ["crisis_id"]
            isOneToOne: false
            referencedRelation: "crises"
            referencedColumns: ["id"]
          },
        ]
      }
      crisis_phase_actions: {
        Row: {
          checked: boolean
          created_at: string
          crisis_id: string
          id: string
          info_department: string
          info_person: string
          notes: string
          phase_id: string
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          checked?: boolean
          created_at?: string
          crisis_id: string
          id?: string
          info_department?: string
          info_person?: string
          notes?: string
          phase_id: string
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          checked?: boolean
          created_at?: string
          crisis_id?: string
          id?: string
          info_department?: string
          info_person?: string
          notes?: string
          phase_id?: string
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crisis_phase_actions_crisis_id_fkey"
            columns: ["crisis_id"]
            isOneToOne: false
            referencedRelation: "crises"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_log: {
        Row: {
          author: string
          created_at: string
          crisis_id: string | null
          crisis_started_at: string | null
          id: string
          owner_id: string | null
          text: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          created_at?: string
          crisis_id?: string | null
          crisis_started_at?: string | null
          id?: string
          owner_id?: string | null
          text: string
          title?: string
          updated_at?: string
        }
        Update: {
          author?: string
          created_at?: string
          crisis_id?: string | null
          crisis_started_at?: string | null
          id?: string
          owner_id?: string | null
          text?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "decision_log_crisis_id_fkey"
            columns: ["crisis_id"]
            isOneToOne: false
            referencedRelation: "crises"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      document_categories: {
        Row: {
          created_at: string
          id: string
          name_en: string
          name_pt: string
          owner_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en?: string
          name_pt: string
          owner_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string
          name_pt?: string
          owner_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      document_files: {
        Row: {
          category_id: string
          created_at: string
          file_name: string
          file_path: string
          id: string
          owner_id: string | null
          url: string
        }
        Insert: {
          category_id: string
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          owner_id?: string | null
          url?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          owner_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_files_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      dr_types: {
        Row: {
          code: string
          created_at: string
          id: string
          label: string
          rpo: number
          rto: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          label: string
          rpo?: number
          rto?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          label?: string
          rpo?: number
          rto?: number
          sort_order?: number
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
      pcn_documents: {
        Row: {
          attribute_key: string
          created_at: string
          dept_code: string
          file_name: string
          file_path: string
          id: string
          owner_id: string | null
          url: string
        }
        Insert: {
          attribute_key: string
          created_at?: string
          dept_code: string
          file_name?: string
          file_path?: string
          id?: string
          owner_id?: string | null
          url?: string
        }
        Update: {
          attribute_key?: string
          created_at?: string
          dept_code?: string
          file_name?: string
          file_path?: string
          id?: string
          owner_id?: string | null
          url?: string
        }
        Relationships: []
      }
      pessoas_criticas: {
        Row: {
          codigo_postal: string
          created_at: string
          departamento: string
          email: string
          funcao: string
          id: string
          nome: string
          owner_id: string | null
          prioridade: number
          telefone: string
          updated_at: string
        }
        Insert: {
          codigo_postal?: string
          created_at?: string
          departamento?: string
          email?: string
          funcao?: string
          id?: string
          nome: string
          owner_id?: string | null
          prioridade?: number
          telefone?: string
          updated_at?: string
        }
        Update: {
          codigo_postal?: string
          created_at?: string
          departamento?: string
          email?: string
          funcao?: string
          id?: string
          nome?: string
          owner_id?: string | null
          prioridade?: number
          telefone?: string
          updated_at?: string
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
      recursos: {
        Row: {
          created_at: string
          description_en: string
          description_pt: string
          icon: string
          id: string
          name_en: string
          name_pt: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string
          description_pt?: string
          icon?: string
          id?: string
          name_en?: string
          name_pt: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_pt?: string
          icon?: string
          id?: string
          name_en?: string
          name_pt?: string
          owner_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sub_capacidades: {
        Row: {
          created_at: string
          id: string
          name_en: string
          name_pt: string
          owner_id: string | null
          recurso_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en?: string
          name_pt: string
          owner_id?: string | null
          recurso_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string
          name_pt?: string
          owner_id?: string | null
          recurso_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_capacidades_recurso_id_fkey"
            columns: ["recurso_id"]
            isOneToOne: false
            referencedRelation: "recursos"
            referencedColumns: ["id"]
          },
        ]
      }
      test_buildings: {
        Row: {
          building_id: string
          created_at: string
          id: string
          test_id: string
        }
        Insert: {
          building_id: string
          created_at?: string
          id?: string
          test_id: string
        }
        Update: {
          building_id?: string
          created_at?: string
          id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_buildings_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_buildings_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_business_processes: {
        Row: {
          business_process_id: string
          created_at: string
          id: string
          test_id: string
        }
        Insert: {
          business_process_id: string
          created_at?: string
          id?: string
          test_id: string
        }
        Update: {
          business_process_id?: string
          created_at?: string
          id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_business_processes_business_process_id_fkey"
            columns: ["business_process_id"]
            isOneToOne: false
            referencedRelation: "business_processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_business_processes_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_platforms: {
        Row: {
          created_at: string
          id: string
          platform_id: string
          test_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform_id: string
          test_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform_id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_platforms_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "cmdb_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_platforms_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string | null
          test_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          test_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          test_date?: string
          updated_at?: string
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
      crisis_status:
        | "registada"
        | "em_alerta"
        | "crise_em_curso"
        | "retorno"
        | "fim"
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
      crisis_status: [
        "registada",
        "em_alerta",
        "crise_em_curso",
        "retorno",
        "fim",
      ],
    },
  },
} as const
