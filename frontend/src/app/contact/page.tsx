'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PhoneIcon, MapPinIcon, ClockIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface FormData {
  nom: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
}

interface ToastProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

function Toast({ type, message, onClose }: ToastProps) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg text-white max-w-md ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const [formData, setFormData] = useState<FormData>({
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setToast({ type: 'success', message: 'Message envoyé avec succès ! Nous vous répondrons rapidement.' });
        setFormData({ nom: '', email: '', telephone: '', sujet: '', message: '' });
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch {
      setToast({ type: 'error', message: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-restaurant-black text-restaurant-white" ref={containerRef}>
      <Header />
      
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Hero Section avec Parallax */}
      <section className="relative h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <motion.div 
            style={{ y }}
            className="w-full h-[120%]"
          >
            <Image
              src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2074&auto=format&fit=crop"
              alt="Contactez La Boucherie-Fine"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="container mx-auto px-6 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto tracking-tight text-shadow mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Contact & Localisation
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-restaurant-white/90 max-w-3xl mx-auto leading-relaxed"
          >
            Nous sommes à votre écoute pour vos réservations, commandes, événements et demandes particulières.
          </motion.p>
        </div>
      </section>

      {/* Section Informations de contact */}
      <section className="py-20 bg-restaurant-black">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Téléphone */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-restaurant-black border border-red-600/30 rounded-2xl p-8 text-center hover:border-red-600/60 transition-all duration-300 cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <PhoneIcon className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-4">Téléphone</h3>
              <a 
                href="tel:+2250544544735" 
                className="text-red-500 hover:text-red-400 transition-colors text-lg font-semibold"
              >
                +225 05 44 54 47 35
              </a>
            </motion.div>

            {/* Adresse */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-restaurant-black border border-red-600/30 rounded-2xl p-8 text-center hover:border-red-600/60 transition-all duration-300 cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <MapPinIcon className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-4">Adresse</h3>
              <p className="text-restaurant-white/80 mb-4">
                Riviera 3, Abidjan<br />
                Côte d&apos;Ivoire
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors"
                onClick={() => window.open('https://www.google.com/maps/place/La+Boucherie+Fine/@5.3541955,-3.9614657,17z/data=!3m1!4b1!4m6!3m5!1s0xfc1edebf6d82471:0x46e2309c25466ba1!8m2!3d5.3541902!4d-3.9588908!16s%2Fg%2F11j02634zm', '_blank')}
              >
                Ouvrir dans Google Maps
              </motion.button>
            </motion.div>

            {/* Horaires */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-restaurant-black border border-red-600/30 rounded-2xl p-8 text-center hover:border-red-600/60 transition-all duration-300"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <ClockIcon className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-4">Horaires d&apos;ouverture</h3>
              <div className="text-restaurant-white/80 space-y-2">
                <p><strong className="text-white">Lun–Sam :</strong> 11h00 – 23h00</p>
                <p><strong className="text-white">Dimanche :</strong> 15h00 – 23h00</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Formulaire de contact professionnel */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-restaurant-black">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                Formulaire de Contact
              </h2>
              <p className="text-xl text-restaurant-white/80">
                Envoyez-nous votre message, nous vous répondrons rapidement
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-restaurant-black/50 backdrop-blur-sm border border-red-600/20 rounded-3xl p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/20 border border-red-600/30 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white placeholder-white/60"
                      placeholder="Votre nom complet"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/20 border border-red-600/30 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white placeholder-white/60"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black/20 border border-red-600/30 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white placeholder-white/60"
                      placeholder="0544 54 47 35"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Sujet *
                    </label>
                    <select
                      name="sujet"
                      value={formData.sujet}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/20 border border-red-600/30 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white"
                    >
                      <option value="" className="bg-black text-white">Sélectionner un sujet</option>
                      <option value="Réservation" className="bg-black text-white">Réservation</option>
                      <option value="Commande" className="bg-black text-white">Commande</option>
                      <option value="Évènement" className="bg-black text-white">Évènement privé</option>
                      <option value="Autre" className="bg-black text-white">Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-black/20 border border-red-600/30 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none text-white placeholder-white/60"
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </div>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-5 h-5" />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Carte Google Maps */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              Trouvez-nous facilement
            </h2>
            <p className="text-xl text-restaurant-white/80">
              Nous sommes situés au cœur de Riviera 3, facilement accessible
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-red-600/20 shadow-2xl"
          >
            {/* Carte Google Maps intégrée */}
            <div className="relative h-96 w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.7449996154647!2d-3.961465684699345!3d5.354190296031128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc1edebf6d82471%3A0x46e2309c25466ba1!2sLa%20Boucherie%20Fine!5e0!3m2!1sfr!2sci!4v1733673600000!5m2!1sfr!2sci"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-3xl"
                title="Localisation La Boucherie-Fine"
              />
              
              {/* Overlay avec informations */}
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-xl border border-red-600/30">
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="w-6 h-6 text-red-500" />
                  <div>
                    <h3 className="font-bold text-lg">La Boucherie-Fine</h3>
                    <p className="text-sm text-white/80">Riviera 3, Abidjan</p>
                  </div>
                </div>
              </div>
              
              {/* Bouton d'ouverture dans Google Maps */}
              <div className="absolute bottom-4 right-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg flex items-center space-x-2"
                  onClick={() => window.open('https://www.google.com/maps/place/La+Boucherie+Fine/@5.3541955,-3.9614657,17z/data=!3m1!4b1!4m6!3m5!1s0xfc1edebf6d82471:0x46e2309c25466ba1!8m2!3d5.3541902!4d-3.9588908!16s%2Fg%2F11j02634zm', '_blank')}
                >
                  <MapPinIcon className="w-4 h-4" />
                  <span>Ouvrir dans Google Maps</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Réseaux sociaux */}
      <section className="py-20 bg-gradient-to-r from-red-900 to-red-800">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              Suivez-nous sur les réseaux
            </h2>
            <p className="text-xl text-white/90">
              Restez connectés avec La Boucherie-Fine pour nos dernières actualités
            </p>
          </motion.div>

          <div className="flex justify-center space-x-8">
            <motion.a
              href="https://facebook.com/boucheriefine"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-20 h-20 border-2 border-white/30 rounded-full flex items-center justify-center group-hover:border-white group-hover:bg-white transition-all duration-300">
                <svg className="w-10 h-10 text-white group-hover:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <p className="text-white mt-3 group-hover:text-white/80">Facebook</p>
            </motion.a>

            <motion.a
              href="https://instagram.com/boucheriefine"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-20 h-20 border-2 border-white/30 rounded-full flex items-center justify-center group-hover:border-white group-hover:bg-white transition-all duration-300">
                <svg className="w-10 h-10 text-white group-hover:text-pink-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <p className="text-white mt-3 group-hover:text-white/80">Instagram</p>
            </motion.a>

            <motion.a
              href="https://youtube.com/@boucheriefine"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-20 h-20 border-2 border-white/30 rounded-full flex items-center justify-center group-hover:border-white group-hover:bg-white transition-all duration-300">
                <svg className="w-10 h-10 text-white group-hover:text-red-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <p className="text-white mt-3 group-hover:text-white/80">YouTube</p>
            </motion.a>

            <motion.a
              href="https://wa.me/2250544544735"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-20 h-20 border-2 border-white/30 rounded-full flex items-center justify-center group-hover:border-white group-hover:bg-white transition-all duration-300">
                <svg className="w-10 h-10 text-white group-hover:text-green-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                </svg>
              </div>
              <p className="text-white mt-3 group-hover:text-white/80">WhatsApp</p>
            </motion.a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}