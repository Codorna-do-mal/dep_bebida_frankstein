import React from 'react';
import { Plus } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import type { Product } from '../../services/database';

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
    // Convert database product to cart format
    const cartProduct = {
      id: product.id,
      name: product.name,
      category: product.category_name || '',
      price: product.price,
      cost: product.cost,
      description: product.description || '',
      imageUrl: product.image_url || '',
      barcode: product.barcode || '',
      volume: product.volume || '',
      stockQuantity: product.stock_quantity,
      minStockQuantity: product.min_stock_quantity
    };
    
    addItem(cartProduct, 1);
  };
  
  return (
    <div className="bg-dark-light rounded-lg overflow-hidden shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg">
      <div className="relative pb-[70%]">
        <img
          src={product.image_url || ''}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {product.stock_quantity <= product.min_stock_quantity && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Estoque baixo
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-white truncate">{product.name}</h3>
        <p className="text-sm text-gray-400 truncate">{product.volume} • {product.category_name}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-neon">{formatPrice(product.price)}</span>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            className="bg-neon/20 hover:bg-neon/30 text-neon p-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Adicionar ao carrinho"
          >
            <Plus size={18} />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          Estoque: {product.stock_quantity}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;