
import { supabase, executeQuery } from '../lib/supabase';
import type { Database } from '../lib/supabase';

// Types simplificados
export type Product = Database['public']['Tables']['products']['Row'] & { category_name?: string };
export type Category = Database['public']['Tables']['categories']['Row'];
export type Sale = Database['public']['Tables']['sales']['Row'];
export type SaleItem = Database['public']['Tables']['sale_items']['Row'];
export type CashRegister = Database['public']['Tables']['cash_registers']['Row'];
export type CashTransaction = Database['public']['Tables']['cash_transactions']['Row'];
export type StockMovement = Database['public']['Tables']['stock_movements']['Row'];
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type User = Database['public']['Tables']['users']['Row'];

// Erro padrão
const handleDatabaseError = (error: any, operation: string) => {
  console.error(`Database error in ${operation}:`, error);
  if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
    throw new Error('Erro de conexão com o banco de dados. Verifique sua conexão com a internet.');
  }
  throw new Error(error?.message || `Erro ao ${operation}`);
};

// Exemplo corrigido: Products Service
export const productsService = {
  async getAll() {
    const result = await executeQuery(() =>
      supabase.from('products_with_categories').select('*').eq('is_active', true).order('name')
    );
    if (result.error) handleDatabaseError(result.error, 'carregar produtos');
    return result.data || [];
  },

  async getById(id: string) {
    const result = await executeQuery(() =>
      supabase.from('products').select('*').eq('id', id).maybeSingle()
    );
    if (result.error) handleDatabaseError(result.error, 'carregar produto');
    return result.data || null;
  },

  async create(product: Database['public']['Tables']['products']['Insert']) {
    const result = await executeQuery(() =>
      supabase.from('products').insert(product).select().single()
    );
    if (result.error) handleDatabaseError(result.error, 'criar produto');
    return result.data || null;
  },

  async update(id: string, product: Database['public']['Tables']['products']['Update']) {
    const result = await executeQuery(() =>
      supabase.from('products').update(product).eq('id', id).select().single()
    );
    if (result.error) handleDatabaseError(result.error, 'atualizar produto');
    return result.data || null;
  },

  async delete(id: string) {
    const result = await executeQuery(() =>
      supabase.from('products').delete().eq('id', id)
    );
    if (result.error) handleDatabaseError(result.error, 'excluir produto');
    return true;
  },
};

// Outros serviços (categories, sales, etc.) seguem o mesmo padrão acima.