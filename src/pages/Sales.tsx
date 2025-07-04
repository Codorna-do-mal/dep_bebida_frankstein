import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Search, Filter, CheckCircle } from 'lucide-react';
import { productsService, categoriesService, type Product, type Category } from '../services/database';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import ProductCard from '../components/sales/ProductCard';
import Cart from '../components/sales/Cart';

const Sales: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productsService.getAll(),
        categoriesService.getAll()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(search));
    const matchesCategory = selectedCategory ? product.category_id === selectedCategory : true;
    
    return matchesSearch && matchesCategory && product.stock_quantity > 0;
  });
  
  const categoryOptions = [
    { value: '', label: 'Todas as categorias' },
    ...categories.map(category => ({ value: category.id, label: category.name }))
  ];
  
  const handleSaleComplete = () => {
    setShowSuccessMessage(true);
    
    // Reload products to update stock
    loadData();
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };
  
  if (loading) {
    return (
      <Layout title="Vendas">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Vendas">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-9rem)]">
        {/* Products section */}
        <div className="lg:col-span-2 flex flex-col h-full">
          {/* Success message */}
          {showSuccessMessage && (
            <div className="bg-green-900/20 border border-green-900/30 rounded-lg p-3 mb-4 flex items-center">
              <CheckCircle className="text-green-500 mr-2" size={20} />
              <span className="text-green-500">Venda finalizada com sucesso!</span>
            </div>
          )}
          
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Input
              placeholder="Buscar produto ou código de barras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} />}
              fullWidth
            />
            
            <Select
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              icon={<Filter size={18} />}
              className="sm:w-60"
            />
          </div>
          
          {/* Products grid */}
          <div className="flex-1 overflow-y-auto pr-2">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p className="mb-2">Nenhum produto encontrado</p>
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Cart section */}
        <div className="h-full">
          <Cart onCheckout={handleSaleComplete} />
        </div>
      </div>
    </Layout>
  );
};

export default Sales;