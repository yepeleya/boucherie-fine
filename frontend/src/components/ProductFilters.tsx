'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Category {
  id: number;
  nom: string;
  description?: string;
  imageUrl?: string;
  actif: boolean;
  ordre: number;
}

interface FiltersProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
}

export default function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  priceRange,
  onPriceRangeChange,
  maxPrice
}: FiltersProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('viande')) return '🥩';
    if (name.includes('charcuterie')) return '🥓';
    if (name.includes('plat')) return '🍽️';
    if (name.includes('boisson')) return '🥤';
    if (name.includes('dessert')) return '🍰';
    return '🏪';
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <motion.div
          className={`relative transition-all duration-300 ${
            searchFocused ? 'transform scale-105' : ''
          }`}
        >
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-12 pr-10 py-4 bg-white rounded-2xl border-2 border-gray-100 focus:border-[#FF7A00] focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={() => onSearchChange('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-gray-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Category Filters */}
      <div>
        <h3 className="font-bold text-[#0e0e0e] mb-4 text-lg">Catégories</h3>
        <div className="space-y-2">
          {/* All Categories Button */}
          <motion.button
            onClick={() => onCategoryChange(null)}
            className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-[#C8102E] to-[#A50E26] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl">🏪</span>
            <span className="font-semibold">Tous les produits</span>
            <div className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full">
              {categories.reduce((sum, cat) => sum + (cat.actif ? 1 : 0), 0)}
            </div>
          </motion.button>

          {/* Category Buttons */}
          {categories
            .filter(cat => cat.actif)
            .sort((a, b) => a.ordre - b.ordre)
            .map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[#C8102E] to-[#A50E26] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">{getCategoryIcon(category.nom)}</span>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{category.nom}</div>
                  {category.description && (
                    <div className="text-xs opacity-75 mt-1">{category.description}</div>
                  )}
                </div>
              </motion.button>
            ))
          }
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="font-bold text-[#0e0e0e] mb-4 text-lg">Prix</h3>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-semibold text-gray-800">
              <span className="bg-gray-100 px-2 py-1 rounded-lg text-[#C8102E]">{priceRange[0].toLocaleString()} FCFA</span>
              <span className="bg-gray-100 px-2 py-1 rounded-lg text-[#C8102E]">{priceRange[1].toLocaleString()} FCFA</span>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div
                className="absolute top-0 h-2 bg-gradient-to-r from-[#C8102E] to-[#A50E26] rounded-lg pointer-events-none shadow-sm"
                style={{
                  width: `${(priceRange[1] / maxPrice) * 100}%`
                }}
              />
            </div>

            <div className="flex space-x-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Prix minimum</label>
                <input
                  type="number"
                  placeholder="0"
                  value={priceRange[0]}
                  onChange={(e) => onPriceRangeChange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 transition-all duration-200"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Prix maximum</label>
                <input
                  type="number"
                  placeholder={maxPrice.toString()}
                  value={priceRange[1]}
                  onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Reset Price Filter */}
            {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <motion.button
                onClick={() => onPriceRangeChange([0, maxPrice])}
                className="w-full py-3 px-4 text-sm font-semibold text-[#C8102E] bg-[#C8102E]/5 hover:bg-[#C8102E]/10 hover:text-[#A50E26] border border-[#C8102E]/20 hover:border-[#C8102E]/40 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>🔄</span>
                <span>Réinitialiser le prix</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      <AnimatePresence>
        {(selectedCategory !== null || searchQuery || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-700 text-sm">Filtres actifs</h4>
              <button
                onClick={() => {
                  onCategoryChange(null);
                  onSearchChange('');
                  onPriceRangeChange([0, maxPrice]);
                }}
                className="text-xs font-semibold text-gray-600 hover:text-[#C8102E] bg-gray-100 hover:bg-[#C8102E]/5 px-2 py-1 rounded-md transition-all duration-200"
              >
                Tout effacer
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== null && (
                <span className="inline-flex items-center space-x-1 bg-[#C8102E] text-white px-2 py-1 rounded-full text-xs">
                  <span>{categories.find(c => c.id === selectedCategory)?.nom}</span>
                  <button onClick={() => onCategoryChange(null)}>
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {searchQuery && (
                <span className="inline-flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <button onClick={() => onSearchChange('')}>
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <span className="inline-flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  <span>{priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} FCFA</span>
                  <button onClick={() => onPriceRangeChange([0, maxPrice])}>
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}