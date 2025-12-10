export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      products: {
        Row: {
          barcode: string | null
          caliber_thickness: string | null
          category_id: string | null
          characteristics: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ean: string
          for_independent_pharmacies: boolean | null
          for_institutional_use: boolean | null
          for_own_pharmacies: boolean | null
          for_self_service: boolean | null
          for_wholesale: boolean | null
          generated_name: string | null
          height_cm: number | null
          id: string
          is_active: boolean
          is_chronic_use: boolean | null
          is_controlled: boolean
          is_draft: boolean | null
          is_hazardous: boolean
          is_hospital_use: boolean | null
          is_routed: boolean | null
          laboratory_id: string | null
          length_cm: number | null
          list_price: number | null
          name: string
          package_type_id: string | null
          pharmaceutical_form_id: string | null
          quantity: number | null
          rdc_id: string | null
          registration_expiry: string | null
          registration_number: string | null
          requestor_id: string | null
          requires_cold_chain: boolean
          requires_retained_prescription: boolean | null
          shelf_life_days: number | null
          short_name: string | null
          size_capacity: string | null
          sku: string
          special_offer_description: string | null
          tax_type_id: string | null
          temperature_requirement: Database["public"]["Enums"]["temperature_requirement"]
          unit_cost: number | null
          unit_of_measure_id: string | null
          units_per_package: number
          updated_at: string
          updated_by: string | null
          volume_cm3: number | null
          weight_kg: number | null
          width_cm: number | null
        }
        Insert: {
          barcode?: string | null
          caliber_thickness?: string | null
          category_id?: string | null
          characteristics?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ean: string
          for_independent_pharmacies?: boolean | null
          for_institutional_use?: boolean | null
          for_own_pharmacies?: boolean | null
          for_self_service?: boolean | null
          for_wholesale?: boolean | null
          generated_name?: string | null
          height_cm?: number | null
          id?: string
          is_active?: boolean
          is_chronic_use?: boolean | null
          is_controlled?: boolean
          is_draft?: boolean | null
          is_hazardous?: boolean
          is_hospital_use?: boolean | null
          is_routed?: boolean | null
          laboratory_id?: string | null
          length_cm?: number | null
          list_price?: number | null
          name: string
          package_type_id?: string | null
          pharmaceutical_form_id?: string | null
          quantity?: number | null
          rdc_id?: string | null
          registration_expiry?: string | null
          registration_number?: string | null
          requestor_id?: string | null
          requires_cold_chain?: boolean
          requires_retained_prescription?: boolean | null
          shelf_life_days?: number | null
          short_name?: string | null
          size_capacity?: string | null
          sku: string
          special_offer_description?: string | null
          tax_type_id?: string | null
          temperature_requirement: Database["public"]["Enums"]["temperature_requirement"]
          unit_cost?: number | null
          unit_of_measure_id?: string | null
          units_per_package?: number
          updated_at?: string
          updated_by?: string | null
          volume_cm3?: number | null
          weight_kg?: number | null
          width_cm?: number | null
        }
        Update: {
          barcode?: string | null
          caliber_thickness?: string | null
          category_id?: string | null
          characteristics?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ean?: string
          for_independent_pharmacies?: boolean | null
          for_institutional_use?: boolean | null
          for_own_pharmacies?: boolean | null
          for_self_service?: boolean | null
          for_wholesale?: boolean | null
          generated_name?: string | null
          height_cm?: number | null
          id?: string
          is_active?: boolean
          is_chronic_use?: boolean | null
          is_controlled?: boolean
          is_draft?: boolean | null
          is_hazardous?: boolean
          is_hospital_use?: boolean | null
          is_routed?: boolean | null
          laboratory_id?: string | null
          length_cm?: number | null
          list_price?: number | null
          name?: string
          package_type_id?: string | null
          pharmaceutical_form_id?: string | null
          quantity?: number | null
          rdc_id?: string | null
          registration_expiry?: string | null
          registration_number?: string | null
          requestor_id?: string | null
          requires_cold_chain?: boolean
          requires_retained_prescription?: boolean | null
          shelf_life_days?: number | null
          short_name?: string | null
          size_capacity?: string | null
          sku?: string
          special_offer_description?: string | null
          tax_type_id?: string | null
          temperature_requirement?: Database["public"]["Enums"]["temperature_requirement"]
          unit_cost?: number | null
          unit_of_measure_id?: string | null
          units_per_package?: number
          updated_at?: string
          updated_by?: string | null
          volume_cm3?: number | null
          weight_kg?: number | null
          width_cm?: number | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      temperature_requirement:
        | "ambient"
        | "refrigerated"
        | "frozen"
        | "controlled"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      temperature_requirement: [
        "ambient",
        "refrigerated",
        "frozen",
        "controlled",
      ],
    },
  },
} as const

