"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { reservationService } from "@/services/api";

interface ReservationFormData {
  nom: string;
  email: string;
  telephone: string;
  nbPersonnes: number;
  date: string;
  heure: string;
  commentaires: string;
}

interface ToastProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const Toast = ({ type, message, onClose }: ToastProps) => (
  <motion.div
    initial={{ opacity: 0, y: -50, scale: 0.3 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -50, scale: 0.3 }}
    className={`fixed top-4 right-4 z-50 p-6 rounded-2xl shadow-2xl max-w-md border-2 ${
      type === 'success' 
        ? 'bg-restaurant-black border-green-500 text-green-400'
        : 'bg-restaurant-black border-restaurant-primary text-restaurant-primary'
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-3 ${
          type === 'success' ? 'bg-green-500' : 'bg-restaurant-primary'
        }`} />
        <span className="font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-gray-400 hover:text-restaurant-white"
      >
        ✕
      </button>
    </div>
  </motion.div>
);

export default function ReservationsPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<ReservationFormData>({
    nom: "",
    email: "",
    telephone: "",
    nbPersonnes: 2,
    date: "",
    heure: "",
    commentaires: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [errors, setErrors] = useState<Partial<ReservationFormData>>({});

  // Créneaux horaires disponibles
  const timeSlots = [
    '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  // Redirection si non authentifié
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Pré-remplir le formulaire avec les données utilisateur
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nom: user.nom || "",
        email: user.email || "",
        telephone: user.telephone || ""
      }));
    }
  }, [user]);

  // Auto-fermeture du toast après 5 secondes
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Partial<ReservationFormData> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le numéro de téléphone est obligatoire';
    } else if (!/^[\d\s\+\-\(\)]{8,20}$/.test(formData.telephone.trim())) {
      newErrors.telephone = 'Format de téléphone invalide';
    }

    if (!formData.date) {
      newErrors.date = 'La date est obligatoire';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'La date ne peut pas être dans le passé';
      }
    }

    if (!formData.heure) {
      newErrors.heure = 'L\'heure est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setToast({
        type: 'error',
        message: 'Veuillez corriger les erreurs dans le formulaire'
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Appel à l'API backend
      const response = await fetch('/api/reservations/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: formData.nom.trim(),
          email: formData.email.trim(),
          telephone: formData.telephone.trim(),
          date: formData.date,
          heure: formData.heure,
          nbPersonnes: formData.nbPersonnes,
          commentaires: formData.commentaires.trim()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setToast({
          type: 'success',
          message: `Merci ${formData.nom} ! Votre réservation (${result.data.numero}) a bien été enregistrée. Nous vous contacterons sous peu.`
        });

        // Réinitialiser le formulaire
        setFormData({
          nom: "",
          email: "",
          telephone: "",
          nbPersonnes: 2,
          date: "",
          heure: "",
          commentaires: ""
        });

      } else {
        // Gestion des erreurs spécifiques du backend
        setToast({
          type: 'error',
          message: result.message || 'Une erreur est survenue lors de la réservation.'
        });

        // Affichage des erreurs de validation détaillées
        if (result.details && result.details.length > 0) {
          console.log('Détails des erreurs:', result.details);
        }
      }

    } catch (error) {
      console.error('Erreur réseau:', error);
      setToast({
        type: 'error',
        message: 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des changements dans le formulaire
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nbPersonnes' ? parseInt(value) : value
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name as keyof ReservationFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Date minimale (aujourd'hui)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-restaurant-black text-restaurant-white">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop" 
            alt="Restaurant �l�gant La Boucherie Fine" 
            fill 
            className="object-cover brightness-40" 
            unoptimized 
          />
        </div>
        
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="text-6xl">🍷</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Réservez votre table à <span className="text-restaurant-primary">La Boucherie-Fine</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl opacity-90 max-w-2xl mx-auto"
          >
            Vivez une expérience gastronomique exceptionnelle dans l&apos;ambiance raffinée de notre restaurant.
          </motion.p>
        </div>
      </section>

      {/* Formulaire de réservation */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-restaurant-primary/20"
          >
            <div className="bg-gradient-to-r from-restaurant-primary to-red-700 p-8 text-center">
              <span className="text-4xl mb-4 block">🍽️</span>
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
                Formulaire de réservation
              </h2>
              <p className="text-red-100">Remplissez les informations ci-dessous</p>
            </div>

            <div className="p-8">
              {/* Formulaire de réservation */}
              <motion.form
                onSubmit={handleSubmit}
                className="max-w-2xl mx-auto space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {/* Row 1: Nom et Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nom" className="block text-restaurant-white text-sm font-medium mb-3">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl bg-gray-800 border-2 text-restaurant-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-restaurant-primary transition-all duration-300 ${
                        errors.nom ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="Votre nom complet"
                    />
                    {errors.nom && (
                      <p className="text-red-400 text-xs mt-1">{errors.nom}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-restaurant-white text-sm font-medium mb-3">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl bg-gray-800 border-2 text-restaurant-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-restaurant-primary transition-all duration-300 ${
                        errors.email ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="votre@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Téléphone et Nombre de personnes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="telephone" className="block text-restaurant-white text-sm font-medium mb-3">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl bg-gray-800 border-2 text-restaurant-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-restaurant-primary transition-all duration-300 ${
                        errors.telephone ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="06 12 34 56 78"
                    />
                    {errors.telephone && (
                      <p className="text-red-400 text-xs mt-1">{errors.telephone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="nbPersonnes" className="block text-restaurant-white text-sm font-medium mb-3">
                      Nombre de personnes *
                    </label>
                    <select
                      id="nbPersonnes"
                      name="nbPersonnes"
                      value={formData.nbPersonnes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border-2 border-gray-600 text-restaurant-white focus:outline-none focus:ring-2 focus:ring-restaurant-primary hover:border-gray-500 transition-all duration-300"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} personne{i > 0 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Date et Heure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-restaurant-white text-sm font-medium mb-3">
                      Date de réservation *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={today}
                      className={`w-full px-4 py-3 rounded-xl bg-gray-800 border-2 text-restaurant-white focus:outline-none focus:ring-2 focus:ring-restaurant-primary transition-all duration-300 ${
                        errors.date ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                      }`}
                    />
                    {errors.date && (
                      <p className="text-red-400 text-xs mt-1">{errors.date}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="heure" className="block text-restaurant-white text-sm font-medium mb-3">
                      Heure de réservation *
                    </label>
                    <select
                      id="heure"
                      name="heure"
                      value={formData.heure}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl bg-gray-800 border-2 text-restaurant-white focus:outline-none focus:ring-2 focus:ring-restaurant-primary transition-all duration-300 ${
                        errors.heure ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <option value="">Sélectionnez une heure</option>
                      <optgroup label="Déjeuner">
                        {timeSlots.slice(0, 6).map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Dîner">
                        {timeSlots.slice(6).map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </optgroup>
                    </select>
                    {errors.heure && (
                      <p className="text-red-400 text-xs mt-1">{errors.heure}</p>
                    )}
                  </div>
                </div>

                {/* Row 4: Commentaires */}
                <div>
                  <label htmlFor="commentaires" className="block text-restaurant-white text-sm font-medium mb-3">
                    Commentaires ou demandes spéciales
                  </label>
                  <textarea
                    id="commentaires"
                    name="commentaires"
                    value={formData.commentaires}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border-2 border-gray-600 text-restaurant-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-restaurant-primary hover:border-gray-500 transition-all duration-300 resize-none"
                    placeholder="Allergies, anniversaire, demandes particulières..."
                  />
                </div>

                {/* Bouton de soumission */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-restaurant-primary to-red-700 text-restaurant-white py-4 px-8 rounded-xl font-bold text-lg shadow-2xl hover:from-red-700 hover:to-restaurant-primary transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-restaurant-white border-t-transparent rounded-full mr-3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Réservation en cours...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🍷</span>
                      Confirmer ma réservation
                    </>
                  )}
                </motion.button>

                {/* Note d'information */}
                <motion.div
                  className="text-center text-gray-400 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p>* Champs obligatoires</p>
                  <p className="mt-2">
                    📞 Pour toute demande urgente, appelez-nous au{' '}
                    <span className="text-restaurant-primary font-semibold">0544 54 47 35</span>
                  </p>
                </motion.div>
              </motion.form>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
