'use client';

import { motion } from 'framer-motion';
import { PlusIcon, HeartIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';

interface Product {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  imageUrl?: string;
  disponible: boolean;
  stock?: number;
  categorieId: number;
  poids?: number;
  unite?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  index?: number;
}

export default function ProductCard({ product, onAddToCart, index = 0 }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!product.disponible || isAdding) return;
    
    setIsAdding(true);
    // Animation d'ajout au panier sans délai
    onAddToCart(product);
    // Petit délai pour l'animation visuelle
    await new Promise(resolve => setTimeout(resolve, 200));
    setIsAdding(false);
  };

  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 group"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Image
          src={product.imageUrl || '/api/placeholder/400/300'}
          alt={product.nom}
          width={400}
          height={300}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          unoptimized={!product.imageUrl}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Price Badge */}
        <div className="absolute top-3 left-3">
          <div className="bg-gradient-to-r from-[#C8102E] to-[#A50E26] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {product.prix.toLocaleString()} FCFA
          </div>
        </div>

        {/* Like Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 transform hover:scale-110"
        >
          {isLiked ? (
            <HeartIconSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Stock Status */}
        {!product.disponible && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              Indisponible
            </div>
          </div>
        )}

        {product.stock && product.stock < 5 && product.disponible && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-amber-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Plus que {product.stock} en stock
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-[#0e0e0e] leading-tight">
            {product.nom}
          </h3>
          {product.poids && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
              {product.poids}{product.unite || 'kg'}
            </span>
          )}
        </div>
        
        {product.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Add to Cart Button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={!product.disponible || isAdding}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            product.disponible && !isAdding
              ? 'bg-gradient-to-r from-[#C8102E] to-[#A50E26] text-white hover:shadow-lg transform hover:scale-105 active:scale-95 border border-white/20'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {isAdding ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Ajout...</span>
            </div>
          ) : (
            <>
              <PlusIcon className="w-5 h-5" />
              <span>Ajouter au panier</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 border-2 border-[#C8102E] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      />
    </motion.div>
  );
}

// Skeleton pour le chargement
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-6">
        <div className="h-4 bg-gray-200 rounded mb-3" />
        <div className="h-3 bg-gray-200 rounded mb-2" />
        <div className="h-3 bg-gray-200 rounded mb-4 w-2/3" />
        <div className="h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}