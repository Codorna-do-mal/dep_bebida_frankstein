import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL:', supabaseUrl);
  console.error('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          role: 'gestor' | 'funcionario';
          hire_date: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          role?: 'gestor' | 'funcionario';
          hire_date?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          name?: string;
          email?: string;
          phone?: string | null;
          role?: 'gestor' | 'funcionario';
          hire_date?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          category_id: string | null;
          price: number;
          cost: number;
          description: string | null;
          image_url: string | null;
          barcode: string | null;
          volume: string | null;
          stock_quantity: number;
          min_stock_quantity: number;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          category_id?: string | null;
          price: number;
          cost: number;
          description?: string | null;
          image_url?: string | null;
          barcode?: string | null;
          volume?: string | null;
          stock_quantity: number;
          min_stock_quantity: number;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          category_id?: string | null;
          price?: number;
          cost?: number;
          description?: string | null;
          image_url?: string | null;
          barcode?: string | null;
          volume?: string | null;
          stock_quantity?: number;
          min_stock_quantity?: number;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      sales: {
        Row: {
          id: string;
          total_amount: number;
          discount: number;
          final_amount: number;
          payment_method: string;
          change_amount: number | null;
          cash_register_id: string | null;
          employee_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          total_amount: number;
          discount?: number;
          final_amount: number;
          payment_method: string;
          change_amount?: number | null;
          cash_register_id?: string | null;
          employee_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          total_amount?: number;
          discount?: number;
          final_amount?: number;
          payment_method?: string;
          change_amount?: number | null;
          cash_register_id?: string | null;
          employee_id?: string | null;
          created_at?: string | null;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string | null;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          sale_id?: string | null;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          sale_id?: string | null;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string | null;
        };
      };
      cash_registers: {
        Row: {
          id: string;
          status: string;
          opened_at: string | null;
          closed_at: string | null;
          initial_amount: number;
          final_amount: number | null;
          sales_total: number;
          cash_in_total: number;
          cash_out_total: number;
          employee_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          status?: string;
          opened_at?: string | null;
          closed_at?: string | null;
          initial_amount: number;
          final_amount?: number | null;
          sales_total?: number;
          cash_in_total?: number;
          cash_out_total?: number;
          employee_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          status?: string;
          opened_at?: string | null;
          closed_at?: string | null;
          initial_amount?: number;
          final_amount?: number | null;
          sales_total?: number;
          cash_in_total?: number;
          cash_out_total?: number;
          employee_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      cash_transactions: {
        Row: {
          id: string;
          cash_register_id: string | null;
          type: string;
          amount: number;
          description: string;
          employee_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          cash_register_id?: string | null;
          type: string;
          amount: number;
          description: string;
          employee_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          cash_register_id?: string | null;
          type?: string;
          amount?: number;
          description?: string;
          employee_id?: string | null;
          created_at?: string | null;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          name: string;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          is_active?: boolean | null;
          created_at?: string | null;
        };
      };
      stock_movements: {
        Row: {
          id: string;
          product_id: string | null;
          type: string;
          quantity: number;
          reason: string;
          reference_id: string | null;
          reference_type: string | null;
          employee_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          type: string;
          quantity: number;
          reason: string;
          reference_id?: string | null;
          reference_type?: string | null;
          employee_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          type?: string;
          quantity?: number;
          reason?: string;
          reference_id?: string | null;
          reference_type?: string | null;
          employee_id?: string | null;
          created_at?: string | null;
        };
      };
      company_settings: {
        Row: {
          id: string;
          company_name: string;
          cnpj: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          logo_url: string | null;
          receipt_footer: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          company_name?: string;
          cnpj?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          logo_url?: string | null;
          receipt_footer?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          company_name?: string;
          cnpj?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          logo_url?: string | null;
          receipt_footer?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      products_with_categories: {
        Row: {
          id: string | null;
          name: string | null;
          category_id: string | null;
          price: number | null;
          cost: number | null;
          description: string | null;
          image_url: string | null;
          barcode: string | null;
          volume: string | null;
          stock_quantity: number | null;
          min_stock_quantity: number | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          category_name: string | null;
        };
      };
    };
  };
}