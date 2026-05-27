import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const navigate = useNavigate();

  const handleProductClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/products/${product.id}`);
  };

  // Render star ratings
  const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className="flex items-center">
      <span className="text-yellow-500">{'★'.repeat(fullStars)}</span>
      {halfStar && <span className="text-yellow-500">☆</span>}
      <span className="text-gray-400">{'☆'.repeat(emptyStars)}</span>
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
    </div>
  );
};
  return (
    <div 
      className="bg-white border border-cyan-100 rounded-2xl shadow-sm p-4 max-w-sm cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleProductClick}
    >
      {/* Product Image with Discount Badge */}
      <div className="relative mb-4 rounded-xl overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-xl"
        />
        {product.discount && (
          <div className="absolute top-3 left-3 bg-[#0d4f5c] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {product.discount}% OFF
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
        <p className="text-sm text-slate-500">{product.category}</p>
        <p className="text-sm text-slate-500">{product.use}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {renderStars(product.rating)}
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${product.stock === false ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {product.stock === false ? 'Out of Stock' : 'In Stock'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-2xl font-bold text-[#0d4f5c]">
              KES{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <div className="text-sm text-slate-500 line-through mt-1">
                KES{product.originalPrice.toFixed(2)}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(product);
          }}
          className="w-full bg-[#0d4f5c] text-white py-2 px-4 rounded-xl hover:bg-[#164e63] transition"
          disabled={product.stock === false}
        >
          {product.stock === false ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};