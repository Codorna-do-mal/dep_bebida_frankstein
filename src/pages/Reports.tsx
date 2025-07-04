import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { salesService, productsService, type Sale, type Product } from '../services/database';
import { Download, Calendar } from 'lucide-react';
import Button from '../components/ui/Button';

const Reports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [reportType, setReportType] = useState('sales');
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, productsData] = await Promise.all([
        salesService.getAll(),
        productsService.getAll()
      ]);
      setSales(salesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  // Generate sales data for charts based on real data
  const generateSalesData = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const salesByDay = days.map(day => ({ name: day, value: 0 }));
    
    // Group sales by day of week
    sales.forEach(sale => {
      const dayOfWeek = new Date(sale.created_at!).getDay();
      salesByDay[dayOfWeek].value += sale.final_amount;
    });
    
    return salesByDay;
  };
  
  // Generate product data based on real sales
  const generateProductData = () => {
    const productSales: { [key: string]: { name: string; value: number } } = {};
    
    sales.forEach(sale => {
      (sale as any).sale_items?.forEach((item: any) => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            name: item.product_name,
            value: 0
          };
        }
        productSales[item.product_id].value += item.quantity;
      });
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };
  
  const generatePaymentData = () => {
    const paymentMethods: { [key: string]: number } = {};
    
    sales.forEach(sale => {
      if (!paymentMethods[sale.payment_method]) {
        paymentMethods[sale.payment_method] = 0;
      }
      paymentMethods[sale.payment_method]++;
    });
    
    const total = Object.values(paymentMethods).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(paymentMethods).map(([method, count]) => ({
      name: method.charAt(0).toUpperCase() + method.slice(1),
      value: Math.round((count / total) * 100)
    }));
  };
  
  const salesData = generateSalesData();
  const productData = generateProductData();
  const paymentData = generatePaymentData();
  
  const COLORS = ['#00ff90', '#4F46E5', '#F59E0B', '#EC4899', '#10B981'];
  
  const renderSalesReport = () => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.final_amount, 0);
    const averageTicket = sales.length > 0 ? totalSales / sales.length : 0;
    
    return (
      <>
        <Card className="mb-6">
          <h3 className="text-lg font-medium mb-4">Vendas por dia</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#a3a3a3" />
                <YAxis stroke="#a3a3a3" />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), 'Vendas']}
                  contentStyle={{ backgroundColor: '#1E1E1E', border: 'none', borderRadius: '0.5rem' }}
                />
                <Bar dataKey="value" fill="#00ff90" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-medium mb-4">Resumo de vendas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-dark-lighter p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Total de vendas</p>
              <p className="text-2xl font-bold text-neon">{formatCurrency(totalSales)}</p>
            </div>
            
            <div className="bg-dark-lighter p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Qtd. de vendas</p>
              <p className="text-2xl font-bold">{sales.length}</p>
            </div>
            
            <div className="bg-dark-lighter p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Ticket médio</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatCurrency(averageTicket)}
              </p>
            </div>
          </div>
          
          {paymentData.length > 0 && (
            <>
              <h4 className="font-medium mb-3">Vendas por forma de pagamento</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Porcentagem']}
                      contentStyle={{ backgroundColor: '#1E1E1E', border: 'none', borderRadius: '0.5rem' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Card>
      </>
    );
  };
  
  const renderProductReport = () => {
    return (
      <Card>
        <h3 className="text-lg font-medium mb-4">Produtos mais vendidos</h3>
        {productData.length > 0 ? (
          <>
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                >
                  <XAxis type="number" stroke="#a3a3a3" />
                  <YAxis dataKey="name" type="category" stroke="#a3a3a3" width={150} />
                  <Tooltip
                    formatter={(value) => [`${value} unidades`, 'Quantidade']}
                    contentStyle={{ backgroundColor: '#1E1E1E', border: 'none', borderRadius: '0.5rem' }}
                  />
                  <Bar dataKey="value" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <h4 className="font-medium mb-3">Detalhes por produto</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-lighter">
                    <th className="px-4 py-2 text-left font-medium text-gray-400">Produto</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-400">Qtd. Vendida</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-400">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.map((productSale, index) => {
                    const product = products.find(p => p.name === productSale.name);
                    const totalValue = productSale.value * (product?.price || 0);
                    
                    return (
                      <tr key={index} className="border-b border-dark-lighter hover:bg-dark-lighter">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {product?.image_url && (
                              <div className="h-8 w-8 rounded overflow-hidden mr-3">
                                <img
                                  src={product.image_url}
                                  alt={productSale.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <span>{productSale.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{productSale.value}</td>
                        <td className="px-4 py-3 text-neon">{formatCurrency(totalValue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center py-8">Nenhum dado de vendas disponível</p>
        )}
      </Card>
    );
  };
  
  if (loading) {
    return (
      <Layout title="Relatórios">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Relatórios">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <Select
            options={[
              { value: 'sales', label: 'Vendas' },
              { value: 'products', label: 'Produtos' }
            ]}
            value={reportType}
            onChange={setReportType}
            className="w-40"
          />
          
          <Select
            options={[
              { value: 'day', label: 'Hoje' },
              { value: 'week', label: 'Esta semana' },
              { value: 'month', label: 'Este mês' },
              { value: 'year', label: 'Este ano' }
            ]}
            value={timeRange}
            onChange={setTimeRange}
            className="w-40"
            icon={<Calendar size={18} />}
          />
        </div>
        
        <Button
          variant="secondary"
          icon={<Download size={18} />}
        >
          Exportar Relatório
        </Button>
      </div>
      
      {reportType === 'sales' ? renderSalesReport() : renderProductReport()}
    </Layout>
  );
};

export default Reports;