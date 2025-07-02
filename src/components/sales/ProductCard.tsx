import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../stores/cartStore';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  const handleAddToCart = () => {
    addItem(product, 1);
  };
  
  return (
    <div className="bg-dark-light rounded-lg overflow-hidden shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg">
      <div className="relative pb-[70%]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {product.stockQuantity <= product.minStockQuantity && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Estoque baixo
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-white truncate">{product.name}</h3>
        <p className="text-sm text-gray-400 truncate">{product.volume} • {product.category}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-neon">{formatPrice(product.price)}</span>
          
          <button
            onClick={handleAddToCart}
            className="bg-neon/20 hover:bg-neon/30 text-neon p-1.5 rounded-full transition-colors"
            title="Adicionar ao carrinho"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;