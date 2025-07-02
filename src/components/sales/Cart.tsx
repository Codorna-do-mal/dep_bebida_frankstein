import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, X } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import Button from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { format } from 'date-fns';
import { paymentMethods } from '../../data/mockData';

interface CartProps {
  onCheckout: (saleData: any) => void;
}

const Cart: React.FC<CartProps> = ({ onCheckout }) => {
  const { items, removeItem, updateQuantity, clearCart, totalAmount } = useCartStore();
  const { user } = useAuthStore();
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [cashReceived, setCashReceived] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  const handleUpdateQuantity = (id: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQty);
    }
  };
  
  const handleCheckout = () => {
    const finalAmount = totalAmount() - discount;
    
    const saleData = {
      id: Date.now().toString(),
      items: items.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      })),
      totalAmount: totalAmount(),
      discount,
      finalAmount,
      paymentMethod,
      change: paymentMethod === 'dinheiro' ? parseFloat(cashReceived) - finalAmount : undefined,
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      employeeId: user?.id || '',
      employeeName: user?.name || ''
    };
    
    onCheckout(saleData);
    clearCart();
    setDiscount(0);
    setCashReceived('');
    setIsCheckoutOpen(false);
  };
  
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setDiscount(Math.min(value, totalAmount()));
  };
  
  const handleCashReceivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCashReceived(e.target.value);
  };
  
  const getChange = () => {
    if (paymentMethod !== 'dinheiro' || !cashReceived) return 0;
    const change = parseFloat(cashReceived) - (totalAmount() - discount);
    return change > 0 ? change : 0;
  };
  
  return (
    <div className="bg-dark-light rounded-xl shadow-lg h-full flex flex-col">
      <div className="p-4 border-b border-dark-lighter flex items-center">
        <ShoppingCart className="text-neon mr-2" size={20} />
        <h2 className="text-lg font-medium">Carrinho</h2>
        {items.length > 0 && (
          <span className="ml-auto text-sm bg-neon text-dark-light rounded-full px-2 py-0.5">
            {items.reduce((total, item) => total + item.quantity, 0)}
          </span>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-400">
          <ShoppingCart size={48} className="mb-2 opacity-30" />
          <p className="text-center">O carrinho está vazio</p>
          <p className="text-center text-sm mt-1">Adicione produtos para iniciar uma venda</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-dark-lighter rounded-lg p-3 flex items-center">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.name}</h3>
                  <p className="text-sm text-gray-400">{formatPrice(item.price)} cada</p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                    className="bg-dark hover:bg-dark-light p-1 rounded"
                  >
                    <Minus size={16} />
                  </button>
                  
                  <span className="w-8 text-center">{item.quantity}</span>
                  
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                    className="bg-dark hover:bg-dark-light p-1 rounded"
                  >
                    <Plus size={16} />
                  </button>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-2 text-red-500 hover:text-red-400 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-dark-lighter space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(totalAmount())}</span>
            </div>
            
            {isCheckoutOpen && (
              <>
                <div className="flex items-center justify-between">
                  <span>Desconto</span>
                  <div className="flex items-center">
                    <span className="mr-2">R$</span>
                    <input
                      type="number"
                      min="0"
                      max={totalAmount()}
                      value={discount || ''}
                      onChange={handleDiscountChange}
                      className="w-20 bg-dark-lighter border border-dark-light rounded px-2 py-1 text-right"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-neon text-lg">
                    {formatPrice(totalAmount() - discount)}
                  </span>
                </div>
                
                <div className="pt-2">
                  <label className="block text-sm mb-1">Forma de pagamento</label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        className={`py-2 px-3 rounded-lg text-center text-sm ${
                          paymentMethod === method.id
                            ? 'bg-neon text-dark font-medium'
                            : 'bg-dark-lighter hover:bg-dark-light'
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        {method.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {paymentMethod === 'dinheiro' && (
                  <div className="pt-2">
                    <label className="block text-sm mb-1">Valor recebido (R$)</label>
                    <input
                      type="number"
                      min={totalAmount() - discount}
                      value={cashReceived}
                      onChange={handleCashReceivedChange}
                      className="w-full bg-dark-lighter border border-dark-light rounded px-3 py-2"
                    />
                    
                    {parseFloat(cashReceived) >= (totalAmount() - discount) && (
                      <div className="mt-2 p-2 bg-dark-lighter rounded-lg text-right">
                        <span className="block text-sm">Troco:</span>
                        <span className="text-neon font-medium">
                          {formatPrice(getChange())}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    onClick={handleCheckout}
                    className="flex-1"
                    disabled={
                      paymentMethod === 'dinheiro' &&
                      (parseFloat(cashReceived) < (totalAmount() - discount) || !cashReceived)
                    }
                  >
                    Finalizar
                  </Button>
                </div>
              </>
            )}
            
            {!isCheckoutOpen && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => clearCart()}
                  icon={<X size={16} />}
                >
                  Limpar
                </Button>
                
                <Button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="flex-1"
                  icon={<ShoppingCart size={16} />}
                >
                  Checkout
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;