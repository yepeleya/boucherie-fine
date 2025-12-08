'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  ShoppingCartIcon, 
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ClockIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface CartItem {
  id: number;
  nom: string;
  prix: number;
  quantite: number;
  imageUrl?: string;
  categorieId: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onCheckout: () => void;
  isLoading?: boolean;
}

export default function ModernCart({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  isLoading = false 
}: CartProps) {
  const [deliveryFee] = useState(1000);
  const [packagingFee] = useState(300);
  const [minOrderAmount] = useState(5000);

  const subtotal = items.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
  const total = subtotal + (subtotal >= minOrderAmount ? deliveryFee + packagingFee : 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantite, 0);
  
  const isMinOrderMet = subtotal >= minOrderAmount;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Cart Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-white z-50 shadow-2xl overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C8102E] to-[#A50E26] p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <ShoppingCartIcon className="w-6 h-6" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-white text-[#C8102E] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold">Mon Panier</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-gray-500">
                  <ShoppingCartIcon className="w-16 h-16 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Panier vide</h3>
                  <p className="text-center">Ajoutez des produits pour commencer</p>
                </div>
              ) : (
                <div className="p-4">
                  {/* Minimum Order Warning */}
                  {!isMinOrderMet && (
                      <motion.div
                        className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-5 h-5 text-orange-600" />
                          <p className="text-sm text-orange-800">
                            <span className="font-semibold">
                              {(minOrderAmount - subtotal).toLocaleString()} FCFA
                            </span> de plus pour commander
                          </p>
                        </div>
                      </motion.div>
                  )}

                  {/* Cart Items */}
                  <div className="space-y-3 mb-6">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start space-x-3">
                          <Image
                            src={item.imageUrl || '/api/placeholder/60/60'}
                            alt={item.nom}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded-lg"
                            unoptimized={!item.imageUrl}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm leading-tight">
                              {item.nom}
                            </h4>
                            <p className="text-[#FF7A00] font-bold text-sm mt-1">
                              {item.prix.toLocaleString()} FCFA
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantite - 1)}
                              className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="font-semibold text-sm w-6 text-center">
                              {item.quantite}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantite + 1)}
                              className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-100 rounded-full transition-colors ml-2"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total</span>
                      <span>{subtotal.toLocaleString()} FCFA</span>
                    </div>
                    
                    {isMinOrderMet && (
                      <>
                        <div className="flex justify-between text-sm items-center">
                          <div className="flex items-center space-x-1">
                            <TruckIcon className="w-4 h-4" />
                            <span>Livraison</span>
                          </div>
                          <span>{deliveryFee.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Emballage</span>
                          <span>{packagingFee.toLocaleString()} FCFA</span>
                        </div>
                      </>
                    )}
                    
                    <hr className="border-gray-200" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-[#C8102E] font-bold">
                        {isMinOrderMet ? total.toLocaleString() : subtotal.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t bg-white p-4">
                <button
                  onClick={onCheckout}
                  disabled={!isMinOrderMet || isLoading}
                  className={`w-full py-4 rounded-lg font-bold text-white transition-all duration-300 ${
                    isMinOrderMet && !isLoading
                      ? 'bg-gradient-to-r from-[#C8102E] to-[#A50E26] hover:shadow-lg transform hover:scale-105 border border-white/20'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Commande en cours...</span>
                    </div>
                  ) : isMinOrderMet ? (
                    `Commander • ${total.toLocaleString()} FCFA`
                  ) : (
                    'Montant minimum requis'
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}