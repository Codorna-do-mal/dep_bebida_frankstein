import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Search, Plus, Edit, Trash2, ImageIcon, Save, X } from 'lucide-react';
import { products as mockProducts, categories } from '../data/mockData';
import { Product } from '../types';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  const initialNewProduct: Product = {
    id: '',
    name: '',
    category: categories[0],
    price: 0,
    cost: 0,
    description: '',
    imageUrl: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    volume: '',
    barcode: '',
    stockQuantity: 0,
    minStockQuantity: 0
  };
  
  const [newProduct, setNewProduct] = useState<Product>(initialNewProduct);
  
  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(search));
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  const categoryOptions = [
    { value: '', label: 'Todas as categorias' },
    ...categories.map(category => ({ value: category, label: category }))
  ];
  
  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
    } else if (isAddingProduct) {
      const id = Date.now().toString();
      setProducts([{ ...newProduct, id }, ...products]);
      setNewProduct(initialNewProduct);
      setIsAddingProduct(false);
    }
  };
  
  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  const renderProductForm = (product: Product, isNew = false) => {
    const updateProduct = (field: keyof Product, value: any) => {
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
            options={categories.map(c => ({ value: c, label: c }))}
            value={product.category}
            onChange={(value) => updateProduct('category', value)}
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
            value={product.stockQuantity}
            onChange={(e) => updateProduct('stockQuantity', parseInt(e.target.value) || 0)}
            fullWidth
            required
          />
          
          <Input
            label="Estoque Mínimo"
            type="number"
            min="0"
            value={product.minStockQuantity}
            onChange={(e) => updateProduct('minStockQuantity', parseInt(e.target.value) || 0)}
            fullWidth
            required
          />
          
          <div className="md:col-span-2">
            <Input
              label="Descrição"
              value={product.description}
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
                value={product.imageUrl}
                onChange={(e) => updateProduct('imageUrl', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                fullWidth
              />
              <div className="h-12 w-12 bg-dark-lighter rounded flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
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
            disabled={!product.name || product.price <= 0 || product.stockQuantity < 0}
          >
            Salvar
          </Button>
        </div>
      </Card>
    );
  };
  
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
                          src={product.imageUrl}
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
                  <td className="px-4 py-3 text-sm">{product.category}</td>
                  <td className="px-4 py-3 text-sm font-medium text-neon">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      <span className={product.stockQuantity <= product.minStockQuantity ? 'text-red-500' : ''}>
                        {product.stockQuantity}
                      </span>
                      {product.stockQuantity <= product.minStockQuantity && (
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