'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ShoppingCartIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Kedjenou de Poulet',
    description: 'Poulet mijoté aux légumes dans la poterie traditionnelle',
    price: 6500,
    category: 'plats',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
  },
  {
    id: 2,
    name: 'Attiéké Poisson Grillé',
    description: 'Poisson grillé accompagné d\'attiéké et légumes',
    price: 7000,
    category: 'plats',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
  },
  {
    id: 3,
    name: 'Garba Complet',
    description: 'Attiéké, thon, œuf dur et légumes frais',
    price: 3500,
    category: 'plats',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400'
  },
  {
    id: 4,
    name: 'Jus de Gingembre',
    description: 'Boisson rafraîchissante au gingembre frais',
    price: 1500,
    category: 'boissons',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400'
  },
  {
    id: 5,
    name: 'Bissap',
    description: 'Infusion d\'hibiscus glacée, parfumée à la menthe',
    price: 1200,
    category: 'boissons',
    image: 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=400'
  },
  {
    id: 6,
    name: 'Alloco Royal',
    description: 'Bananes plantains frites avec sauce tomate épicée',
    price: 4000,
    category: 'entrees',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96a?w=400'
  }
];

export default function CommandesPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const categories = [
    { id: 'all', name: 'Tout', icon: '🍽️' },
    { id: 'entrees', name: 'Entrées', icon: '🥗' },
    { id: 'plats', name: 'Plats', icon: '🍛' },
    { id: 'boissons', name: 'Boissons', icon: '🥤' }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setOrderPlaced(true);
    setCart([]);
    setIsCheckingOut(false);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Header />
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md mx-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">Commande confirmée !</h2>
          <p className="text-gray-600 mb-6">
            Merci pour votre commande ! Vous recevrez un SMS de confirmation avec l&apos;heure de livraison.
          </p>
          <button
            onClick={() => setOrderPlaced(false)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
          >
            Nouvelle commande
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-r from-amber-600 to-red-600 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Commandes en ligne
          </motion.h1>
          <motion.p
            className="text-xl opacity-90 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Commandez vos plats préférés et faites-vous livrer ou venez les récupérer
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu des plats */}
          <div className="lg:col-span-2">
            {/* Filtres de catégories */}
            <div className="flex flex-wrap gap-4 mb-8">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-amber-100'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {/* Liste des plats */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1 rounded-full font-bold">
                      {item.price.toLocaleString()} FCFA
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.description}</p>
                    
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span>Ajouter au panier</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Panier */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-xl sticky top-24"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <ShoppingCartIcon className="w-6 h-6 text-amber-600" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Panier ({getTotalItems()})
                </h2>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🛒</div>
                  <p className="text-gray-500">Votre panier est vide</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-800 truncate">{item.name}</h4>
                          <p className="text-amber-600 font-bold text-sm">{item.price.toLocaleString()} FCFA</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                          >
                            <MinusIcon className="w-3 h-3" />
                          </button>
                          <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                          >
                            <PlusIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-100 rounded-full transition-colors"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-800">Total:</span>
                      <span className="text-xl font-bold text-amber-600">
                        {getTotalPrice().toLocaleString()} FCFA
                      </span>
                    </div>
                    
                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                    >
                      {isCheckingOut ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Commande en cours...
                        </div>
                      ) : (
                        'Commander maintenant'
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}