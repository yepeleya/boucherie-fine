'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import ModernCart from '@/components/ModernCart';
import CheckoutModal from '@/components/CheckoutModal';
import { ToastContainer, useToast } from '@/components/Toast';
import { ShoppingCartIcon, SparklesIcon } from '@heroicons/react/24/outline';

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

interface Category {
  id: number;
  nom: string;
  description?: string;
  imageUrl?: string;
  actif: boolean;
  ordre: number;
}

interface CartItem {
  id: number;
  nom: string;
  prix: number;
  quantite: number;
  imageUrl?: string;
  categorieId: number;
}

export default function CommandesPage() {
  // États principaux
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // États des modales et UI
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // États des filtres
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  // Toast notifications
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();

  // Données factices pour le développement (à remplacer par des appels API)
  const mockCategories: Category[] = [
    { id: 1, nom: 'Viandes Fraîches', description: 'Viandes de qualité premium', actif: true, ordre: 1 },
    { id: 2, nom: 'Charcuteries', description: 'Saucissons, pâtés et terrines', actif: true, ordre: 2 },
    { id: 3, nom: 'Plats Préparés', description: 'Plats cuisinés maison', actif: true, ordre: 3 },
    { id: 4, nom: 'Accompagnements', description: 'Légumes et féculents', actif: true, ordre: 4 }
  ];

  const mockProducts: Product[] = [
    {
      id: 1,
      nom: 'Côte de Bœuf Premium',
      description: 'Côte de bœuf maturée 28 jours, tendre et savoureuse',
      prix: 12500,
      imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400',
      disponible: true,
      stock: 8,
      categorieId: 1,
      poids: 0.8,
      unite: 'kg'
    },
    {
      id: 2,
      nom: 'Magret de Canard',
      description: 'Magret de canard fermier, élevé au grain',
      prix: 8500,
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
      disponible: true,
      stock: 12,
      categorieId: 1,
      poids: 0.4,
      unite: 'kg'
    },
    {
      id: 3,
      nom: 'Saucisson Sec Artisanal',
      description: 'Saucisson sec traditionnel, affiné 3 mois',
      prix: 4200,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
      disponible: true,
      stock: 15,
      categorieId: 2,
      poids: 0.25,
      unite: 'kg'
    },
    {
      id: 4,
      nom: 'Pâté de Campagne',
      description: 'Pâté de campagne aux herbes de Provence',
      prix: 3800,
      imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400',
      disponible: true,
      stock: 6,
      categorieId: 2,
      poids: 0.3,
      unite: 'kg'
    },
    {
      id: 5,
      nom: 'Bœuf Bourguignon',
      description: 'Bœuf mijoté au vin rouge avec légumes',
      prix: 9500,
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
      disponible: true,
      stock: 4,
      categorieId: 3,
      poids: 0.6,
      unite: 'kg'
    },
    {
      id: 6,
      nom: 'Gratin Dauphinois',
      description: 'Gratin de pommes de terre à la crème fraîche',
      prix: 2800,
      imageUrl: 'https://images.unsplash.com/photo-1573915690029-2c64bff6db9c?w=400',
      disponible: true,
      stock: 10,
      categorieId: 4,
      poids: 0.4,
      unite: 'kg'
    }
  ];

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCategories(mockCategories);
      setProducts(mockProducts);
      setIsLoading(false);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Intentionally empty - only run once

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.categorieId === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPrice = product.prix >= priceRange[0] && product.prix <= priceRange[1];
    
    return matchesCategory && matchesSearch && matchesPrice && product.disponible;
  });

  const maxPrice = Math.max(...products.map(p => p.prix), 50000);

  // Gestion du panier
  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantite + 1;
        if (product.stock && newQuantity > product.stock) {
          showWarning('Stock insuffisant', `Plus que ${product.stock} en stock`);
          return prev;
        }
        
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantite: newQuantity }
            : item
        );
      }

      return [...prev, {
        id: product.id,
        nom: product.nom,
        prix: product.prix,
        quantite: 1,
        imageUrl: product.imageUrl,
        categorieId: product.categorieId
      }];
    });
    
    // Une seule notification pour tous les cas
    showSuccess('Produit ajouté', `${product.nom} ajouté au panier`);
  };

  const updateCartQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    const product = products.find(p => p.id === id);
    if (product?.stock && quantity > product.stock) {
      showWarning('Stock insuffisant', `Plus que ${product.stock} en stock`);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantite: quantity } : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      showSuccess('Produit retiré', `${item.nom} retiré du panier`);
    }
    
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantite, 0);

  // Gestion de la commande
  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async (orderData: {
    items: Array<{ produitId: number; quantite: number; }>;
    total: number;
    telephone: string;
    typeCommande: 'CLICK_COLLECT' | 'LIVRAISON';
    adresseLivraison?: string;
    heureRetrait?: string;
    notes?: string;
    modePaiement: string;
  }) => {
    setIsProcessing(true);
    
    try {
      // Simulation d'appel API pour créer la commande
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ici vous feriez l'appel réel à votre API
      console.log('Données de commande:', orderData);
      // const response = await fetch('/api/commandes', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(orderData)
      // });

      setIsCheckoutOpen(false);
      setCartItems([]);
      setOrderSuccess(true);
      showSuccess('Commande confirmée !', 'Vous recevrez un SMS de confirmation');
      
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      showError('Erreur', 'Impossible de traiter votre commande. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Écran de succès
  if (orderSuccess) {
    return (
      <>
        <Header />
        <div 
          className="min-h-screen flex items-center justify-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 100%)'
          }}
        >
          <motion.div
            className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-md mx-4 relative z-10"
            initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          >
            <motion.div
              className="text-8xl mb-8"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🎉
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Commande confirmée !
            </h2>
            
            <p className="text-gray-700 mb-8 leading-relaxed">
              Merci pour votre confiance ! Vous recevrez un SMS avec tous les détails de votre commande.
            </p>
            
            <motion.button
              onClick={() => {
                setOrderSuccess(false);
                showSuccess('Nouvelle session', 'Prêt pour une nouvelle commande !');
              }}
              className="bg-gradient-to-r from-[#C8102E] to-[#A50E26] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:border-white/40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Nouvelle commande
            </motion.button>
          </motion.div>

          {/* Particules d'arrière-plan */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[#FF7A00] rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div 
        className="min-h-screen"
        style={{
          background: 'linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 100%)'
        }}
      >
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/20 via-transparent to-[#FF6B35]/10" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center space-x-3 mb-6">
                <SparklesIcon className="w-8 h-8 text-[#C8102E]" />
                <span className="text-gray-300 uppercase tracking-wider text-sm font-semibold bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
                  Boucherie Premium
                </span>
                <SparklesIcon className="w-8 h-8 text-[#C8102E]" />
              </div>
              
              <h1 
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight max-w-5xl mx-auto tracking-tight mb-8 drop-shadow-2xl"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Commandes & Livraisons
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                Découvrez nos produits d&apos;exception et commandez en ligne pour une livraison rapide ou un retrait en magasin
              </p>
            </motion.div>
          </div>

          {/* Éléments décoratifs */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#FF7A00]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#FF6B35]/10 rounded-full blur-3xl" />
        </section>

        {/* Contenu principal */}
        <div className="container mx-auto px-4 pb-20">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filtres - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-700 rounded-2xl" />
                    <div className="h-64 bg-gray-700 rounded-2xl" />
                    <div className="h-32 bg-gray-700 rounded-2xl" />
                  </div>
                ) : (
                  <ProductFilters
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                    maxPrice={maxPrice}
                  />
                )}
              </div>
            </div>

            {/* Liste des produits */}
            <div className="lg:col-span-3">
              {/* En-tête avec compteur */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-md">
                    {isLoading ? 'Chargement...' : `${filteredProducts.length} produits disponibles`}
                  </h2>
                  {searchQuery && (
                    <p className="text-gray-300">
                      Résultats pour &ldquo;<span className="text-[#C8102E] font-semibold">{searchQuery}</span>&rdquo;
                    </p>
                  )}
                </div>

                {/* Bouton panier fixe (mobile) */}
                <motion.button
                  onClick={() => setIsCartOpen(true)}
                  className="lg:hidden relative bg-gradient-to-r from-[#C8102E] to-[#A50E26] text-white p-3 rounded-2xl shadow-lg border border-white/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCartIcon className="w-6 h-6" />
                  {totalItems > 0 && (
                    <motion.span
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={totalItems}
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </motion.button>
              </div>

              {/* Grille de produits */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                  // Skeletons de chargement
                  [...Array(6)].map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))
                ) : filteredProducts.length > 0 ? (
                  // Produits
                  filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      index={index}
                    />
                  ))
                ) : (
                  // Aucun produit trouvé
                  <motion.div
                    className="col-span-full text-center py-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-md">
                      Aucun produit trouvé
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Essayez de modifier vos filtres ou votre recherche
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSearchQuery('');
                        setPriceRange([0, maxPrice]);
                      }}
                      className="bg-gradient-to-r from-[#C8102E] to-[#A50E26] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 border border-white/20"
                    >
                      Réinitialiser les filtres
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panier flottant (desktop) */}
        <AnimatePresence>
          {totalItems > 0 && !isCartOpen && (
            <motion.button
              onClick={() => setIsCartOpen(true)}
              className="hidden lg:flex fixed bottom-8 right-8 bg-gradient-to-r from-[#C8102E] to-[#A50E26] text-white px-6 py-4 rounded-2xl shadow-2xl items-center space-x-3 z-40 border border-white/30 hover:border-white/50"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <ShoppingCartIcon className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              </div>
              <span className="font-semibold">Voir le panier</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Composants modaux */}
        <ModernCart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          onConfirmOrder={handleConfirmOrder}
          isLoading={isProcessing}
        />

        {/* Toast notifications */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>

      <Footer />
    </>
  );
}