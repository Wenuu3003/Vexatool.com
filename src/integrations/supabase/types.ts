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
      admin_blogs: {
        Row: {
          author: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tags?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tags?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_faqs: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          is_published: boolean | null
          question: string
          sort_order: number | null
          tool_slug: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          question: string
          sort_order?: number | null
          tool_slug?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          question?: string
          sort_order?: number | null
          tool_slug?: string | null
        }
        Relationships: []
      }
      admin_tools: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          icon: string | null
          id: string
          is_enabled: boolean | null
          is_featured: boolean | null
          name: string
          preview_image: string | null
          route_path: string
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_enabled?: boolean | null
          is_featured?: boolean | null
          name: string
          preview_image?: string | null
          route_path: string
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_enabled?: boolean | null
          is_featured?: boolean | null
          name?: string
          preview_image?: string | null
          route_path?: string
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "admin_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      programmatic_seo_pages: {
        Row: {
          breadcrumbs: Json
          canonical_url: string | null
          category: string
          created_at: string
          faqs: Json
          h1: string
          id: string
          internal_links: Json
          intro_md: string
          is_published: boolean
          meta_description: string
          parent_tool_slug: string | null
          preset_payload: Json
          sections: Json
          seo_title: string
          slug: string
          updated_at: string
        }
        Insert: {
          breadcrumbs?: Json
          canonical_url?: string | null
          category: string
          created_at?: string
          faqs?: Json
          h1: string
          id?: string
          internal_links?: Json
          intro_md: string
          is_published?: boolean
          meta_description: string
          parent_tool_slug?: string | null
          preset_payload?: Json
          sections?: Json
          seo_title: string
          slug: string
          updated_at?: string
        }
        Update: {
          breadcrumbs?: Json
          canonical_url?: string | null
          category?: string
          created_at?: string
          faqs?: Json
          h1?: string
          id?: string
          internal_links?: Json
          intro_md?: string
          is_published?: boolean
          meta_description?: string
          parent_tool_slug?: string | null
          preset_payload?: Json
          sections?: Json
          seo_title?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_audit_findings: {
        Row: {
          audit_id: string | null
          detail: string | null
          detected_at: string
          id: string
          issue_type: string
          resolved: boolean
          severity: string
          url: string
        }
        Insert: {
          audit_id?: string | null
          detail?: string | null
          detected_at?: string
          id?: string
          issue_type: string
          resolved?: boolean
          severity?: string
          url: string
        }
        Update: {
          audit_id?: string | null
          detail?: string | null
          detected_at?: string
          id?: string
          issue_type?: string
          resolved?: boolean
          severity?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_audit_findings_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "seo_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_blog_drafts: {
        Row: {
          content_md: string | null
          created_at: string
          faqs: Json
          google_doc_id: string | null
          google_doc_url: string | null
          id: string
          internal_links: Json
          meta_description: string | null
          outline: Json
          research_sources: Json
          slug: string | null
          status: string
          target_keyword: string | null
          title: string | null
          topic: string
          updated_at: string
        }
        Insert: {
          content_md?: string | null
          created_at?: string
          faqs?: Json
          google_doc_id?: string | null
          google_doc_url?: string | null
          id?: string
          internal_links?: Json
          meta_description?: string | null
          outline?: Json
          research_sources?: Json
          slug?: string | null
          status?: string
          target_keyword?: string | null
          title?: string | null
          topic: string
          updated_at?: string
        }
        Update: {
          content_md?: string | null
          created_at?: string
          faqs?: Json
          google_doc_id?: string | null
          google_doc_url?: string | null
          id?: string
          internal_links?: Json
          meta_description?: string | null
          outline?: Json
          research_sources?: Json
          slug?: string | null
          status?: string
          target_keyword?: string | null
          title?: string | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_reports: {
        Row: {
          generated_at: string
          id: string
          payload: Json
          period_end: string | null
          period_start: string | null
          report_type: string
          sheet_url: string | null
          summary: string | null
        }
        Insert: {
          generated_at?: string
          id?: string
          payload?: Json
          period_end?: string | null
          period_start?: string | null
          report_type: string
          sheet_url?: string | null
          summary?: string | null
        }
        Update: {
          generated_at?: string
          id?: string
          payload?: Json
          period_end?: string | null
          period_start?: string | null
          report_type?: string
          sheet_url?: string | null
          summary?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_files: {
        Row: {
          file_name: string
          file_type: string
          id: string
          processed_at: string
          tool_used: string
          user_id: string
        }
        Insert: {
          file_name: string
          file_type: string
          id?: string
          processed_at?: string
          tool_used: string
          user_id: string
        }
        Update: {
          file_name?: string
          file_type?: string
          id?: string
          processed_at?: string
          tool_used?: string
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
      setup_first_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
