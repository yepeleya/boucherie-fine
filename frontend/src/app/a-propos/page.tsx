'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  StarIcon, 
  ShieldCheckIcon, 
  FireIcon, 
  UserGroupIcon,
  CheckBadgeIcon,
  EyeIcon,
  HeartIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { useRef, useEffect, useState } from 'react';

// Équipe dirigeante
const teamMembers = [
  {
    name: 'Chef Laurent Kouassi',
    position: 'Chef Exécutif & Propriétaire',
    bio: 'Maître-boucher depuis 20 ans, Laurent a perfectionné l\'art de la sélection et de la préparation des viandes premium.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800&auto=format&fit=crop',
    experience: '20+ ans d\'expertise'
  },
  {
    name: 'Marie-Claire Adjoua',
    position: 'Directrice du Service',
    bio: 'Garante de l\'excellence du service, Marie-Claire orchestre chaque expérience client avec passion.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop',
    experience: 'Service d\'exception'
  },
  {
    name: 'Jean-Baptiste Yao',
    position: 'Maître Grillardin',
    bio: 'Spécialiste des cuissons parfaites, Jean-Baptiste révèle toute la saveur de nos viandes d\'exception.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    experience: 'Cuissons maîtrisées'
  }
];

// Valeurs et engagements  
const values = [
  {
    icon: CheckBadgeIcon,
    title: 'Authenticité',
    description: 'Nous préservons les traditions culinaires tout en innovant avec créativité et respect.'
  },
  {
    icon: EyeIcon,
    title: 'Traçabilité',
    description: 'Chaque produit est sélectionné chez nos partenaires de confiance pour garantir la qualité.'
  },
  {
    icon: TrophyIcon,
    title: 'Qualité Supérieure',
    description: 'Nos standards d\'excellence ne souffrent d\'aucun compromis, de la sélection au service.'
  },
  {
    icon: HeartIcon,
    title: 'Satisfaction Client',
    description: 'Votre bonheur gustatif est notre plus belle récompense et notre motivation quotidienne.'
  }
];

// Expertise 
const expertise = [
  {
    icon: StarIcon,
    title: 'Sélection Rigoureuse',
    description: 'Nos viandes sont choisies auprès d\'éleveurs partenaires pour leur qualité exceptionnelle et leur traçabilité.',
    color: 'from-red-600 to-red-800'
  },
  {
    icon: FireIcon,
    title: 'Préparation Artisanale',
    description: 'Chaque pièce est préparée selon les règles de l\'art par nos maîtres-bouchers expérimentés.',
    color: 'from-orange-600 to-red-600'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Cuisson Maîtrisée',
    description: 'Nos grillardins expert révèlent tous les arômes grâce à des techniques de cuisson précises.',
    color: 'from-red-700 to-red-900'
  },
  {
    icon: UserGroupIcon,
    title: 'Service Haut de Gamme',
    description: 'Une équipe passionnée vous accompagne pour une expérience gastronomique mémorable.',
    color: 'from-red-800 to-black'
  }
];

