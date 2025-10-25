'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { StarIcon, HeartIcon, TrophyIcon, UsersIcon } from '@heroicons/react/24/solid';

const teamMembers = [
  {
    name: 'Chef Kouadio Aman',
    position: 'Chef Exécutif',
    bio: 'Fort de 15 ans d\'expérience dans la cuisine ivoirienne, le Chef Kouadio a travaillé dans les plus grands restaurants d\'Abidjan avant de rejoindre notre équipe.',
    image: 'https://images.unsplash.com/photo-1583394293214-28a5462c5573?w=400'
  },
  {
    name: 'Adjoua N\'Guessan',
    position: 'Responsable Service',
    bio: 'Spécialiste de l\'accueil et du service client, Adjoua veille à ce que chaque client vive une expérience mémorable.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616c19e3c93?w=400'
  },
  {
    name: 'Kouame Yao',
    position: 'Sommelier',
    bio: 'Expert en vins et boissons traditionnelles, Kouame conseille nos clients pour les meilleurs accords mets-boissons.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
  }
];

const values = [
  {
    icon: HeartIcon,
    title: 'Passion',
    description: 'Nous mettons tout notre cœur dans chaque plat que nous préparons, en respectant les traditions culinaires ivoiriennes.'
  },
  {
    icon: TrophyIcon,
    title: 'Excellence',
    description: 'Nous recherchons constamment l\'excellence dans nos produits, notre service et l\'expérience client.'
  },
  {
    icon: UsersIcon,
    title: 'Convivialité',
    description: 'Nous créons un environnement chaleureux où chaque client se sent comme à la maison.'
  },
  {
    icon: StarIcon,
    title: 'Authenticité',
    description: 'Nous préservons et célébrons l\'authenticité de la cuisine ivoirienne dans toute sa richesse.'
  }
];

export default function AboutPage() {
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
            À propos de nous
          </motion.h1>
          <motion.p
            className="text-xl opacity-90 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Découvrez l&apos;histoire de La Boucherie Fine et notre passion pour la cuisine ivoirienne authentique
          </motion.p>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Notre Histoire</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Fondée en 2015, La Boucherie Fine est née de la passion de préserver et de célébrer 
                  la richesse culinaire de la Côte d&apos;Ivoire. Notre fondateur, inspiré par les recettes 
                  traditionnelles de sa grand-mère, a voulu créer un lieu où l&apos;authenticité rencontre 
                  l&apos;excellence.
                </p>
                <p>
                  Située au cœur d&apos;Abidjan, notre restaurant s&apos;est rapidement imposé comme une référence 
                  de la gastronomie ivoirienne. Nous travaillons exclusivement avec des producteurs locaux 
                  pour garantir la fraîcheur et la qualité de nos ingrédients.
                </p>
                <p>
                  Aujourd&apos;hui, nous continuons cette mission avec la même passion, en proposant une 
                  expérience culinaire authentique dans un cadre moderne et accueillant.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600"
                alt="Notre restaurant"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-amber-600 text-white p-6 rounded-2xl">
                <div className="text-3xl font-bold">9+</div>
                <div className="text-sm">Années d&apos;expérience</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Nos Valeurs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Les principes qui guident notre approche de la cuisine et du service
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-amber-50 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 text-white rounded-full mb-4">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Équipe */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Notre Équipe</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Rencontrez les professionnels passionnés qui font de La Boucherie Fine un lieu d&apos;exception
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-amber-600 font-semibold mb-3">{member.position}</p>
                  <p className="text-gray-600 leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Nos Chiffres</h2>
            <p className="text-xl opacity-90">
              Les chiffres qui témoignent de notre succès et de votre confiance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '15,000+', label: 'Clients satisfaits' },
              { number: '50+', label: 'Plats au menu' },
              { number: '500+', label: 'Commandes/mois' },
              { number: '4.8/5', label: 'Note moyenne' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-amber-400 mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement */}
      <section className="py-20 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Notre Engagement</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Nous nous engageons à préserver et transmettre les traditions culinaires ivoiriennes 
              tout en soutenant l&apos;économie locale. Chaque plat que nous servons raconte une histoire, 
              celle de notre culture et de notre passion pour l&apos;excellence.
            </p>
            <motion.button
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Découvrir nos menus
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}