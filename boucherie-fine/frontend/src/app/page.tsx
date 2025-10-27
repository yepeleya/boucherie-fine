"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialIcons from "@/components/SocialIcons";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

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

export default function Home() {
  const [platsSelectionnes, setPlatsSelectionnes] = useState<Plat[]>([]);
  const [loadingPlats, setLoadingPlats] = useState(true);

  useEffect(() => {
    const fetchPlatsSelectionnes = async () => {
      try {
        const response = await fetch('/api/menus');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Sélectionner quelques plats des deux menus pour la page d'accueil
            const platsInterieur = data.data.menuInterieur.categories.flatMap((cat: Categorie) => cat.plats).slice(0, 3);
            const platsExterieur = data.data.menuExterieur.categories.flatMap((cat: Categorie) => cat.plats).slice(0, 3);
            
            // Mélanger et prendre 6 plats au total
            const tousPlatsMelanges = [...platsInterieur, ...platsExterieur].slice(0, 6);
            setPlatsSelectionnes(tousPlatsMelanges);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des plats:', error);
      } finally {
        setLoadingPlats(false);
      }
    };

    fetchPlatsSelectionnes();
  }, []);

  return (
    <main className="min-h-screen text-restaurant-white page-entrance">
      <Header />

      {/* HERO */}
      <section className="relative h-[78vh] flex items-center">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image src="https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=1600&auto=format&fit=crop" alt="Chef grillant une viande" fill className="object-cover brightness-75" unoptimized />
        </div>

        <div className="hero-overlay"></div>
        <div className="hero-smoke"></div>

        <div className="container mx-auto px-6 relative z-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto tracking-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Savourez l&apos;excellence de la viande fine.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-restaurant-white/85 max-w-2xl mx-auto"
          >
            Un voyage gastronomique entre passion, feu et finesse — sélection des meilleures pièces, cuisson maîtrisée.
          </motion.p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <motion.a
              whileHover={{ scale: 1.03 }}
              href="/menus"
              className="btn-primary"
            >
              Découvrir nos menus
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.03 }}
              href="/commandes"
              className="btn-outline"
            >
              Commander en ligne
            </motion.a>
          </div>
        </div>
      </section>

      {/* PRESENTATION */}
      <section className="py-20 bg-restaurant-white text-restaurant-black">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop"
                alt="Chef et viande"
                width={900}
                height={700}
                className="rounded-2xl object-cover w-full shadow-2xl"
              />
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                L&apos;art de la viande selon La Boucherie-Fine.
              </h2>
              <p className="text-lg mb-6 text-gray-700">
                Nous sélectionnons avec soin les pièces d&apos;exception. Maîtrise des cuissons, marinades discrètes et une passion pour le goût.
              </p>
              <p className="mb-6 text-gray-700">
                Chaque recette est une promesse : du produit à l&apos;assiette, une expérience chaleureuse et raffinée.
              </p>

              <a href="/a-propos" className="btn-outline">
                En savoir plus sur nous
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MENUS & SPECIALITES */}
      <section className="py-20 bg-restaurant-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-restaurant-white" style={{ fontFamily: "var(--font-playfair)" }}>Nos Menus & Spécialités</h3>
            <p className="text-restaurant-white/80 mt-3 max-w-2xl mx-auto">Grille de spécialités, viandes maturées, grillades et créations du chef.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingPlats ? (
              // Skeleton loading pour 6 plats
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-restaurant-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-44 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-gray-300 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : platsSelectionnes.length > 0 ? (
              platsSelectionnes.map((plat) => (
                <motion.article
                  key={plat.id}
                  className="bg-restaurant-white rounded-2xl overflow-hidden text-restaurant-black shadow-lg hover:shadow-2xl transform hover:scale-102 transition-all duration-300 border-2 border-transparent hover:border-restaurant-primary"
                  whileHover={{ y: -6 }}
                >
                  <div className="h-44 overflow-hidden relative">
                    <Image 
                      src="https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=900&auto=format&fit=crop" 
                      alt={plat.nom} 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold mb-2 line-clamp-2">{plat.nom}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{plat.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-restaurant-primary">
                        {plat.prix ? `${plat.prix.toLocaleString()} F` : 'Prix variable'}
                      </span>
                      <a href="/menus" className="text-sm text-restaurant-primary font-semibold hover:underline">
                        Voir détails
                      </a>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              // Fallback si pas de données
              Array.from({ length: 6 }).map((_, i) => (
                <motion.article
                  key={i}
                  className="bg-restaurant-white rounded-2xl overflow-hidden text-restaurant-black shadow-lg hover:shadow-2xl transform hover:scale-102 transition-all duration-300 border-2 border-transparent hover:border-restaurant-primary"
                  whileHover={{ y: -6 }}
                >
                  <div className="h-44 overflow-hidden relative">
                    <Image 
                      src="https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=900&auto=format&fit=crop" 
                      alt={`Spécialité ${i + 1}`} 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold mb-2">Spécialité {i + 1}</h4>
                    <p className="text-sm text-gray-600 mb-4">Une sélection de nos meilleures créations culinaires.</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-restaurant-primary">Prix variable</span>
                      <a href="/menus" className="text-sm text-restaurant-primary font-semibold hover:underline">
                        Voir détails
                      </a>
                    </div>
                  </div>
                </motion.article>
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <a href="/menus" className="btn-outline">Voir la carte complète</a>
          </div>
        </div>
      </section>

      {/* RESERVATION RAPIDE */}
      <section className="py-12 bg-restaurant-red text-restaurant-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black/20 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h4 className="text-xl font-semibold">Une table vous attend…</h4>
              <p className="text-sm opacity-90">Réservez en quelques clics — disponibilité en temps réel.</p>
            </div>
          </div>

            <a href="/reservations" className="btn-primary">Réservez maintenant</a>
        </div>
      </section>

      {/* COMMANDE EN LIGNE */}
      <section className="py-20 bg-restaurant-white text-restaurant-black">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>Commandez nos spécialités chez vous</h3>
            <p className="mb-6 text-gray-700">Service à emporter et livraison. Profitez de nos grillades et plats signatures chez vous.</p>
            <a href="/commandes" className="btn-primary">Passer une commande</a>
          </div>
          <div>
            <Image src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop" alt="Plat à emporter" width={900} height={600} className="rounded-2xl object-cover shadow-xl" />
          </div>
        </div>
      </section>

      {/* ACTUALITES */}
      <section className="py-20 bg-restaurant-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold" style={{ fontFamily: "var(--font-playfair)" }}>Actualités</h3>
            <p className="text-restaurant-white/80 mt-2">Évènements, offres et nouveautés</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1,2,3].map((n)=> (
              <motion.article key={n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: n*0.1 }} className="bg-restaurant-white text-restaurant-black rounded-2xl overflow-hidden shadow-md">
                <Image src={`https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=900&auto=format&fit=crop`} alt={`Actu ${n}`} width={900} height={220} className="w-full h-44 object-cover" unoptimized />
                <div className="p-5">
                  <h4 className="font-semibold mb-2">Titre de l&apos;article {n}</h4>
                  <p className="text-sm text-gray-600 mb-4">Brève description de l&apos;événement ou de la nouveauté.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">25 oct. 2025</span>
                    <a href="/actualites" className="text-restaurant-primary font-semibold">Lire plus</a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* A PROPOS */}
      <section className="py-20 bg-restaurant-white text-restaurant-black">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Image src="https://images.unsplash.com/photo-1566554273541-37a9ca77b91b?q=80&w=1000&auto=format&fit=crop" alt="Equipe" width={900} height={700} className="rounded-2xl object-cover shadow-lg" />
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>À propos</h3>
            <p className="text-gray-700 mb-4">La Boucherie-Fine est née d&apos;une passion pour la viande d&apos;exception et le savoir-faire. Nous célébrons les saveurs authentiques, les cuissons précises et l&apos;accueil chaleureux.</p>
            <p className="text-gray-700 mb-6 italic">«La flambée est l&apos;âme du plat» — Chef François</p>
            <a href="/a-propos" className="btn-outline">Lire notre histoire</a>
          </div>
        </div>
      </section>

      {/* CONTACT & RESEAUX */}
      <section className="py-16 bg-restaurant-black text-restaurant-white">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-2xl font-bold mb-4">Contact</h4>
            <p className="mb-2">Adresse: Riviera 3, Abidjan, Côte d&apos;Ivoire</p>
            <p className="mb-2">Téléphone: 0544 54 47 35</p>
            <p className="mb-2">Email: contact@boucheriefine.ci</p>
            <p className="mb-4">Horaires: Lun-Jeu 11h-00h | Ven-Dim 10h-02h</p>

            <div className="flex items-center gap-4 mt-4">
              <SocialIcons variant="restaurant" size="lg" />
            </div>
          </div>

          <div>
            <div className="w-full h-64 rounded-2xl overflow-hidden shadow-lg">
              <iframe 
                className="w-full h-full" 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.3085573739343!2d-3.9588908845922385!3d5.3541901965431385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc1edebf6d82471%3A0x46e2309c25466ba1!2sLa%20Boucherie%20Fine!5e0!3m2!1sfr!2sfr!4v1635000000000!5m2!1sfr!2sfr" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              >
              </iframe>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}