// Counters animés
const CounterItem = ({ number, label, suffix = "" }: { number: number, label: string, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          let start = 0;
          const duration = 2000;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            setCount(Math.floor(progress * number));
            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [number, isVisible]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
        {count}{suffix}
      </div>
      <div className="text-white/80 text-sm uppercase tracking-wider">{label}</div>
    </div>
  );
};

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <main className="min-h-screen bg-restaurant-black text-restaurant-white page-entrance" ref={containerRef}>
      <Header />
      
      {/* 1️⃣ Hero Section Immersive avec Parallax */}
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <motion.div 
            style={{ y }}
            className="w-full h-[120%]"
          >
            <Image
              src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=2070&auto=format&fit=crop"
              alt="La Boucherie Fine - Excellence"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="hero-overlay"></div>
        
        <div className="container mx-auto px-6 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="text-6xl">🥩</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto tracking-tight text-shadow mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Histoire & Tradition
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-2xl md:text-3xl text-restaurant-white/90 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            L&apos;excellence de la viande, une passion artisanale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Link 
              href="#notre-histoire"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center"
            >
              Découvrir notre histoire
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2️⃣ Section - Notre Histoire */}
      <section id="notre-histoire" className="py-32 bg-restaurant-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-5xl font-bold text-restaurant-black mb-8" style={{ fontFamily: "var(--font-playfair)" }}>
                  Notre Histoire
                </h2>
                <div className="w-20 h-1 bg-red-600 mb-8"></div>
              </div>
              
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  <strong className="text-red-600">Fondée en 2018</strong>, La Boucherie-Fine est née d&apos;une vision simple : 
                  révolutionner l&apos;art de la viande premium en Côte d&apos;Ivoire. Notre fondateur, passionné de gastronomie, 
                  a voulu créer plus qu&apos;un restaurant – un véritable temple de la haute cuisine carnivore.
                </p>
                
                <p>
                  <strong>Pourquoi &ldquo;Boucherie-Fine&rdquo; ?</strong> Ce nom reflète notre double expertise : 
                  la maîtrise artisanale du boucher et la finesse du chef. Chaque pièce de viande est 
                  sélectionnée, préparée et cuisinée selon les plus hauts standards internationaux.
                </p>
                
                <p>
                  <strong>Notre mission :</strong> Offrir une expérience gastronomique d&apos;exception, 
                  où chaque bouchée révèle la noblesse du produit et le savoir-faire de nos artisans.
                </p>
                
                <p>
                  <strong className="text-red-600">Notre engagement qualité :</strong> Traçabilité totale, 
                  partenariats exclusifs avec les meilleurs éleveurs, et une exigence sans compromis 
                  de la sélection à l&apos;assiette.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?q=80&w=1000&auto=format&fit=crop"
                  alt="Chef en action"
                  width={600}
                  height={400}
                  className="w-full h-[500px] object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              
              <div className="absolute -bottom-8 -left-8 bg-red-600 text-white p-8 rounded-2xl shadow-xl">
                <div className="text-4xl font-bold">7+</div>
                <div className="text-sm uppercase tracking-wider">Années d&apos;Excellence</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3️⃣ Section - Notre Expertise */}
      <section className="py-32 bg-restaurant-black">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-restaurant-white mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
              Notre Expertise
            </h2>
            <p className="text-xl text-restaurant-white/80 max-w-3xl mx-auto">
              Quatre piliers d&apos;excellence qui font de chaque visite une expérience mémorable
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {expertise.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10, 
                  rotateX: 5,
                  scale: 1.02,
                  boxShadow: "0 25px 50px rgba(220, 38, 38, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                className="group bg-restaurant-white rounded-3xl p-8 hover:bg-red-50 transition-all duration-500 cursor-pointer"
              >
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-6`}
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <item.icon className="h-8 w-8 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-restaurant-black mb-4 group-hover:text-red-600 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4️⃣ Section - Valeurs & Engagements */}
      <section className="py-32 bg-gradient-to-br from-gray-900 to-restaurant-black">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-restaurant-white mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
              Nos Valeurs & Engagements
            </h2>
            <p className="text-xl text-restaurant-white/80 max-w-3xl mx-auto">
              Les principes fondamentaux qui guident chacune de nos actions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderColor: "rgba(220, 38, 38, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                className="text-center p-8 bg-restaurant-white/5 backdrop-blur-sm rounded-3xl border border-white/10 transition-all duration-300 group cursor-pointer"
              >
                <motion.div 
                  className="w-20 h-20 mx-auto mb-6 bg-red-600/20 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-colors duration-300"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.8 }}
                >
                  <value.icon className="h-10 w-10 text-red-600 group-hover:text-white transition-colors duration-300" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-restaurant-white mb-4">
                  {value.title}
                </h3>
                
                <p className="text-restaurant-white/70 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5️⃣ Section - L'Équipe */}
      <section className="py-32 bg-restaurant-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-restaurant-black mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
              Notre Équipe d&apos;Exception
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des professionnels passionnés qui incarnent l&apos;excellence de La Boucherie-Fine
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 80, rotateY: -20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -15, 
                  rotateY: 5,
                  scale: 1.02
                }}
                className="group text-center cursor-pointer"
              >
                <div className="relative mb-8 overflow-hidden rounded-3xl">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={400}
                      height={500}
                      className="w-full h-[400px] object-cover"
                      unoptimized
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="text-sm font-semibold text-red-400">{member.experience}</div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-restaurant-black mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
                  {member.name}
                </h3>
                
                <div className="text-red-600 font-semibold mb-4 uppercase tracking-wider text-sm">
                  {member.position}
                </div>
                
                <p className="text-gray-600 leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6️⃣ Section - Chiffres Clés */}
      <section className="py-32 bg-restaurant-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-restaurant-white mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
              L&apos;Excellence en Chiffres
            </h2>
            <p className="text-xl text-restaurant-white/80 max-w-3xl mx-auto">
              Sept années de passion qui parlent d&apos;elles-mêmes
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <CounterItem number={5000} label="Clients Satisfaits" suffix="+" />
            <CounterItem number={7} label="Années de Service" />
            <CounterItem number={25} label="Spécialités Maison" suffix="+" />
            <CounterItem number={1} label="Équipe Passionnée" />
          </div>
        </div>
      </section>

      {/* 7️⃣ CTA Final */}
      <section className="py-32 bg-gradient-to-r from-red-600 to-red-800 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8" style={{ fontFamily: "var(--font-playfair)" }}>
              Réservez votre table et vivez l&apos;expérience La Boucherie-Fine
            </h2>
            
            <p className="text-xl mb-12 text-white/90 max-w-2xl mx-auto">
              Laissez-vous séduire par l&apos;excellence de nos viandes et l&apos;art de notre service. 
              Une expérience gastronomique vous attend.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Link 
                  href="/reservations"
                  className="bg-white text-red-600 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors duration-300 text-lg inline-block"
                >
                  Réserver maintenant
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Link 
                  href="/menus"
                  className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-red-600 transition-all duration-300 text-lg inline-block"
                >
                  Découvrir nos menus
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}