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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      annonce_services: {
        Row: {
          annonce_id: string
          service_id: string
        }
        Insert: {
          annonce_id: string
          service_id: string
        }
        Update: {
          annonce_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "annonce_services_annonce_id_fkey"
            columns: ["annonce_id"]
            isOneToOne: false
            referencedRelation: "annonces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annonce_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      annonces: {
        Row: {
          batiment_id: string | null
          charges: string | null
          conditions_bail: string | null
          conditions_duree: string | null
          conditions_garantie: string | null
          conditions_notes: string | null
          conditions_preavis: string | null
          created_at: string
          description: string | null
          disponibilite: string | null
          id: string
          mise_en_avant: boolean | null
          prix_mensuel: number | null
          statut: string
          surface: number | null
          titre: string
          type_espace: string
          updated_at: string
        }
        Insert: {
          batiment_id?: string | null
          charges?: string | null
          conditions_bail?: string | null
          conditions_duree?: string | null
          conditions_garantie?: string | null
          conditions_notes?: string | null
          conditions_preavis?: string | null
          created_at?: string
          description?: string | null
          disponibilite?: string | null
          id?: string
          mise_en_avant?: boolean | null
          prix_mensuel?: number | null
          statut?: string
          surface?: number | null
          titre: string
          type_espace?: string
          updated_at?: string
        }
        Update: {
          batiment_id?: string | null
          charges?: string | null
          conditions_bail?: string | null
          conditions_duree?: string | null
          conditions_garantie?: string | null
          conditions_notes?: string | null
          conditions_preavis?: string | null
          created_at?: string
          description?: string | null
          disponibilite?: string | null
          id?: string
          mise_en_avant?: boolean | null
          prix_mensuel?: number | null
          statut?: string
          surface?: number | null
          titre?: string
          type_espace?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "annonces_batiment_id_fkey"
            columns: ["batiment_id"]
            isOneToOne: false
            referencedRelation: "batiments"
            referencedColumns: ["id"]
          },
        ]
      }
      batiments: {
        Row: {
          adresse: string
          created_at: string
          description: string | null
          id: string
          nom: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          adresse: string
          created_at?: string
          description?: string | null
          id?: string
          nom: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          adresse?: string
          created_at?: string
          description?: string | null
          id?: string
          nom?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      medias: {
        Row: {
          annonce_id: string
          created_at: string
          id: string
          ordre: number
          type: string
          url: string
        }
        Insert: {
          annonce_id: string
          created_at?: string
          id?: string
          ordre?: number
          type?: string
          url: string
        }
        Update: {
          annonce_id?: string
          created_at?: string
          id?: string
          ordre?: number
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "medias_annonce_id_fkey"
            columns: ["annonce_id"]
            isOneToOne: false
            referencedRelation: "annonces"
            referencedColumns: ["id"]
          },
        ]
      }
      page_content: {
        Row: {
          avantages: Json | null
          chiffres: Json | null
          description: string | null
          id: string
          photos: Json | null
          titre: string | null
          updated_at: string
        }
        Insert: {
          avantages?: Json | null
          chiffres?: Json | null
          description?: string | null
          id?: string
          photos?: Json | null
          titre?: string | null
          updated_at?: string
        }
        Update: {
          avantages?: Json | null
          chiffres?: Json | null
          description?: string | null
          id?: string
          photos?: Json | null
          titre?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          icone: string
          id: string
          nom: string
          ordre: number
        }
        Insert: {
          created_at?: string
          icone?: string
          id?: string
          nom: string
          ordre?: number
        }
        Update: {
          created_at?: string
          icone?: string
          id?: string
          nom?: string
          ordre?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
