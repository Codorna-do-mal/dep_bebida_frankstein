import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Search, Plus, Edit, Trash2, ImageIcon, Save, X } from 'lucide-react';
import { productsService, categoriesService, type Product, type Category } from '../services/database';
import { useAuthStore } from '../stores/authStore';

const Products: React.FC = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const initialNewProduct = {
    name: '',
    category_id: '',
    price: 0,
    cost: 0,
    description: '',
    image_url: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    volume: '',
    barcode: '',
    stock_quantity: 0,
    min_stock_quantity: 0
  };
  
  const [newProduct, setNewProduct] = useState(initialNewProduct);
  
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
    
    return matchesSearch && matchesCategory;
  });
  
  const categoryOptions = [
    { value: '', label: 'Todas as categorias' },
    ...categories.map(category => ({ value: category.id, label: category.name }))
  ];
  
  const handleSaveProduct = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      if (editingProduct) {
        const updated = await productsService.update(editingProduct.id, {
          name: editingProduct.name,
          category_id: editingProduct.category_id,
          price: editingProduct.price,
          cost: editingProduct.cost,
          description: editingProduct.description,
          image_url: editingProduct.image_url,
          volume: editingProduct.volume,
          barcode: editingProduct.barcode,
          stock_quantity: editingProduct.stock_quantity,
          min_stock_quantity: editingProduct.min_stock_quantity
        });
        
        setProducts(products.map(p => p.id === updated.id ? { ...updated, category_name: categories.find(c => c.id === updated.category_id)?.name } : p));
        setEditingProduct(null);
      } else if (isAddingProduct) {
        const created = await productsService.create({
          ...newProduct,
          employee_id: user.id
        });
        
        const productWithCategory = {
          ...created,
          category_name: categories.find(c => c.id === created.category_id)?.name
        };
        
        setProducts([productWithCategory, ...products]);
        setNewProduct(initialNewProduct);
        setIsAddingProduct(false);
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      await productsService.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto. Tente novamente.');
    }
  };
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  const renderProductForm = (product: any, isNew = false) => {
    const updateProduct = (field: string, value: any) => {
      if (isNew) {
        setNewProduct({ ...newProduct, [field]: value });
      } else {
        setEditingProduct({ ...editingProduct!, [field]: value });
      }
    };
    
    return (
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {isNew ? 'Adicionar Produto' : 'Editar Produto'}
          </h3>
          <Button
            variant="ghost"
            onClick={() => {
              if (isNew) {
                setIsAddingProduct(false);
                setNewProduct(initialNewProduct);
              } else {
                setEditingProduct(null);
              }
            }}
            icon={<X size={18} />}
            size="sm"
          >
            Cancelar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Nome"
            value={product.name}
            onChange={(e) => updateProduct('name', e.target.value)}
            fullWidth
            required
          />
          
          <Select
            label="Categoria"
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            value={product.category_id}
            onChange={(value) => updateProduct('category_id', value)}
            fullWidth
            required
          />
          
          <Input
            label="Preço de Venda (R$)"
            type="number"
            min="0"
            step="0.01"
            value={product.price}
            onChange={(e) => updateProduct('price', parseFloat(e.target.value) || 0)}
            fullWidth
            required
          />
          
          <Input
            label="Custo (R$)"
            type="number"
            min="0"
            step="0.01"
            value={product.cost}
            onChange={(e) => updateProduct('cost', parseFloat(e.target.value) || 0)}
            fullWidth
            required
          />
          
          <Input
            label="Volume"
            value={product.volume || ''}
            onChange={(e) => updateProduct('volume', e.target.value)}
            placeholder="Ex: 350ml, 1L"
            fullWidth
          />
          
          <Input
            label="Código de Barras"
            value={product.barcode || ''}
            onChange={(e) => updateProduct('barcode', e.target.value)}
            fullWidth
          />
          
          <Input
            label="Quantidade em Estoque"
            type="number"
            min="0"
            value={product.stock_quantity}
            onChange={(e) => updateProduct('stock_quantity', parseInt(e.target.value) || 0)}
            fullWidth
            required
          />
          
          <Input
            label="Estoque Mínimo"
            type="number"
            min="0"
            value={product.min_stock_quantity}
            onChange={(e) => updateProduct('min_stock_quantity', parseInt(e.target.value) || 0)}
            fullWidth
            required
          />
          
          <div className="md:col-span-2">
            <Input
              label="Descrição"
              value={product.description || ''}
              onChange={(e) => updateProduct('description', e.target.value)}
              fullWidth
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              URL da Imagem
            </label>
            <div className="flex gap-3">
              <Input
                value={product.image_url || ''}
                onChange={(e) => updateProduct('image_url', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                fullWidth
              />
              <div className="h-12 w-12 bg-dark-lighter rounded flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon size={24} className="text-gray-500" />
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveProduct} 
            icon={<Save size={18} />}
            loading={saving}
            disabled={!product.name || product.price <= 0 || product.stock_quantity < 0 || !product.category_id}
          >
            Salvar
          </Button>
        </div>
      </Card>
    );
  };
  
  if (loading) {
    return (
      <Layout title="Produtos">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Produtos">
      {isAddingProduct && renderProductForm(newProduct, true)}
      {editingProduct && renderProductForm(editingProduct)}
      
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
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
              className="sm:w-60"
            />
          </div>
          
          <Button
            onClick={() => {
              setIsAddingProduct(true);
              setEditingProduct(null);
            }}
            icon={<Plus size={18} />}
            disabled={isAddingProduct || !!editingProduct}
          >
            Novo Produto
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-lighter">
                <th className="px-4 py-2 text-left font-medium text-gray-400">Produto</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Categoria</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Preço</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Estoque</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-dark-lighter hover:bg-dark-lighter">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded overflow-hidden mr-3">
                        <img
                          src={product.image_url || ''}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.volume}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{product.category_name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-neon">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      <span className={product.stock_quantity <= product.min_stock_quantity ? 'text-red-500' : ''}>
                        {product.stock_quantity}
                      </span>
                      {product.stock_quantity <= product.min_stock_quantity && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                          Baixo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1.5 bg-dark-lighter text-gray-400 hover:text-white rounded"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsAddingProduct(false);
                        }}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1.5 bg-dark-lighter text-gray-400 hover:text-red-500 rounded"
                        onClick={() => handleDeleteProduct(product.id)}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="mb-2">Nenhum produto encontrado</p>
              <p className="text-sm">Tente ajustar os filtros de busca ou adicione um novo produto</p>
            </div>
          )}
        </div>
      </Card>
    </Layout>
  );
};

export default Products;