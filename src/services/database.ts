import { supabase, executeQuery } from '../lib/supabase';
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
export type StockMovement = Database['public']['Tables']['stock_movements']['Row'] & {
  productId?: string;
  productName?: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  date?: string;
  createdAt?: string;
  employeeId?: string;
};
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type User = Database['public']['Tables']['users']['Row'];

// Error handling wrapper
const handleDatabaseError = (error: any, operation: string) => {
  console.error(`Database error in ${operation}:`, error);
  
  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('NetworkError')) {
    throw new Error('Erro de conexão com o banco de dados. Verifique sua conexão com a internet.');
  }
  
  if (error.code === 'PGRST301') {
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  
  throw new Error(error.message || `Erro ao ${operation}`);
};

// Products service
export const productsService = {
  async getAll() {
    try {
      const result = await executeQuery(() => 
        supabase
          .from('products_with_categories')
          .select('*')
          .eq('is_active', true)
          .order('name')
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'carregar produtos');
      }
      
      return result.data || [];
    } catch (error) {
      handleDatabaseError(error, 'carregar produtos');
      return [];
    }
  },

  async getById(id: string) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'carregar produto');
      }
      
      return result.data;
    } catch (error) {
      handleDatabaseError(error, 'carregar produto');
      return null;
    }
  },

  async create(product: Database['public']['Tables']['products']['Insert']) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('products')
          .insert(product)
          .select()
          .single()
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'criar produto');
      }
      
      // Create initial stock movement
      if (result.data && product.stock_quantity && product.stock_quantity > 0) {
        await stockMovementsService.create({
          product_id: result.data.id,
          type: 'in',
          quantity: product.stock_quantity,
          reason: 'Estoque inicial',
          employee_id: (product as any).employee_id || null
        });
      }
      
      return result.data;
    } catch (error) {
      handleDatabaseError(error, 'criar produto');
      return null;
    }
  },

  async update(id: string, product: Database['public']['Tables']['products']['Update']) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('products')
          .update(product)
          .eq('id', id)
          .select()
          .single()
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'atualizar produto');
      }
      
      return result.data;
    } catch (error) {
      handleDatabaseError(error, 'atualizar produto');
      return null;
    }
  },

  async delete(id: string) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('products')
          .delete()
          .eq('id', id)
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'excluir produto');
      }
    } catch (error) {
      handleDatabaseError(error, 'excluir produto');
    }
  },

  async updateStock(productId: string, newQuantity: number, reason: string, employeeId: string) {
    try {
      // Get current stock
      const productResult = await executeQuery(() =>
        supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', productId)
          .single()
      );
      
      if (productResult.error || !productResult.data) {
        throw new Error('Produto não encontrado');
      }
      
      const difference = newQuantity - productResult.data.stock_quantity;
      
      // Update product stock
      const updateResult = await executeQuery(() =>
        supabase
          .from('products')
          .update({ stock_quantity: newQuantity })
          .eq('id', productId)
      );
      
      if (updateResult.error) {
        handleDatabaseError(updateResult.error, 'atualizar estoque');
      }
      
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
    } catch (error) {
      handleDatabaseError(error, 'atualizar estoque');
    }
  }
};

// Categories service
export const categoriesService = {
  async getAll() {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('categories')
          .select('*')
          .order('name')
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'carregar categorias');
      }
      
      return result.data || [];
    } catch (error) {
      handleDatabaseError(error, 'carregar categorias');
      return [];
    }
  },

  async create(category: Database['public']['Tables']['categories']['Insert']) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('categories')
          .insert(category)
          .select()
          .single()
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'criar categoria');
      }
      
      return result.data;
    } catch (error) {
      handleDatabaseError(error, 'criar categoria');
      return null;
    }
  },

  async update(id: string, category: Database['public']['Tables']['categories']['Update']) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('categories')
          .update(category)
          .eq('id', id)
          .select()
          .single()
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'atualizar categoria');
      }
      
      return result.data;
    } catch (error) {
      handleDatabaseError(error, 'atualizar categoria');
      return null;
    }
  },

  async delete(id: string) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('categories')
          .delete()
          .eq('id', id)
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'excluir categoria');
      }
    } catch (error) {
      handleDatabaseError(error, 'excluir categoria');
    }
  }
};

