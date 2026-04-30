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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          accepts_contact: boolean
          country: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepts_contact?: boolean
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepts_contact?: boolean
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      report_evidences: {
        Row: {
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          report_id: string
          size_bytes: number | null
          storage_path: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          report_id: string
          size_bytes?: number | null
          storage_path: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          report_id?: string
          size_bytes?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_evidences_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          report_id: string
          role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          report_id: string
          role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          report_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_messages_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          action_level: Database["public"]["Enums"]["action_level"] | null
          aggressor_info: string | null
          ai_summary: string | null
          created_at: string
          description: string | null
          harassment_type: Database["public"]["Enums"]["harassment_type"] | null
          id: string
          incident_date: string | null
          last_summarized_at: string | null
          location: string | null
          message_count: number
          recovery_code: string
          status: Database["public"]["Enums"]["report_status"]
          structuration_score: number | null
          summary_context: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action_level?: Database["public"]["Enums"]["action_level"] | null
          aggressor_info?: string | null
          ai_summary?: string | null
          created_at?: string
          description?: string | null
          harassment_type?:
            | Database["public"]["Enums"]["harassment_type"]
            | null
          id?: string
          incident_date?: string | null
          last_summarized_at?: string | null
          location?: string | null
          message_count?: number
          recovery_code: string
          status?: Database["public"]["Enums"]["report_status"]
          structuration_score?: number | null
          summary_context?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action_level?: Database["public"]["Enums"]["action_level"] | null
          aggressor_info?: string | null
          ai_summary?: string | null
          created_at?: string
          description?: string | null
          harassment_type?:
            | Database["public"]["Enums"]["harassment_type"]
            | null
          id?: string
          incident_date?: string | null
          last_summarized_at?: string | null
          location?: string | null
          message_count?: number
          recovery_code?: string
          status?: Database["public"]["Enums"]["report_status"]
          structuration_score?: number | null
          summary_context?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      specialists: {
        Row: {
          city: string | null
          country: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_24_7: boolean
          is_free: boolean
          is_published: boolean
          is_verified: boolean
          languages: string[] | null
          name: string
          phone: string | null
          source_url: string | null
          type: Database["public"]["Enums"]["specialist_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          country: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_24_7?: boolean
          is_free?: boolean
          is_published?: boolean
          is_verified?: boolean
          languages?: string[] | null
          name: string
          phone?: string | null
          source_url?: string | null
          type: Database["public"]["Enums"]["specialist_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          country?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_24_7?: boolean
          is_free?: boolean
          is_published?: boolean
          is_verified?: boolean
          languages?: string[] | null
          name?: string
          phone?: string | null
          source_url?: string | null
          type?: Database["public"]["Enums"]["specialist_type"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      get_admin_stats: {
        Args: never
        Returns: {
          harassment_type: Database["public"]["Enums"]["harassment_type"]
          month: string
          status: Database["public"]["Enums"]["report_status"]
          total: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      action_level: "temoignage" | "accompagnement" | "dossier"
      app_role: "admin" | "moderator" | "user"
      harassment_type:
        | "scolaire"
        | "professionnel"
        | "sexuel"
        | "moral"
        | "cyber"
        | "discriminatoire"
        | "familial"
        | "autre"
      report_status: "draft" | "submitted" | "in_progress" | "closed"
      specialist_type:
        | "helpline"
        | "association"
        | "authority"
        | "legal"
        | "health"
        | "shelter"
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
      action_level: ["temoignage", "accompagnement", "dossier"],
      app_role: ["admin", "moderator", "user"],
      harassment_type: [
        "scolaire",
        "professionnel",
        "sexuel",
        "moral",
        "cyber",
        "discriminatoire",
        "familial",
        "autre",
      ],
      report_status: ["draft", "submitted", "in_progress", "closed"],
      specialist_type: [
        "helpline",
        "association",
        "authority",
        "legal",
        "health",
        "shelter",
      ],
    },
  },
} as const
