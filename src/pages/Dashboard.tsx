import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import { useAuthStore } from '../stores/authStore';
import { 
  ShoppingCart, TrendingUp, Package, DollarSign, ShoppingBag, AlertTriangle
} from 'lucide-react';
import { dashboardService, productsService, type Product, type Sale, type CashRegister } from '../services/database';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    todaySales: 0,
    todayCount: 0,
    totalProducts: 0,
    lowStockCount: 0,
    currentCashRegister: null as CashRegister | null
  });
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load dashboard stats
        const dashboardStats = await dashboardService.getStats();
        setStats(dashboardStats);
        
        // Load recent sales
        const sales = await dashboardService.getRecentSales(5);
        setRecentSales(sales);
        
        // Load low stock products
        const products = await productsService.getAll();
        const lowStock = products.filter(p => p.stock_quantity <= p.min_stock_quantity).slice(0, 5);
        setLowStockProducts(lowStock);
        
      } catch (error: any) {
        console.error('Erro ao carregar dados do dashboard:', error);
        setError(error.message || 'Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <Card>
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
            <h3 className="text-lg font-medium mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Tentar novamente
            </button>
          </div>
        </Card>
      </Layout>
    );
  }
  
  return (
    <Layout title="Dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bem-vindo, {user?.name}!</h1>
        <p className="text-gray-400">Veja um resumo geral do seu negócio</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="flex items-center p-4 border-l-4 border-neon">
          <div className="bg-neon/20 p-3 rounded-full mr-4">
            <ShoppingCart size={24} className="text-neon" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Vendas Hoje</p>
            <p className="text-xl font-bold">{formatCurrency(stats.todaySales)}</p>
          </div>
        </Card>
        
        <Card className="flex items-center p-4 border-l-4 border-blue-500">
          <div className="bg-blue-500/20 p-3 rounded-full mr-4">
            <ShoppingBag size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Vendas Hoje</p>
            <p className="text-xl font-bold">{stats.todayCount}</p>
          </div>
        </Card>
        
        <Card className="flex items-center p-4 border-l-4 border-purple-500">
          <div className="bg-purple-500/20 p-3 rounded-full mr-4">
            <Package size={24} className="text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Produtos</p>
            <p className="text-xl font-bold">{stats.totalProducts}</p>
          </div>
        </Card>
        
        <Card className="flex items-center p-4 border-l-4 border-orange-500">
          <div className="bg-orange-500/20 p-3 rounded-full mr-4">
            <AlertTriangle size={24} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Estoque Baixo</p>
            <p className="text-xl font-bold">{stats.lowStockCount}</p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Vendas Recentes">
            {recentSales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-lighter">
                      <th className="px-4 py-2 text-left font-medium text-gray-400">Data</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-400">Valor</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-400">Pagamento</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-400">Funcionário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-dark-lighter hover:bg-dark-lighter">
                        <td className="px-4 py-3 text-sm">
                          {new Date(sale.created_at!).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-neon">
                          {formatCurrency(sale.final_amount)}
                        </td>
                        <td className="px-4 py-3 text-sm capitalize">
                          {sale.payment_method}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {(sale as any).users?.name || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Nenhuma venda registrada</p>
            )}
          </Card>
        </div>
        
        <div>
          {stats.currentCashRegister && (
            <Card title="Status do Caixa" className="mb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {stats.currentCashRegister.status === 'open' ? 'Aberto' : 'Fechado'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Valor Inicial:</span>
                  <span>{formatCurrency(stats.currentCashRegister.initial_amount)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Vendas:</span>
                  <span>{formatCurrency(stats.currentCashRegister.sales_total)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Reforços:</span>
                  <span>{formatCurrency(stats.currentCashRegister.cash_in_total)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Sangrias:</span>
                  <span>{formatCurrency(stats.currentCashRegister.cash_out_total)}</span>
                </div>
                
                <div className="border-t border-dark-lighter pt-3">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total em Caixa:</span>
                    <span className="text-neon">
                      {formatCurrency(
                        stats.currentCashRegister.initial_amount + 
                        stats.currentCashRegister.sales_total + 
                        stats.currentCashRegister.cash_in_total - 
                        stats.currentCashRegister.cash_out_total
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          <Card title="Produtos com Estoque Baixo">
            <div className="space-y-3">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-dark-lighter last:border-0">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-400">{product.volume}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-500 font-medium">{product.stock_quantity}</p>
                      <p className="text-xs text-gray-400">Min: {product.min_stock_quantity}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-3">
                  Nenhum produto com estoque baixo
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;