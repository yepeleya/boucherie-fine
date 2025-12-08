"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import Image from "next/image";

interface Plat {
  id: string;
  nom: string;
  prix: number | null;
  description: string;
}

interface Categorie {
  id: string;
  nom: string;
  plats: Plat[];
}

interface Formule {
  id: string;
  nom: string;
  prix: number;
  description: string;
}

interface Accompagnement {
  nom: string;
  prix: number;
  options: string[];
}

interface Dessert {
  id: string;
  nom: string;
  prix: number;
  description: string;
  options?: string[];
}

interface Menu {
  id: string;
  nom: string;
  categories: Categorie[];
  formules: Formule[];
  accompagnements: Accompagnement;
  desserts: Dessert[];
}

export default function MenusPage() {
  const [menuActif, setMenuActif] = useState<'interieur' | 'exterieur'>('interieur');
  const [menuInterieur, setMenuInterieur] = useState<Menu | null>(null);
  const [menuExterieur, setMenuExterieur] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categorieActive, setCategorieActive] = useState<string>('tous');

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/menus');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des menus');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setMenuInterieur(data.data.menuInterieur);
          setMenuExterieur(data.data.menuExterieur);
        } else {
          throw new Error('Réponse API invalide');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        console.error('Erreur lors du chargement des menus:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const menuCourant = menuActif === 'interieur' ? menuInterieur : menuExterieur;

  // Réinitialiser le filtre quand on change de menu
  useEffect(() => {
    setCategorieActive('tous');
  }, [menuActif]);

  // Filtrer les catégories en fonction du filtre actuel
  const categoriesFiltrees = menuCourant?.categories.filter(categorie => 
    categorieActive === 'tous' || categorie.nom === categorieActive
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-restaurant-black text-restaurant-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-4xl font-semibold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              Chargement des menus...
            </div>
            <div className="w-16 h-16 border-4 border-restaurant-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-restaurant-black text-restaurant-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-4xl font-semibold mb-4 text-restaurant-primary" style={{ fontFamily: "var(--font-playfair)" }}>
              Erreur
            </div>
            <p className="text-lg mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-red px-6 py-3 rounded-full font-semibold"
            >
              Réessayer
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-restaurant-black text-restaurant-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1600&auto=format&fit=crop" 
            alt="Menu La Boucherie Fine" 
            fill 
            className="object-cover brightness-50" 
            unoptimized 
          />
        </div>
        <div className="relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto tracking-tight text-shadow mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Menus & Saveurs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl opacity-90"
          >
            Découvrez l&apos;excellence culinaire, du menu intérieur au menu extérieur
          </motion.p>
        </div>
      </section>

      {/* Sélecteur de menu */}
      <section className="py-8 bg-restaurant-black border-b border-restaurant-primary/20">
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <div className="flex bg-gray-900 rounded-full p-2">
              <button
                onClick={() => setMenuActif('interieur')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  menuActif === 'interieur'
                    ? 'bg-restaurant-primary text-restaurant-white shadow-lg'
                    : 'text-gray-400 hover:text-restaurant-white'
                }`}
              >
                Menu Intérieur
              </button>
              <button
                onClick={() => setMenuActif('exterieur')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  menuActif === 'exterieur'
                    ? 'bg-restaurant-primary text-restaurant-white shadow-lg'
                    : 'text-gray-400 hover:text-restaurant-white'
                }`}
              >
                Menu Extérieur
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filtres de catégories */}
      {menuCourant && (
        <section className="py-6 bg-gray-900/30 border-b border-restaurant-primary/10">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setCategorieActive('tous')}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  categorieActive === 'tous'
                    ? 'bg-restaurant-primary text-restaurant-white shadow-lg scale-105'
                    : 'bg-gray-800 text-gray-400 hover:text-restaurant-white hover:bg-gray-700'
                }`}
              >
                Tous les plats
              </button>
              
              {menuCourant.categories.map((categorie) => (
                <button
                  key={categorie.id}
                  onClick={() => setCategorieActive(categorie.nom)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    categorieActive === categorie.nom
                      ? 'bg-restaurant-primary text-restaurant-white shadow-lg scale-105'
                      : 'bg-gray-800 text-gray-400 hover:text-restaurant-white hover:bg-gray-700'
                  }`}
                >
                  {categorie.nom}
                </button>
              ))}
              
              {/* Bouton Formules si des formules existent */}
              {menuCourant.formules && menuCourant.formules.length > 0 && (
                <button
                  onClick={() => setCategorieActive('FORMULES')}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    categorieActive === 'FORMULES'
                      ? 'bg-restaurant-primary text-restaurant-white shadow-lg scale-105'
                      : 'bg-gray-800 text-gray-400 hover:text-restaurant-white hover:bg-gray-700'
                  }`}
                >
                  FORMULES
                </button>
              )}
              
              {/* Bouton Desserts si des desserts existent */}
              {menuCourant.desserts && menuCourant.desserts.length > 0 && (
                <button
                  onClick={() => setCategorieActive('DESSERTS')}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    categorieActive === 'DESSERTS'
                      ? 'bg-restaurant-primary text-restaurant-white shadow-lg scale-105'
                      : 'bg-gray-800 text-gray-400 hover:text-restaurant-white hover:bg-gray-700'
                  }`}
                >
                  DESSERTS
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contenu du menu */}
      {menuCourant && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            
            {/* Catégories de plats */}
            {categoriesFiltrees.map((categorie, index) => (
              <motion.div
                key={categorie.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-restaurant-primary mb-8 text-center border-b border-restaurant-primary/30 pb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                  {categorie.nom}
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorie.plats.map((plat) => (
                    <motion.div
                      key={plat.id}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-restaurant-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-restaurant-primary/10"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-restaurant-white flex-1 mr-4">
                          {plat.nom}
                        </h3>
                        <span className="text-2xl font-bold text-restaurant-primary flex-shrink-0">
                          {plat.prix ? `${plat.prix.toLocaleString()} F` : 'Prix variable'}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        {plat.description}
                      </p>
                      <button className="w-full bg-restaurant-primary hover:bg-red-700 text-restaurant-white py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                        Commander
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Formules */}
            {((categorieActive === 'tous' || categorieActive === 'FORMULES') && menuCourant.formules && menuCourant.formules.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-restaurant-primary mb-8 text-center border-b border-restaurant-primary/30 pb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                  FORMULES
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {menuCourant.formules.map((formule) => (
                    <motion.div
                      key={formule.id}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-restaurant-primary/30 hover:border-restaurant-primary transition-all duration-300 hover:shadow-xl hover:shadow-restaurant-primary/20"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-restaurant-white flex-1 mr-4" style={{ fontFamily: "var(--font-playfair)" }}>
                          {formule.nom}
                        </h3>
                        <span className="text-3xl font-bold text-restaurant-primary flex-shrink-0">
                          {formule.prix.toLocaleString()} F
                        </span>
                      </div>
                      <p className="text-gray-300 mb-6 leading-relaxed">
                        {formule.description}
                      </p>
                      <button className="w-full bg-restaurant-primary hover:bg-red-700 text-restaurant-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                        Commander cette formule
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Accompagnements */}
            {categorieActive === 'tous' && menuCourant.accompagnements && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-restaurant-primary mb-8 text-center border-b border-restaurant-primary/30 pb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                  {menuCourant.accompagnements.nom}
                </h2>
                
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                  <div className="text-center mb-6">
                    <span className="text-2xl font-bold text-restaurant-primary">
                      En supplément : {menuCourant.accompagnements.prix.toLocaleString()} F
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {menuCourant.accompagnements.options.map((option, index) => (
                      <div key={index} className="text-center p-3 bg-gray-800 rounded-lg hover:bg-restaurant-primary/20 transition-colors">
                        <span className="text-restaurant-white">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Desserts */}
            {((categorieActive === 'tous' || categorieActive === 'DESSERTS') && menuCourant.desserts && menuCourant.desserts.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-restaurant-primary mb-8 text-center border-b border-restaurant-primary/30 pb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                  DESSERTS
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuCourant.desserts.map((dessert) => (
                    <motion.div
                      key={dessert.id}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-restaurant-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-restaurant-primary/10"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-restaurant-white flex-1 mr-4">
                          {dessert.nom}
                        </h3>
                        <span className="text-2xl font-bold text-restaurant-primary flex-shrink-0">
                          {dessert.prix.toLocaleString()} F
                        </span>
                      </div>
                      <p className="text-gray-400 mb-4 text-sm">
                        {dessert.description}
                      </p>
                      {dessert.options && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Options disponibles :</p>
                          <div className="flex flex-wrap gap-1">
                            {dessert.options.map((option, index) => (
                              <span key={index} className="text-xs bg-restaurant-primary/20 text-restaurant-primary px-2 py-1 rounded-full">
                                {option}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <button className="w-full bg-restaurant-primary hover:bg-red-700 text-restaurant-white py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                        Commander
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Section commande rapide */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center bg-gradient-to-r from-restaurant-primary to-red-700 rounded-2xl p-12"
            >
              <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                Prêt à commander ?
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Contactez-nous pour passer votre commande ou réserver votre table
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/commandes" 
                  className="bg-restaurant-white text-restaurant-primary px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                >
                  Commander en ligne
                </a>
                <a 
                  href="/reservations" 
                  className="border-2 border-restaurant-white text-restaurant-white px-8 py-4 rounded-full font-semibold hover:bg-restaurant-white hover:text-restaurant-primary transition-all duration-300 transform hover:scale-105"
                >
                  Réserver une table
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}