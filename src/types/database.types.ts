export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CreditTransactionType =
  | "deduction"
  | "refund"
  | "admin_grant"
  | "purchase";

export type CostFormulaType = "flat" | "per_second" | "per_resolution";

export type AIProvider = "fal" | "segmind" | "wavespeed";

export type GenerationStatus = "queued" | "processing" | "completed" | "failed";

export type MediaType = "image" | "video";

export interface TechnicalParams {
  lens?: string;
  lighting?: string;
  color_palette?: string;
  camera_movement?: string;
  shot_type?: string;
  aspect_ratio?: string;
  num_outputs?: number;
  reasoning?: string;
  refined_prompt?: string;
  adjustment_applied?: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          display_name: string | null;
          credit_balance: number;
          is_admin: boolean;
          tier: "free" | "starter" | "pro" | "studio";
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          display_name?: string | null;
          credit_balance?: number;
          is_admin?: boolean;
          tier?: "free" | "starter" | "pro" | "studio";
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          display_name?: string | null;
          credit_balance?: number;
          is_admin?: boolean;
          tier?: "free" | "starter" | "pro" | "studio";
        };
        Relationships: [];
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: CreditTransactionType;
          model_used: string | null;
          job_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: CreditTransactionType;
          model_used?: string | null;
          job_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: CreditTransactionType;
          model_used?: string | null;
          job_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      pricing_table: {
        Row: {
          id: string;
          model_name: string;
          provider: AIProvider;
          cost_formula_type: CostFormulaType;
          base_rate: number;
          resolution_multipliers: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          model_name: string;
          provider: AIProvider;
          cost_formula_type: CostFormulaType;
          base_rate: number;
          resolution_multipliers?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          model_name?: string;
          provider?: AIProvider;
          cost_formula_type?: CostFormulaType;
          base_rate?: number;
          resolution_multipliers?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          model_used: string;
          prompt: string;
          status: GenerationStatus;
          output_url: string | null;
          output_urls: Json | null;
          num_outputs: number;
          aspect_ratio: string | null;
          character_id: string | null;
          credits_charged: number;
          job_id: string | null;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
          anthropic_cost: number;
          provider_cost: number;
          technical_params: Json;
          duration_seconds: number | null;
          resolution: string | null;
          is_deleted: boolean;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: string;
          model_used: string;
          prompt: string;
          status?: GenerationStatus;
          output_url?: string | null;
          output_urls?: Json | null;
          num_outputs?: number;
          aspect_ratio?: string | null;
          character_id?: string | null;
          credits_charged: number;
          job_id?: string | null;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
          anthropic_cost?: number;
          provider_cost?: number;
          technical_params?: Json;
          duration_seconds?: number | null;
          resolution?: string | null;
          is_deleted?: boolean;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          model_used?: string;
          prompt?: string;
          status?: GenerationStatus;
          output_url?: string | null;
          output_urls?: Json | null;
          num_outputs?: number;
          aspect_ratio?: string | null;
          character_id?: string | null;
          credits_charged?: number;
          job_id?: string | null;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
          anthropic_cost?: number;
          provider_cost?: number;
          technical_params?: Json;
          duration_seconds?: number | null;
          resolution?: string | null;
          is_deleted?: boolean;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "generations_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      characters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          visual_spec: string | null;
          reference_sheet_url: string | null;
          reference_sheet_generation_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          visual_spec?: string | null;
          reference_sheet_url?: string | null;
          reference_sheet_generation_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          visual_spec?: string | null;
          reference_sheet_url?: string | null;
          reference_sheet_generation_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "characters_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_model: string | null;
          p_job_id: string | null;
        };
        Returns: Json;
      };
      refund_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_job_id: string | null;
          p_model: string | null;
        };
        Returns: Json;
      };
      grant_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_type: CreditTransactionType;
          p_job_id: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      credit_transaction_type: CreditTransactionType;
      generation_status: GenerationStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type CreditTransaction = Database["public"]["Tables"]["credit_transactions"]["Row"];
export type PricingModel = Database["public"]["Tables"]["pricing_table"]["Row"];
export type Generation = Database["public"]["Tables"]["generations"]["Row"];
export type Character = Database["public"]["Tables"]["characters"]["Row"];

