'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  TagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import apiServices from '../../services/api';
import Header from '@/components/Header';
import Footer from "@/components/Footer";

// Interface pour les actualités
interface Actualite {
  id: number;
  titre: string;
  slug: string;
  extrait?: string;
  contenu?: string;
  imageUrl?: string;
  categorie?: string;
  auteur?: string;
  datePublication: string;
  vues?: number;
}

export default function ActualitesPage() {
  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const articlesPerPage = 6;

  const loadActualites = async (page: number = 1, search: string = '', category: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiServices.actualitesService.getAll({
        page, limit: articlesPerPage, search, categorie: category
      });
      
      if (response && response.success) {
        setActualites(response.data || []);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(response.currentPage || 1);
      } else {
        setError('Erreur lors du chargement des actualités');
      }
    } catch (error) {
      console.error('Erreur chargement actualités:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(`Impossible de charger les actualités: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiServices.actualitesService.getCategories();
      
      if (response && response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Erreur de chargement des catégories:', error);
      // Utiliser des catégories par défaut en cas d'erreur
      setCategories(['Promotions', 'Événements', 'Nouveautés', 'Services']);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      
      // Tentative de chargement avec retry
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await loadActualites();
          await loadCategories();
          break; // Succès, sortir de la boucle
        } catch (error) {
          retryCount++;
          console.warn(`Tentative ${retryCount}/${maxRetries} échouée:`, error);
          
          if (retryCount < maxRetries) {
            console.log(`Nouvelle tentative dans 2 secondes...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.error('Échec après toutes les tentatives');
            setError('Impossible de se connecter au serveur. Vérifiez votre connexion.');
          }
        }
      }
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadActualites(1, searchTerm, selectedCategory);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  const handlePageChange = (newPage: number) => {
    loadActualites(newPage, searchTerm, selectedCategory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-restaurant-black text-restaurant-white">
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-restaurant-primary text-6xl mb-6">⚠️</div>
            <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              Erreur de chargement
            </h1>
            <p className="text-restaurant-white/80 mb-4">{error}</p>
            <div className="text-sm text-restaurant-white/60 mb-6 bg-restaurant-white/5 p-4 rounded-lg">
              <p><strong>Diagnostic:</strong></p>
              <p>• API Backend: http://localhost:3002</p>
              <p>• Frontend: http://localhost:3000</p>
              <p>• Vérifiez que les deux serveurs sont démarrés</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  setError(null);
                  loadActualites();
                  loadCategories();
                }}
                className="bg-restaurant-primary hover:bg-restaurant-primary/80 text-restaurant-black font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Réessayer
              </button>
              <button 
                onClick={() => {
                  // Test de connexion direct
                  fetch('http://localhost:3002/api/actualites')
                    .then(res => res.json())
                    .then(data => {
                      alert('✅ Connexion API réussie ! ' + data.actualites?.length + ' actualités trouvées.');
                      setError(null);
                      loadActualites();
                    })
                    .catch(err => {
                      alert('❌ Échec de connexion API: ' + err.message);
                    });
                }}
                className="bg-transparent border border-restaurant-primary text-restaurant-primary hover:bg-restaurant-primary hover:text-restaurant-black font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Tester la connexion
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <main className="min-h-screen text-restaurant-white page-entrance">
      <Header />
      
      {/* HERO SECTION - Style identique à la page d'accueil */}
      <section className="relative h-[60vh] flex items-center">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop" 
            alt="Actualités La Boucherie Fine" 
            fill 
            className="object-cover brightness-50" 
            unoptimized 
          />
        </div>

        <div className="hero-overlay"></div>
        
        <div className="container mx-auto px-6 relative z-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto tracking-tight text-shadow"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Actualités & Nouvelles
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-restaurant-white/85 max-w-2xl mx-auto"
          >
            Découvrez les dernières nouvelles, événements et coulisses de La Boucherie Fine.
          </motion.p>
        </div>
      </section>

      {/* FILTRES ET RECHERCHE - Style cohérent */}
      <section className="py-12 bg-restaurant-white text-restaurant-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Barre de recherche */}
            <div className="relative flex-1 max-w-lg">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les actualités..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-full focus:border-restaurant-primary focus:outline-none transition-all duration-300 text-lg"
              />
            </div>

            {/* Filtre par catégorie */}
            <div className="flex items-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  setSelectedCategory(newCategory);
                  setCurrentPage(1); // Reset à la page 1 lors du changement de catégorie
                }}
                className="px-6 py-4 border-2 border-gray-200 rounded-full focus:border-restaurant-primary focus:outline-none bg-white text-lg font-medium min-w-[200px]"
                aria-label="Filtrer par catégorie"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setCurrentPage(1);
                  }}
                  className="p-3 text-restaurant-primary hover:bg-restaurant-primary hover:text-white rounded-full transition-all duration-300"
                  title="Effacer les filtres"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* INDICATEURS DE FILTRES */}
      <div className="bg-restaurant-black py-6 border-b border-restaurant-primary/20">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-restaurant-white/80">
                {loading ? 'Chargement...' : `${actualites.length} actualité${actualites.length > 1 ? 's' : ''} trouvée${actualites.length > 1 ? 's' : ''}`}
              </span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-restaurant-primary/20 border border-restaurant-primary rounded-full text-restaurant-primary text-sm">
                  <TagIcon className="h-4 w-4" />
                  {selectedCategory}
                </span>
              )}
            </div>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setCurrentPage(1);
                }}
                className="text-sm text-restaurant-white/60 hover:text-restaurant-primary transition-colors duration-200"
              >
                Effacer tous les filtres
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL - Style identique à la section des plats */}
      <section className="py-20 bg-restaurant-black">
        <div className="container mx-auto px-6">
          {loading ? (
            // Skeleton loader avec le style de la page d'accueil
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-restaurant-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-3"></div>
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                      <div className="h-8 bg-gray-300 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : actualites.length === 0 ? (
            <>
              {/* Affichage des actualités d'exemple en attendant les vraies données */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  id: 1,
                  titre: "Nouveau menu d'hiver - Spécialités de saison",
                  extrait: "Découvrez nos nouvelles créations hivernales avec des pièces d'exception et des saveurs chaleureuses qui réchauffent les cœurs.",
                  imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=900&auto=format&fit=crop",
                  categorie: "Nouveautés",
                  datePublication: "2024-12-01",
                  vues: 245
                },
                {
                  id: 2,
                  titre: "Soirée dégustation - Vins & Grillades",
                  extrait: "Rejoignez-nous le 15 décembre pour une soirée exceptionnelle alliant nos meilleures grillades à une sélection de vins raffinés.",
                  imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=900&auto=format&fit=crop",
                  categorie: "Événements",
                  datePublication: "2024-11-25",
                  vues: 189
                },
                {
                  id: 3,
                  titre: "Promotion spéciale - Menu famille",
                  extrait: "Profitez de 20% de réduction sur nos menus famille tous les dimanches du mois de décembre. Une occasion parfaite pour se retrouver !",
                  imageUrl: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=900&auto=format&fit=crop",
                  categorie: "Promotions",
                  datePublication: "2024-11-20",
                  vues: 312
                },
                {
                  id: 4,
                  titre: "Service de livraison étendu",
                  extrait: "Nous sommes ravis d'annoncer l'extension de notre zone de livraison ! Désormais disponible jusqu'à Abobo et Yopougon.",
                  imageUrl: "https://images.unsplash.com/photo-1566554273541-37a9ca77b91b?q=80&w=900&auto=format&fit=crop",
                  categorie: "Services",
                  datePublication: "2024-11-15",
                  vues: 156
                },
                {
                  id: 5,
                  titre: "Notre chef primé au concours national",
                  extrait: "Félicitations à notre Chef François qui vient de remporter le prix d'excellence au concours national de cuisine ivoirienne !",
                  imageUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=900&auto=format&fit=crop",
                  categorie: "Actualités",
                  datePublication: "2024-11-10",
                  vues: 428
                },
                {
                  id: 6,
                  titre: "Réservations ouvertes pour les fêtes",
                  extrait: "Les réservations pour les repas de Noël et du Nouvel An sont désormais ouvertes. Réservez vite, les places sont limitées !",
                  imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=900&auto=format&fit=crop",
                  categorie: "Événements",
                  datePublication: "2024-11-05",
                  vues: 267
                }
              ].map((actualite) => (
                <motion.article
                  key={actualite.id}
                  className="bg-restaurant-white rounded-2xl overflow-hidden text-restaurant-black shadow-lg hover:shadow-2xl transform hover:scale-102 transition-all duration-300 border-2 border-transparent hover:border-restaurant-primary"
                  whileHover={{ y: -6 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="h-48 overflow-hidden relative">
                    <Image 
                      src={actualite.imageUrl} 
                      alt={actualite.titre} 
                      fill 
                      className="object-cover transition-transform duration-300 hover:scale-110" 
                      unoptimized 
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-restaurant-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {actualite.categorie}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-3 line-clamp-2 text-restaurant-black hover:text-restaurant-primary transition-colors duration-200">
                      {actualite.titre}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {actualite.extrait}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{formatDate(actualite.datePublication)}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        <span>{actualite.vues} vues</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button className="text-restaurant-primary font-semibold hover:text-restaurant-primary/80 flex items-center group transition-all duration-200">
                        Lire la suite
                        <ArrowRightIcon className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
            
            {/* Section d'information sur les actualités d'exemple */}
            <div className="text-center mt-16">
              <div className="bg-restaurant-white/5 rounded-2xl p-8 max-w-2xl mx-auto border border-restaurant-primary/20">
                <div className="text-restaurant-primary text-4xl mb-4">✨</div>
                <h3 className="text-xl font-bold mb-3 text-restaurant-white" style={{ fontFamily: "var(--font-playfair)" }}>
                  Actualités de démonstration
                </h3>
                <p className="text-restaurant-white/70 mb-6">
                  Ces actualités sont affichées à titre d&apos;exemple. Connectez l&apos;API backend pour voir les vraies actualités de La Boucherie Fine.
                </p>
                <div className="flex justify-center gap-6 text-sm">
                  <Link href="/contact" className="text-restaurant-primary hover:text-restaurant-primary/80 transition-colors font-medium flex items-center">
                    📞 Nous contacter
                  </Link>
                  <span className="text-restaurant-white/40">•</span>
                  <Link href="/" className="text-restaurant-primary hover:text-restaurant-primary/80 transition-colors font-medium flex items-center">
                    🏠 Retour à l&apos;accueil
                  </Link>
                </div>
              </div>
            </div>
            </>
          ) : (
            <>
              {/* Grille des actualités - Style identique aux cartes de plats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {actualites.map((actualite) => (
                  <motion.article 
                    key={actualite.id}
                    className="bg-restaurant-white rounded-2xl overflow-hidden text-restaurant-black shadow-lg hover:shadow-2xl transform hover:scale-102 transition-all duration-300 border-2 border-transparent hover:border-restaurant-primary"
                    whileHover={{ y: -6 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Image */}
                    <div className="h-48 overflow-hidden relative">
                      {actualite.imageUrl ? (
                        <Image
                          src={actualite.imageUrl}
                          alt={actualite.titre}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-restaurant-primary to-restaurant-primary/80 flex items-center justify-center">
                          <div className="text-white text-5xl">📰</div>
                        </div>
                      )}
                      
                      {/* Badge catégorie */}
                      {actualite.categorie && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-restaurant-primary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                            <TagIcon className="inline h-3 w-3 mr-1" />
                            {actualite.categorie}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="p-6">
                      {/* Métadonnées */}
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{formatDate(actualite.datePublication)}</span>
                        {actualite.vues !== undefined && (
                          <>
                            <EyeIcon className="h-4 w-4 ml-4 mr-2" />
                            <span>{actualite.vues} vues</span>
                          </>
                        )}
                      </div>

                      {/* Titre */}
                      <h3 className="text-xl font-bold mb-3 line-clamp-2 hover:text-restaurant-primary transition-colors" style={{ fontFamily: "var(--font-playfair)" }}>
                        {actualite.titre}
                      </h3>

                      {/* Résumé */}
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                        {actualite.extrait || truncateText(actualite.contenu || '', 120)}
                      </p>

                      {/* Bouton "Lire plus" - Style identique aux boutons de la page d'accueil */}
                      <div className="flex items-center justify-between">
                        <Link 
                          href={`/news/${actualite.slug}`}
                          className="inline-flex items-center text-restaurant-primary font-bold hover:text-restaurant-primary/80 transition-colors group"
                        >
                          Lire la suite
                          <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        
                        <div className="text-xs text-gray-400">
                          {Math.ceil((actualite.contenu?.length || 0) / 500)} min de lecture
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Pagination - Style cohérent */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-6 py-3 bg-restaurant-white/10 text-restaurant-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-restaurant-white/20 transition-all duration-300 font-semibold"
                  >
                    Précédent
                  </button>
                  
                  <div className="flex space-x-2 mx-4">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                            currentPage === pageNum
                              ? 'bg-restaurant-primary text-white shadow-lg'
                              : 'bg-restaurant-white/10 text-restaurant-white hover:bg-restaurant-white/20'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-6 py-3 bg-restaurant-white/10 text-restaurant-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-restaurant-white/20 transition-all duration-300 font-semibold"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}