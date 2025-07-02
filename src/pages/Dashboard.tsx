import React from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import { useAuthStore } from '../stores/authStore';
import { 
  ShoppingCart, TrendingUp, Package, DollarSign, ShoppingBag, Users, Clock, Calendar
} from 'lucide-react';
import { products, sales, cashRegister } from '../data/mockData';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  
  // Calculate dashboard stats from mock data
  const totalSales = sales.reduce((sum, sale) => sum + sale.finalAmount, 0);
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.minStockQuantity).length;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
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
            <p className="text-xl font-bold">{formatCurrency(totalSales)}</p>
          </div>
        </Card>
        
        <Card className="flex items-center p-4 border-l-4 border-blue-500">
          <div className="bg-blue-500/20 p-3 rounded-full mr-4">
            <ShoppingBag size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total de Vendas</p>
            <p className="text-xl font-bold">{sales.length}</p>
          </div>
        </Card>
        
        <Card className="flex items-center p-4 border-l-4 border-purple-500">
          <div className="bg-purple-500/20 p-3 rounded-full mr-4">
            <Package size={24} className="text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Produtos</p>
            <p className="text-xl font-bold">{totalProducts}</p>
          </div>
        </Card>
        
        <Card className="flex items-center p-4 border-l-4 border-orange-500">
          <div className="bg-orange-500/20 p-3 rounded-full mr-4">
            <TrendingUp size={24} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Estoque Baixo</p>
            <p className="text-xl font-bold">{lowStockProducts}</p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Vendas Recentes">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-lighter">
                    <th className="px-4 py-2 text-left font-medium text-gray-400">ID</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-400">Data</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-400">Valor</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-400">Pagamento</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-400">Funcionário</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-dark-lighter hover:bg-dark-lighter">
                      <td className="px-4 py-3 text-sm">{sale.id}</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(sale.date).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-neon">
                        {formatCurrency(sale.finalAmount)}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">
                        {sale.paymentMethod}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {sale.employeeName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        <div>
          <Card title="Status do Caixa" className="mb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {cashRegister.status === 'open' ? 'Aberto' : 'Fechado'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Valor Inicial:</span>
                <span>{formatCurrency(cashRegister.initialAmount)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Vendas:</span>
                <span>{formatCurrency(cashRegister.sales)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Reforços:</span>
                <span>{formatCurrency(cashRegister.cashIn)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Sangrias:</span>
                <span>{formatCurrency(cashRegister.cashOut)}</span>
              </div>
              
              <div className="border-t border-dark-lighter pt-3">
                <div className="flex items-center justify-between font-medium">
                  <span>Total em Caixa:</span>
                  <span className="text-neon">
                    {formatCurrency(
                      cashRegister.initialAmount + 
                      cashRegister.sales + 
                      cashRegister.cashIn - 
                      cashRegister.cashOut
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card title="Produtos com Estoque Baixo">
            <div className="space-y-3">
              {products
                .filter((product) => product.stockQuantity <= product.minStockQuantity)
                .slice(0, 5)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-dark-lighter last:border-0">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-400">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-500 font-medium">{product.stockQuantity}</p>
                      <p className="text-xs text-gray-400">Min: {product.minStockQuantity}</p>
                    </div>
                  </div>
                ))}
              
              {products.filter((product) => product.stockQuantity <= product.minStockQuantity).length === 0 && (
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