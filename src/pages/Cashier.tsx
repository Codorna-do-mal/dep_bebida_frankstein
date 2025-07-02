import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { cashRegister as initialCashRegister, sales } from '../data/mockData';
import { DollarSign, TrendingUp, TrendingDown, RotateCcw, CheckCircle, X as CloseIcon } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';

const Cashier: React.FC = () => {
  const [cashRegister, setCashRegister] = useState(initialCashRegister);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<'cashin' | 'cashout'>('cashin');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [closingAmount, setClosingAmount] = useState('');
  
  const { user } = useAuthStore();
  
  const handleAddTransaction = () => {
    if (!transactionAmount || parseFloat(transactionAmount) <= 0 || !transactionDescription) {
      return;
    }
    
    const amount = parseFloat(transactionAmount);
    
    if (transactionType === 'cashin') {
      setCashRegister({
        ...cashRegister,
        cashIn: cashRegister.cashIn + amount
      });
    } else {
      setCashRegister({
        ...cashRegister,
        cashOut: cashRegister.cashOut + amount
      });
    }
    
    setTransactionAmount('');
    setTransactionDescription('');
    setIsAddingTransaction(false);
  };
  
  const handleCloseCashRegister = () => {
    if (!closingAmount) {
      return;
    }
    
    setCashRegister({
      ...cashRegister,
      status: 'closed',
      closedAt: new Date().toISOString(),
      finalAmount: parseFloat(closingAmount)
    });
    
    setIsClosing(false);
  };
  
  const resetCashRegister = () => {
    setCashRegister({
      ...initialCashRegister,
      openedAt: new Date().toISOString(),
      employeeId: user?.id || '',
      employeeName: user?.name || ''
    });
  };
  
  const calculateExpectedAmount = () => {
    return cashRegister.initialAmount + cashRegister.sales + cashRegister.cashIn - cashRegister.cashOut;
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  return (
    <Layout title="Caixa">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash register info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Status do Caixa</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                cashRegister.status === 'open'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {cashRegister.status === 'open' ? 'Aberto' : 'Fechado'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 mb-1">Aberto em</p>
                <p className="text-lg">{new Date(cashRegister.openedAt).toLocaleString('pt-BR')}</p>
                <p className="text-sm text-gray-500">por {cashRegister.employeeName}</p>
              </div>
              
              {cashRegister.status === 'closed' && cashRegister.closedAt && (
                <div>
                  <p className="text-gray-400 mb-1">Fechado em</p>
                  <p className="text-lg">{new Date(cashRegister.closedAt).toLocaleString('pt-BR')}</p>
                </div>
              )}
            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flex items-center p-4 border-l-4 border-neon">
              <div className="bg-neon/20 p-3 rounded-full mr-4">
                <DollarSign size={24} className="text-neon" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Valor Inicial</p>
                <p className="text-xl font-bold">{formatCurrency(cashRegister.initialAmount)}</p>
              </div>
            </Card>
            
            <Card className="flex items-center p-4 border-l-4 border-blue-500">
              <div className="bg-blue-500/20 p-3 rounded-full mr-4">
                <TrendingUp size={24} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Vendas</p>
                <p className="text-xl font-bold">{formatCurrency(cashRegister.sales)}</p>
              </div>
            </Card>
            
            <Card className="flex items-center p-4 border-l-4 border-green-500">
              <div className="bg-green-500/20 p-3 rounded-full mr-4">
                <TrendingUp size={24} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Entradas</p>
                <p className="text-xl font-bold">{formatCurrency(cashRegister.cashIn)}</p>
              </div>
            </Card>
            
            <Card className="flex items-center p-4 border-l-4 border-red-500">
              <div className="bg-red-500/20 p-3 rounded-full mr-4">
                <TrendingDown size={24} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Saídas</p>
                <p className="text-xl font-bold">{formatCurrency(cashRegister.cashOut)}</p>
              </div>
            </Card>
          </div>
          
          <Card>
            <h2 className="text-xl font-bold mb-4">Resumo do Caixa</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Valor Inicial</span>
                <span>{formatCurrency(cashRegister.initialAmount)}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Vendas</span>
                <span className="text-green-400">+ {formatCurrency(cashRegister.sales)}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Entradas</span>
                <span className="text-green-400">+ {formatCurrency(cashRegister.cashIn)}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Saídas</span>
                <span className="text-red-400">- {formatCurrency(cashRegister.cashOut)}</span>
              </div>
              
              <div className="border-t border-dark-lighter pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span>Total em Caixa</span>
                  <span className="text-neon text-xl">{formatCurrency(calculateExpectedAmount())}</span>
                </div>
              </div>
              
              {cashRegister.status === 'closed' && cashRegister.finalAmount !== undefined && (
                <>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Valor Fechamento</span>
                    <span>{formatCurrency(cashRegister.finalAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Diferença</span>
                    <span className={`${
                      cashRegister.finalAmount === calculateExpectedAmount()
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      {formatCurrency(cashRegister.finalAmount - calculateExpectedAmount())}
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
        
        {/* Actions and transactions */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold mb-4">Ações</h2>
            
            {cashRegister.status === 'open' ? (
              <div className="space-y-3">
                <Button
                  fullWidth
                  onClick={() => setIsAddingTransaction(true)}
                  disabled={isClosing}
                  icon={<DollarSign size={18} />}
                >
                  Registrar Transação
                </Button>
                
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => setIsClosing(true)}
                  disabled={isAddingTransaction}
                  icon={<CheckCircle size={18} />}
                >
                  Fechar Caixa
                </Button>
              </div>
            ) : (
              <Button
                fullWidth
                onClick={resetCashRegister}
                icon={<RotateCcw size={18} />}
              >
                Abrir Novo Caixa
              </Button>
            )}
          </Card>
          
          {isAddingTransaction && (
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Registrar Transação</h3>
                <Button
                  variant="ghost"
                  onClick={() => setIsAddingTransaction(false)}
                  icon={<CloseIcon size={18} />}
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
              
              <div className="space-y-4">
                <Select
                  label="Tipo de Transação"
                  options={[
                    { value: 'cashin', label: 'Entrada (Reforço)' },
                    { value: 'cashout', label: 'Saída (Sangria)' }
                  ]}
                  value={transactionType}
                  onChange={(value) => setTransactionType(value as 'cashin' | 'cashout')}
                  fullWidth
                />
                
                <Input
                  label="Valor (R$)"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  fullWidth
                  required
                />
                
                <Input
                  label="Descrição"
                  value={transactionDescription}
                  onChange={(e) => setTransactionDescription(e.target.value)}
                  placeholder="Motivo da transação"
                  fullWidth
                  required
                />
                
                <Button
                  fullWidth
                  onClick={handleAddTransaction}
                  disabled={!transactionAmount || parseFloat(transactionAmount) <= 0 || !transactionDescription}
                >
                  Registrar
                </Button>
              </div>
            </Card>
          )}
          
          {isClosing && (
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Fechar Caixa</h3>
                <Button
                  variant="ghost"
                  onClick={() => setIsClosing(false)}
                  icon={<CloseIcon size={18} />}
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-dark-lighter rounded-lg">
                  <p className="text-sm mb-1">Valor esperado em caixa:</p>
                  <p className="text-lg font-bold text-neon">{formatCurrency(calculateExpectedAmount())}</p>
                </div>
                
                <Input
                  label="Valor em caixa (R$)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={closingAmount}
                  onChange={(e) => setClosingAmount(e.target.value)}
                  fullWidth
                  required
                />
                
                {closingAmount && parseFloat(closingAmount) !== calculateExpectedAmount() && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-400">
                      Diferença: {formatCurrency(parseFloat(closingAmount) - calculateExpectedAmount())}
                    </p>
                    <p className="text-xs text-red-400 mt-1">
                      O valor informado não corresponde ao valor esperado em caixa.
                    </p>
                  </div>
                )}
                
                <Button
                  fullWidth
                  onClick={handleCloseCashRegister}
                  disabled={!closingAmount}
                >
                  Confirmar Fechamento
                </Button>
              </div>
            </Card>
          )}
          
          <Card title="Vendas Recentes">
            <div className="space-y-3">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-dark-lighter rounded-lg">
                  <div>
                    <p className="text-sm">{format(new Date(sale.date), 'HH:mm')}</p>
                    <p className="text-xs text-gray-400">{sale.items.length} itens</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neon">{formatCurrency(sale.finalAmount)}</p>
                    <p className="text-xs capitalize">{sale.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Cashier;