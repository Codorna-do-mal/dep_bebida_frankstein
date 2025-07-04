import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

// Types for our application
export type Product = Database['public']['Tables']['products']['Row'] & {
  category_name?: string;
};

export type Category = Database['public']['Tables']['categories']['Row'];
export type Sale = Database['public']['Tables']['sales']['Row'];
export type SaleItem = Database['public']['Tables']['sale_items']['Row'];
export type CashRegister = Database['public']['Tables']['cash_registers']['Row'];
export type CashTransaction = Database['public']['Tables']['cash_transactions']['Row'];
export type StockMovement = Database['public']['Tables']['stock_movements']['Row'];
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type User = Database['public']['Tables']['users']['Row'];

// Products service
export const productsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('products_with_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(product: Database['public']['Tables']['products']['Insert']) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) throw error;
    
    // Create initial stock movement
    if (data && product.stock_quantity > 0) {
      await stockMovementsService.create({
        product_id: data.id,
        type: 'in',
        quantity: product.stock_quantity,
        reason: 'Estoque inicial',
        employee_id: product.employee_id || null
      });
    }
    
    return data;
  },

  async update(id: string, product: Database['public']['Tables']['products']['Update']) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateStock(productId: string, newQuantity: number, reason: string, employeeId: string) {
    // Get current stock
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single();
    
    if (!product) throw new Error('Produto não encontrado');
    
    const difference = newQuantity - product.stock_quantity;
    
    // Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: newQuantity })
      .eq('id', productId);
    
    if (updateError) throw updateError;
    
    // Create stock movement
    if (difference !== 0) {
      await stockMovementsService.create({
        product_id: productId,
        type: difference > 0 ? 'in' : 'out',
        quantity: Math.abs(difference),
        reason,
        employee_id: employeeId
      });
    }
  }
};

// Categories service
export const categoriesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(category: Database['public']['Tables']['categories']['Insert']) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, category: Database['public']['Tables']['categories']['Update']) {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Sales service
export const salesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          *,
          products (name)
        ),
        users (name),
        payment_methods (name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(sale: {
    items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
    total_amount: number;
    discount: number;
    final_amount: number;
    payment_method: string;
    change_amount?: number;
    cash_register_id?: string;
    employee_id: string;
  }) {
    // Start transaction
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert({
        total_amount: sale.total_amount,
        discount: sale.discount,
        final_amount: sale.final_amount,
        payment_method: sale.payment_method,
        change_amount: sale.change_amount,
        cash_register_id: sale.cash_register_id,
        employee_id: sale.employee_id
      })
      .select()
      .single();
    
    if (saleError) throw saleError;
    
    // Insert sale items
    const saleItems = sale.items.map(item => ({
      sale_id: saleData.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));
    
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);
    
    if (itemsError) throw itemsError;
    
    return saleData;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (*),
        users (name),
        payment_methods (name)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Cash register service
export const cashRegisterService = {
  async getCurrent() {
    const { data, error } = await supabase
      .from('cash_registers')
      .select('*, users (name)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async open(initialAmount: number, employeeId: string) {
    const { data, error } = await supabase
      .from('cash_registers')
      .insert({
        initial_amount: initialAmount,
        employee_id: employeeId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async close(id: string, finalAmount: number) {
    const { data, error } = await supabase
      .from('cash_registers')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        final_amount: finalAmount
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addTransaction(transaction: Database['public']['Tables']['cash_transactions']['Insert']) {
    const { data, error } = await supabase
      .from('cash_transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTransactions(cashRegisterId: string) {
    const { data, error } = await supabase
      .from('cash_transactions')
      .select('*')
      .eq('cash_register_id', cashRegisterId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Stock movements service
export const stockMovementsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('stock_movements')
      .select(`
        *,
        products (name),
        users (name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(movement: Database['public']['Tables']['stock_movements']['Insert']) {
    const { data, error } = await supabase
      .from('stock_movements')
      .insert(movement)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByProduct(productId: string) {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Payment methods service
export const paymentMethodsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }
};

// Users service
export const usersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(user: Database['public']['Tables']['users']['Insert']) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, user: Database['public']['Tables']['users']['Update']) {
    const { data, error } = await supabase
      .from('users')
      .update(user)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Dashboard service
export const dashboardService = {
  async getStats() {
    // Get today's sales
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todaySales, error: salesError } = await supabase
      .from('sales')
      .select('final_amount')
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`);
    
    if (salesError) throw salesError;
    
    // Get total products
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (productsError) throw productsError;
    
    // Get low stock products
    const { data: lowStockProducts, error: lowStockError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .filter('stock_quantity', 'lte', 'min_stock_quantity');
    
    if (lowStockError) throw lowStockError;
    
    // Get current cash register
    const currentCashRegister = await cashRegisterService.getCurrent();
    
    const todayTotal = todaySales?.reduce((sum, sale) => sum + (sale.final_amount || 0), 0) || 0;
    const todayCount = todaySales?.length || 0;
    
    return {
      todaySales: todayTotal,
      todayCount,
      totalProducts: totalProducts || 0,
      lowStockCount: lowStockProducts?.length || 0,
      currentCashRegister
    };
  },

  async getRecentSales(limit = 10) {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        users (name),
        payment_methods (name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
};