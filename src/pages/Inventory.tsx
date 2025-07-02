import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Search, ArrowUp, ArrowDown, Plus, X } from 'lucide-react';
import { products, stockMovements as mockMovements } from '../data/mockData';
import { StockMovement } from '../types';
import { useAuthStore } from '../stores/authStore';

const Inventory: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isAddingMovement, setIsAddingMovement] = useState(false);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(mockMovements);
  
  const { user } = useAuthStore();
  
  const [newMovement, setNewMovement] = useState<Partial<StockMovement>>({
    productId: '',
    type: 'in',
    quantity: 1,
    reason: '',
  });
  
  // Filter movements based on search, product, and type
  const filteredMovements = stockMovements.filter((movement) => {
    const matchesSearch = movement.productName.toLowerCase().includes(search.toLowerCase());
    const matchesProduct = selectedProduct ? movement.productId === selectedProduct : true;
    const matchesType = selectedType ? movement.type === selectedType : true;
    
    return matchesSearch && matchesProduct && matchesType;
  });
  
  const productOptions = [
    { value: '', label: 'Todos os produtos' },
    ...products.map(product => ({ value: product.id, label: product.name }))
  ];
  
  const typeOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'in', label: 'Entrada' },
    { value: 'out', label: 'Saída' }
  ];
  
  const handleAddMovement = () => {
    if (!newMovement.productId || !newMovement.quantity || !newMovement.reason) {
      return;
    }
    
    const product = products.find(p => p.id === newMovement.productId);
    
    if (!product) {
      return;
    }
    
    const movement: StockMovement = {
      id: Date.now().toString(),
      productId: newMovement.productId,
      productName: product.name,
      type: newMovement.type as 'in' | 'out',
      quantity: newMovement.quantity as number,
      reason: newMovement.reason as string,
      date: new Date().toISOString(),
      employeeId: user?.id || '',
    };
    
    setStockMovements([movement, ...stockMovements]);
    setNewMovement({
      productId: '',
      type: 'in',
      quantity: 1,
      reason: '',
    });
    setIsAddingMovement(false);
  };
  
  return (
    <Layout title="Estoque">
      {isAddingMovement && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Registrar Movimentação de Estoque</h3>
            <Button
              variant="ghost"
              onClick={() => setIsAddingMovement(false)}
              icon={<X size={18} />}
              size="sm"
            >
              Cancelar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Select
              label="Produto"
              options={products.map(p => ({ value: p.id, label: p.name }))}
              value={newMovement.productId}
              onChange={(value) => setNewMovement({ ...newMovement, productId: value })}
              fullWidth
              required
            />
            
            <Select
              label="Tipo de Movimentação"
              options={[
                { value: 'in', label: 'Entrada' },
                { value: 'out', label: 'Saída' }
              ]}
              value={newMovement.type}
              onChange={(value) => setNewMovement({ ...newMovement, type: value as 'in' | 'out' })}
              fullWidth
              required
            />
            
            <Input
              label="Quantidade"
              type="number"
              min="1"
              value={newMovement.quantity}
              onChange={(e) => setNewMovement({ ...newMovement, quantity: parseInt(e.target.value) || 1 })}
              fullWidth
              required
            />
            
            <Input
              label="Motivo"
              value={newMovement.reason}
              onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
              placeholder="Ex: Compra, Venda, Ajuste"
              fullWidth
              required
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleAddMovement} 
              disabled={!newMovement.productId || !newMovement.quantity || !newMovement.reason}
            >
              Registrar
            </Button>
          </div>
        </Card>
      )}
      
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <Input
              placeholder="Buscar por produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} />}
              fullWidth
            />
            
            <Select
              options={productOptions}
              value={selectedProduct}
              onChange={setSelectedProduct}
              className="sm:w-60"
            />
            
            <Select
              options={typeOptions}
              value={selectedType}
              onChange={setSelectedType}
              className="sm:w-40"
            />
          </div>
          
          <Button
            onClick={() => setIsAddingMovement(true)}
            icon={<Plus size={18} />}
            disabled={isAddingMovement}
          >
            Nova Movimentação
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-lighter">
                <th className="px-4 py-2 text-left font-medium text-gray-400">Data</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Produto</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Tipo</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Quantidade</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((movement) => (
                <tr key={movement.id} className="border-b border-dark-lighter hover:bg-dark-lighter">
                  <td className="px-4 py-3 text-sm">
                    {new Date(movement.date).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">{movement.productName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      movement.type === 'in' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {movement.type === 'in' ? (
                        <><ArrowUp size={12} className="mr-1" />Entrada</>
                      ) : (
                        <><ArrowDown size={12} className="mr-1" />Saída</>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {movement.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {movement.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMovements.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="mb-2">Nenhuma movimentação encontrada</p>
              <p className="text-sm">Tente ajustar os filtros de busca ou registre uma nova movimentação</p>
            </div>
          )}
        </div>
      </Card>
    </Layout>
  );
};

export default Inventory;