'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  EyeIcon,
  ChevronLeftIcon,
  ShareIcon,
  TagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import apiServices from '@/services/api';

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

export default function ArticlePage() {
  const params = useParams();
  const [actualite, setActualite] = useState<Actualite | null>(null);
  const [relatedActualites, setRelatedActualites] = useState<Actualite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRelatedActualites = useCallback(async (categorie: string, excludeId: number) => {
    try {
      const response = await apiServices.actualitesService.getAll({
        categorie: categorie,
        limit: 6 // Demander plus pour avoir assez après filtrage
      });
      
      if (response && response.success) {
        // Filtrer pour exclure l'article actuel et limiter à 3
        const filtered = response.data
          .filter((article: Actualite) => article.id !== excludeId)
          .slice(0, 3);
        setRelatedActualites(filtered);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des articles similaires:', error);
    }
  }, []);

  const loadActualite = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      
      const response = await apiServices.actualitesService.getBySlug(slug);
      
      if (response && response.success && response.data) {
        const articleData = response.data;
        setActualite(articleData);
        
        // Charger les articles similaires
        if (articleData.categorie) {
          loadRelatedActualites(articleData.categorie, articleData.id);
        }
      } else {
        setError('Article non trouvé');
      }
    } catch (error) {
      console.error('Erreur chargement article:', error);
      setError('Article non trouvé ou erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [loadRelatedActualites]);

  useEffect(() => {
    if (params?.slug && typeof params.slug === 'string') {
      loadActualite(params.slug);
    }
  }, [params?.slug, loadActualite]);

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: actualite?.titre,
        text: actualite?.extrait || 'Article de La Boucherie Fine',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen text-restaurant-white page-entrance">
        <Header />
        
        {/* Hero skeleton */}
        <section className="relative h-[60vh] bg-restaurant-black animate-pulse">
          <div className="absolute inset-0 bg-gray-800"></div>
          <div className="container mx-auto px-6 relative z-20 flex items-center h-full">
            <div className="max-w-4xl">
              <div className="h-8 bg-gray-700 rounded mb-4 w-3/4"></div>
              <div className="h-6 bg-gray-700 rounded mb-6 w-1/2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        </section>

        {/* Content skeleton */}
        <section className="py-20 bg-restaurant-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-300 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen text-restaurant-white page-entrance">
        <Header />
        
        <section className="relative h-[60vh] flex items-center bg-restaurant-black">
          <div className="container mx-auto px-6 text-center relative z-20">
            <div className="text-restaurant-primary text-8xl mb-6">🔍</div>
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              Article non trouvé
            </h1>
            <p className="text-restaurant-white/80 mb-8 text-lg max-w-2xl mx-auto">
              L&apos;article que vous recherchez n&apos;existe pas ou a été supprimé.
            </p>
            <Link href="/news" className="btn-primary">
              Retour aux actualités
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  if (!actualite) {
    return null;
  }

  return (
    <main className="min-h-screen text-restaurant-white page-entrance">
      <Header />
      
      {/* HERO SECTION avec image d'article */}
      <section className="relative h-[70vh] flex items-end">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {actualite.imageUrl ? (
            <Image 
              src={actualite.imageUrl} 
              alt={actualite.titre} 
              fill 
              className="object-cover brightness-40" 
              unoptimized 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-restaurant-black via-gray-900 to-restaurant-primary"></div>
          )}
        </div>

        <div className="hero-overlay"></div>
        
        <div className="container mx-auto px-6 relative z-20 pb-20">
          {/* Fil d'Ariane */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center mb-6 text-restaurant-white/80"
          >
            <Link 
              href="/news" 
              className="flex items-center hover:text-restaurant-primary transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-2" />
              Retour aux actualités
            </Link>
          </motion.div>

          <div className="max-w-4xl">
            {/* Catégorie et métadonnées */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-6 mb-6 text-sm"
            >
              {actualite.categorie && (
                <span className="bg-restaurant-primary text-white px-4 py-2 rounded-full font-semibold">
                  <TagIcon className="inline h-4 w-4 mr-1" />
                  {actualite.categorie}
                </span>
              )}
              <div className="flex items-center text-restaurant-white/80">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>{formatDate(actualite.datePublication)}</span>
              </div>
              {actualite.vues !== undefined && (
                <div className="flex items-center text-restaurant-white/80">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  <span>{actualite.vues} vues</span>
                </div>
              )}
            </motion.div>

            {/* Titre principal */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-shadow"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {actualite.titre}
            </motion.h1>

            {/* Résumé si disponible */}
            {actualite.extrait && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-lg md:text-xl text-restaurant-white/90 max-w-3xl leading-relaxed mb-8"
              >
                {actualite.extrait}
              </motion.p>
            )}

            {/* Bouton de partage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <button 
                onClick={handleShare}
                className="btn-outline flex items-center"
              >
                <ShareIcon className="h-5 w-5 mr-2" />
                Partager l&apos;article
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <section className="py-20 bg-restaurant-white text-restaurant-black">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="prose prose-lg max-w-none"
              style={{
                fontSize: '18px',
                lineHeight: '1.8',
                color: '#374151'
              }}
            >
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: actualite.contenu?.replace(/\n/g, '<br />') || '' 
                }} 
                role="article"
                aria-label={`Contenu de l'article: ${actualite.titre}`}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ARTICLES SIMILAIRES - Style identique aux cartes de la page d'accueil */}
      {relatedActualites.length > 0 && (
        <section className="py-20 bg-restaurant-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-restaurant-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                Articles Similaires
              </h3>
              <p className="text-restaurant-white/80 max-w-2xl mx-auto">
                Découvrez d&apos;autres articles qui pourraient vous intéresser
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedActualites.map((article, index) => (
                <motion.article
                  key={article.id}
                  className="bg-restaurant-white rounded-2xl overflow-hidden text-restaurant-black shadow-lg hover:shadow-2xl transform hover:scale-102 transition-all duration-300 border-2 border-transparent hover:border-restaurant-primary"
                  whileHover={{ y: -6 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="h-48 overflow-hidden relative">
                    {article.imageUrl ? (
                      <Image
                        src={article.imageUrl}
                        alt={article.titre}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-restaurant-primary to-restaurant-primary/80 flex items-center justify-center">
                        <div className="text-white text-5xl">📰</div>
                      </div>
                    )}
                    
                    {article.categorie && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-restaurant-primary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          {article.categorie}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>{formatDate(article.datePublication)}</span>
                    </div>

                    <h4 className="text-xl font-bold mb-3 line-clamp-2" style={{ fontFamily: "var(--font-playfair)" }}>
                      {article.titre}
                    </h4>

                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                      {article.extrait || truncateText(article.contenu || '', 120)}
                    </p>

                    <Link 
                      href={`/news/${article.slug}`}
                      className="inline-flex items-center text-restaurant-primary font-bold hover:text-restaurant-primary/80 transition-colors group"
                    >
                      Lire l&apos;article
                      <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}