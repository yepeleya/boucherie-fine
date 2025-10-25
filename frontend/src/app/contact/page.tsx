'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Header />
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md mx-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">Message envoyé !</h2>
          <p className="text-gray-600 mb-6">
            Merci {formData.name}, nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
              });
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
          >
            Nouveau message
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
            Contactez-nous
          </motion.h1>
          <motion.p
            className="text-xl opacity-90 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Nous sommes là pour vous accompagner et répondre à toutes vos questions
          </motion.p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Informations de contact */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-xl"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Nos Coordonnées</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPinIcon className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Adresse</h3>
                    <p className="text-gray-600">
                      Riviera 3<br />
                      Abidjan, Côte d&apos;Ivoire
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <PhoneIcon className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Téléphone</h3>
                    <a href="tel:0544544735" className="text-gray-600 hover:text-amber-600 transition-colors">
                      0544 54 47 35
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <EnvelopeIcon className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                    <a href="mailto:contact@boucheriefine.ci" className="text-gray-600 hover:text-amber-600 transition-colors">
                      contact@boucheriefine.ci
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <ClockIcon className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Horaires</h3>
                    <div className="text-gray-600 space-y-1">
                      <p><strong>Lun - Jeu :</strong> 11h00 - 00h00</p>
                      <p><strong>Ven - Dim :</strong> 10h00 - 02h00</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Réseaux sociaux */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-xl"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Suivez-nous</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://facebook.com/BoucherieFine" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
                  title="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com/boucheriefine" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 transition-colors"
                  title="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://tiktok.com/@boucheriefine" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors"
                  title="TikTok"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Formulaire de contact */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-xl"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center space-x-3 mb-8">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-amber-600" />
                <h2 className="text-3xl font-bold text-gray-800">Envoyez-nous un message</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="Votre nom"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="0544 54 47 35"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Sujet *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner un sujet</option>
                      <option value="reservation">Réservation</option>
                      <option value="commande">Commande</option>
                      <option value="evenement">Événement privé</option>
                      <option value="feedback">Avis/Suggestions</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
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

        {/* FAQ Section */}
        <motion.section
          className="mt-20 bg-white rounded-3xl p-8 lg:p-12 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Questions Fréquentes</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Acceptez-vous les réservations ?</h3>
                <p className="text-gray-600">Oui, nous recommandons fortement de réserver, surtout le weekend. Vous pouvez réserver en ligne ou par téléphone.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Livrez-vous ?</h3>
                <p className="text-gray-600">Oui, nous livrons dans tout Abidjan en moins de 30 minutes. Frais de livraison : 1000 FCFA.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Avez-vous des options végétariennes ?</h3>
                <p className="text-gray-600">Absolument ! Nous proposons plusieurs plats végétariens et pouvons adapter certains plats selon vos besoins.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Organisez-vous des événements privés ?</h3>
                <p className="text-gray-600">Oui, nous pouvons organiser des événements privés. Contactez-nous pour discuter de vos besoins spécifiques.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Quels sont vos moyens de paiement ?</h3>
                <p className="text-gray-600">Nous acceptons les espèces, cartes bancaires, Orange Money, MTN Money et Wave.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Proposez-vous des plats pour enfants ?</h3>
                <p className="text-gray-600">Oui, nous avons un menu enfant adapté avec des portions plus petites et des saveurs douces.</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </div>
  );
}