// Sales service
export const salesService = {
  async getAll() {
    try {
      const result = await executeQuery(() =>
        supabase
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
          .order('created_at', { ascending: false })
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'carregar vendas');
      }
      
      return result.data || [];
    } catch (error) {
      handleDatabaseError(error, 'carregar vendas');
      return [];
    }
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
    try {
      // Start transaction
      const saleResult = await executeQuery(() =>
        supabase
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
          .single()
      );
      
      if (saleResult.error || !saleResult.data) {
        handleDatabaseError(saleResult.error, 'criar venda');
      }
      
      // Insert sale items
      const saleItems = sale.items.map(item => ({
        sale_id: saleResult.data!.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));
      
      const itemsResult = await executeQuery(() =>
        supabase
          .from('sale_items')
          .insert(saleItems)
      );
      
      if (itemsResult.error) {
        handleDatabaseError(itemsResult.error, 'criar itens da venda');
      }
      
      return saleResult.data;
    } catch (error) {
      handleDatabaseError(error, 'criar venda');
      return null;
    }
  },

  async getById(id: string) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('sales')
          .select(`
            *,
            sale_items (*),
            users (name),
            payment_methods (name)
          `)
          .eq('id', id)
          .single()
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'carregar venda');
      }
      
      return result.data;
    } catch (error) {
      handleDatabaseError(error, 'carregar venda');
      return null;
    }
  }
};

// Cash register service
export const cashRegisterService = {
  async getCurrent() {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('cash_registers')
          .select('*, users (name)')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      );
      
      if (result.error && result.error.code !== 'PGRST116') {
        handleDatabaseError(result.error, 'carregar caixa atual');
      }
      
      return result.data;
    } catch (error) {
      // Don't throw error if no cash register is found
      if (error instanceof Error && error.message.includes('PGRST116')) {
        return null;
      }
      handleDatabaseError(error, 'carregar caixa atual');
      return null;
    }
  },

  async open(initialAmount: number, employeeId: string) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('cash_registers')
          .insert({
            initial_amount: initialAmount,
            employee_id: employeeId
          })
          .select()
          .single()
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'abrir caixa');
      }
      
      return result.data;
    } catch (error) {
      handleDatabaseError(error, 'abrir caixa');
      return null;
    }
  },

  async close(id: string, finalAmount: number) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('cash_registers')
          .update({
            status: 'closed',
            closed_at: new Date().toISOString(),
            final_amount: finalAmount
          })
          .eq('id', id)
          .select()
          .single()
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'fechar caixa');
      }
      
      return result.data;
    } catch (error) {
      handleDatabaseError(error, 'fechar caixa');
      return null;
    }
  },

  async addTransaction(transaction: Database['public']['Tables']['cash_transactions']['Insert']) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('cash_transactions')
          .insert(transaction)
          .select()
          .single()
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'adicionar transação');
      }
      
      return result.data;
    } catch (error) {
      handleDatabaseError(error, 'adicionar transação');
      return null;
    }
  },

  async getTransactions(cashRegisterId: string) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('cash_transactions')
          .select('*')
          .eq('cash_register_id', cashRegisterId)
          .order('created_at', { ascending: false })
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'carregar transações');
      }
      
      return result.data || [];
    } catch (error) {
      handleDatabaseError(error, 'carregar transações');
      return [];
    }
  }
};

// Stock movements service
export const stockMovementsService = {
  async getAll() {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('stock_movements')
          .select(`
            *,
            products (name),
            users (name)
          `)
          .order('created_at', { ascending: false })
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'carregar movimentações de estoque');
      }
      
      // Transform data to match expected format
      return (result.data || []).map(movement => ({
        ...movement,
        productId: movement.product_id,
        productName: (movement as any).products?.name || 'Produto não encontrado',
        date: movement.created_at,
        createdAt: movement.created_at,
        employeeId: movement.employee_id
      }));
    } catch (error) {
      handleDatabaseError(error, 'carregar movimentações de estoque');
      return [];
    }
  },

  async create(movement: Database['public']['Tables']['stock_movements']['Insert']) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('stock_movements')
          .insert(movement)
          .select()
          .single()
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'criar movimentação de estoque');
      }
      
      // Transform data to match expected format
      return {
        ...result.data!,
        productId: result.data!.product_id,
        productName: '',
        date: result.data!.created_at,
        createdAt: result.data!.created_at,
        employeeId: result.data!.employee_id
      };
    } catch (error) {
      handleDatabaseError(error, 'criar movimentação de estoque');
      return null;
    }
  },

  async getByProduct(productId: string) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('stock_movements')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false })
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'carregar movimentações do produto');
      }
      
      return result.data || [];
    } catch (error) {
      handleDatabaseError(error, 'carregar movimentações do produto');
      return [];
    }
  }
};

