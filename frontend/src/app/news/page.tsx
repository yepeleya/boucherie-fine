'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { CalendarIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline';

const newsArticles = [
  {
    id: 1,
    title: 'Nouveau menu spécial Fêtes de fin d\'année',
    excerpt: 'Découvrez notre menu exclusif pour célébrer les fêtes de fin d\'année avec nos spécialités ivoiriennes revisitées.',
    content: `Nous sommes ravis de vous présenter notre nouveau menu spécial pour les fêtes de fin d'année ! Notre chef a créé une sélection unique de plats traditionnels ivoiriens revisités avec une touche moderne.

Au menu : Kedjenou de pintade aux épices festives, Attiéké doré aux crevettes géantes, et notre dessert signature : la mousse au chocolat ivoirien avec fruits tropicaux.

Réservations recommandées du 20 décembre au 5 janvier. Profitez également de notre ambiance festive avec décoration traditionnelle et musique live le weekend.`,
    author: 'Chef Kouadio',
    date: '2024-12-15',
    category: 'Menu',
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800',
    featured: true
  },
  {
    id: 2,
    title: 'Ouverture du service livraison express',
    excerpt: 'Commandez en ligne et recevez vos plats préférés en moins de 30 minutes dans toute la zone d\'Abidjan.',
    content: `Grande nouvelle ! Nous lançons officiellement notre service de livraison express. Désormais, vous pouvez commander vos plats préférés en ligne et les recevoir chez vous en moins de 30 minutes.

Zone de livraison : Riviera 3, Cocody, Marcory, Treichville, Adjamé et Yopougon.
Frais de livraison : 1000 FCFA
Commande minimum : 5000 FCFA

Notre équipe de livreurs professionnels garantit la fraîcheur et la qualité de vos plats jusqu'à votre porte.`,
    author: 'Direction',
    date: '2024-12-10',
    category: 'Service',
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800',
    featured: false
  },
  {
    id: 3,
    title: 'Formation culinaire : Atelier Kedjenou',
    excerpt: 'Apprenez à préparer le fameux Kedjenou traditionnel lors de notre atelier culinaire mensuel.',
    content: `Rejoignez-nous pour notre atelier culinaire mensuel ! Ce mois-ci, notre chef vous apprendra les secrets du Kedjenou traditionnel, ce plat emblématique de la Côte d'Ivoire.

Au programme :
- Histoire et origine du Kedjenou
- Choix des ingrédients et épices
- Technique de cuisson dans la poterie
- Dégustation et conseils du chef

Date : Samedi 23 décembre à 14h
Durée : 3 heures
Tarif : 15 000 FCFA par personne (repas inclus)
Places limitées à 12 participants.`,
    author: 'Chef Kouadio',
    date: '2024-12-08',
    category: 'Événement',
    image: 'https://images.unsplash.com/photo-1556909114-d5b5ae80a0d5?w=800',
    featured: false
  },
  {
    id: 4,
    title: 'Partenariat avec les producteurs locaux',
    excerpt: 'Nous renforçons notre engagement pour la qualité en nous associant directement avec les producteurs locaux.',
    content: `Dans notre démarche de qualité et de soutien à l'économie locale, nous avons signé des partenariats exclusifs avec plusieurs producteurs locaux de Côte d'Ivoire.

Nos nouveaux partenaires :
- Ferme bio de Yamoussoukro pour nos légumes
- Coopérative de pêcheurs de Grand-Bassam
- Producteurs de riz de Bouaké
- Éleveurs de volaille de Korhogo

Cette démarche nous permet de garantir la fraîcheur de nos produits tout en soutenant nos agriculteurs et pêcheurs locaux.`,
    author: 'Direction',
    date: '2024-12-05',
    category: 'Partenariat',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800',
    featured: false
  },
  {
    id: 5,
    title: 'Nouvelle décoration inspirée de l\'art baoulé',
    excerpt: 'Découvrez notre nouvelle décoration intérieure qui met à l\'honneur l\'art traditionnel baoulé.',
    content: `Nous avons le plaisir de vous dévoiler notre nouvelle décoration intérieure, fruit d'une collaboration avec des artisans baoulés de la région de Bouaké.

Nouveautés :
- Sculptures en bois précieux dans l'espace d'accueil
- Tissus kente authentiques pour les nappes
- Masques traditionnels exposés dans la salle
- Poteries décoratives de Katiola

Cette ambiance authentique vous plonge encore plus dans la culture ivoirienne tout en dégustant nos spécialités.`,
    author: 'Équipe Design',
    date: '2024-12-01',
    category: 'Décoration',
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800',
    featured: false
  }
];

export default function NewsPage() {
  const featuredArticle = newsArticles.find(article => article.featured);
  const otherArticles = newsArticles.filter(article => !article.featured);

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
            Actualités
          </motion.h1>
          <motion.p
            className="text-xl opacity-90 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Restez informé de toutes les nouveautés de La Boucherie Fine
          </motion.p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Article vedette */}
        {featuredArticle && (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-full">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-amber-600 text-white px-4 py-2 rounded-full font-semibold">
                    Article vedette
                  </div>
                </div>
                <div className="p-8 lg:p-12">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{new Date(featuredArticle.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4" />
                      <span>{featuredArticle.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TagIcon className="w-4 h-4" />
                      <span>{featuredArticle.category}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
                    {featuredArticle.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Autres articles */}
        <div>
          <motion.h2
            className="text-3xl font-bold text-gray-800 mb-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Autres actualités
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {otherArticles.map((article, index) => (
              <motion.article
                key={article.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-amber-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {article.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                  
                  <button className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
                    Lire la suite →
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <motion.section
          className="mt-20 bg-gradient-to-r from-amber-600 to-red-600 rounded-3xl p-8 lg:p-12 text-white text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Restez informé</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Inscrivez-vous à notre newsletter pour recevoir toutes nos actualités et offres spéciales
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-6 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
              S&apos;inscrire
            </button>
          </div>
        </motion.section>
      </div>

      <Footer />
    </div>
  );
}