// Payment methods service
export const paymentMethodsService = {
  async getAll() {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('payment_methods')
          .select('*')
          .eq('is_active', true)
          .order('name')
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'carregar métodos de pagamento');
      }
      
      return result.data || [];
    } catch (error) {
      handleDatabaseError(error, 'carregar métodos de pagamento');
      return [];
    }
  }
};

// Users service
export const usersService = {
  async getAll() {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('users')
          .select('*')
          .eq('is_active', true)
          .order('name')
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'carregar usuários');
      }
      
      return result.data || [];
    } catch (error) {
      handleDatabaseError(error, 'carregar usuários');
      return [];
    }
  },

  async create(user: Database['public']['Tables']['users']['Insert']) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('users')
          .insert(user)
          .select()
          .single()
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'criar usuário');
      }
      
      return result.data;
    } catch (error) {
      handleDatabaseError(error, 'criar usuário');
      return null;
    }
  },

  async update(id: string, user: Database['public']['Tables']['users']['Update']) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('users')
          .update(user)
          .eq('id', id)
          .select()
          .single()
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'atualizar usuário');
      }
      
      return result.data;
    } catch (error) {
      handleDatabaseError(error, 'atualizar usuário');
      return null;
    }
  },

  async delete(id: string) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('users')
          .update({ is_active: false })
          .eq('id', id)
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'excluir usuário');
      }
    } catch (error) {
      handleDatabaseError(error, 'excluir usuário');
    }
  }
};

// Dashboard service
export const dashboardService = {
  async getStats() {
    try {
      // Get today's sales
      const today = new Date().toISOString().split('T')[0];
      
      const salesResult = await executeQuery(() =>
        supabase
          .from('sales')
          .select('final_amount')
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`)
      );
      
      if (salesResult.error) {
        handleDatabaseError(salesResult.error, 'carregar vendas do dia');
      }
      
      // Get total products
      const productsResult = await executeQuery(() =>
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
      );
      
      if (productsResult.error) {
        handleDatabaseError(productsResult.error, 'contar produtos');
      }
      
      // Get low stock products
const lowStockResult = await executeQuery(() =>
  supabase
    .rpc('get_low_stock_products') // Consome a função
      );
      
      if (lowStockResult.error) {
        handleDatabaseError(lowStockResult.error, 'carregar produtos com estoque baixo');
      }
      
      // Get current cash register
      const currentCashRegister = await cashRegisterService.getCurrent();
      
      const todayTotal = salesResult.data?.reduce((sum, sale) => sum + (sale.final_amount || 0), 0) || 0;
      const todayCount = salesResult.data?.length || 0;
      
      return {
        todaySales: todayTotal,
        todayCount,
        totalProducts: (productsResult as any).count || 0,
        lowStockCount: lowStockResult.data?.length || 0,
        currentCashRegister
      };
    } catch (error) {
      handleDatabaseError(error, 'carregar estatísticas do dashboard');
      return {
        todaySales: 0,
        todayCount: 0,
        totalProducts: 0,
        lowStockCount: 0,
        currentCashRegister: null
      };
    }
  },

  async getRecentSales(limit = 10) {
    try {
      const result = await executeQuery(() =>
        supabase
          .from('sales')
          .select(`
            *,
            users (name),
            payment_methods (name)
          `)
          .order('created_at', { ascending: false })
          .limit(limit)
      );
      
      if (result.error) {
        handleDatabaseError(result.error, 'carregar vendas recentes');
      }
      
      return result.data || [];
    } catch (error) {
      handleDatabaseError(error, 'carregar vendas recentes');
      return [];
    }
  }
};