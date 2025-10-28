'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmMotDePasse: '',
    telephone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { register } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!formData.motDePasse) newErrors.motDePasse = 'Le mot de passe est requis';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (formData.motDePasse && formData.motDePasse.length < 6) {
      newErrors.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.motDePasse !== formData.confirmMotDePasse) {
      newErrors.confirmMotDePasse = 'Les mots de passe ne correspondent pas';
    }

    if (formData.telephone && !/^[0-9\s\-\+\(\)]+$/.test(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const { confirmMotDePasse, ...registerData } = formData;
      const result = await register(registerData);
      
      if (result.success) {
        setMessage('Inscription réussie ! Redirection...');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setMessage(result.message);
      }
    } catch (error: unknown) {
      console.error('Erreur d\'inscription:', error);
      setMessage('Une erreur est survenue lors de l\'inscription');
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Section Image - Gauche */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-1 relative overflow-hidden"
        >
          {/* Image de fond */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Équipe culinaire"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* Overlay dégradé */}
          <div className="absolute inset-0 bg-gradient-to-br from-restaurant-black/80 via-restaurant-primary/70 to-restaurant-primary-dark/90"></div>
          
          {/* Contenu */}
          <div className="relative z-10 flex items-center justify-center p-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-center text-restaurant-white"
            >
            <h2 className="text-4xl font-bold mb-6">
              Rejoignez notre famille culinaire
            </h2>
            <p className="text-xl text-gray-100 mb-8 leading-relaxed">
              Créez votre compte pour profiter de nos services exclusifs, 
              gérer vos commandes et découvrir nos nouveautés en avant-première.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-center"
              >
                <div className="text-3xl mb-3">👥</div>
                <h3 className="font-semibold text-lg mb-2">Communauté Exclusive</h3>
                <p className="text-sm text-gray-200">Accès prioritaire aux nouveautés</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-center"
              >
                <div className="text-3xl mb-3">🎁</div>
                <h3 className="font-semibold text-lg mb-2">Offres Spéciales</h3>
                <p className="text-sm text-gray-200">Promotions membres exclusives</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-center"
              >
                <div className="text-3xl mb-3">📱</div>
                <h3 className="font-semibold text-lg mb-2">Gestion Facile</h3>
                <p className="text-sm text-gray-200">Commandes et réservations simplifiées</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-center"
              >
                <div className="text-3xl mb-3">⭐</div>
                <h3 className="font-semibold text-lg mb-2">Service Premium</h3>
                <p className="text-sm text-gray-200">Support client personnalisé</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Section Formulaire - Droite */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-8 bg-restaurant-white"
      >
        <div className="max-w-md w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-8"
          >
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo-white.png"
                alt="La Boucherie Fine"
                width={70}
                height={70}
                className="mx-auto filter brightness-0"
              />
            </Link>
            <h1 className="text-3xl font-bold text-restaurant-black mb-2">
              Créer un compte
            </h1>
            <p className="text-gray-600">
              Rejoignez La Boucherie Fine dès maintenant
            </p>
          </motion.div>

          {/* Messages */}
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl mb-6 text-center ${
                message.includes('réussie') 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message}
            </motion.div>
          )}

          {/* Formulaire */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onSubmit={handleSubmit} 
            className="space-y-5"
          >
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-restaurant-black mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={`form-input-light ${errors.nom ? 'form-input-error' : ''}`}
                  placeholder="Nom"
                />
                {errors.nom && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="form-error-message"
                  >
                    {errors.nom}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-restaurant-black mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className={`form-input-light ${errors.prenom ? 'form-input-error' : ''}`}
                  placeholder="Prénom"
                />
                {errors.prenom && (
                  <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-restaurant-black mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input-light ${errors.email ? 'form-input-error' : ''}`}
                placeholder="votre@email.com"
              />
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error-message"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-semibold text-restaurant-black mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className={`form-input-light ${errors.telephone ? 'form-input-error' : ''}`}
                placeholder="0544 54 47 35"
              />
              {errors.telephone && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error-message"
                >
                  {errors.telephone}
                </motion.p>
              )}
            </div>

            {/* Mots de passe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-restaurant-black mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="motDePasse"
                    value={formData.motDePasse}
                    onChange={handleChange}
                    className={`form-input-light pr-12 ${errors.motDePasse ? 'form-input-error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-restaurant-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.motDePasse && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="form-error-message"
                  >
                    {errors.motDePasse}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-restaurant-black mb-2">
                  Confirmer *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmMotDePasse"
                    value={formData.confirmMotDePasse}
                    onChange={handleChange}
                    className={`form-input-light pr-12 ${errors.confirmMotDePasse ? 'form-input-error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-restaurant-primary transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmMotDePasse && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="form-error-message"
                  >
                    {errors.confirmMotDePasse}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Bouton d'inscription */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-restaurant-primary to-restaurant-primary-dark text-restaurant-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-restaurant-primary-dark hover:to-restaurant-primary transition-all duration-300 transform disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Inscription...
                </div>
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </>
              )}
            </motion.button>

            {/* Liens */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="border-t border-gray-200 flex-grow"></div>
                <span className="px-4 text-gray-500 text-sm font-medium">ou</span>
                <div className="border-t border-gray-200 flex-grow"></div>
              </div>
              
              <p className="text-gray-600">
                Déjà un compte ?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-restaurant-primary hover:text-restaurant-primary-dark font-semibold transition-colors"
                >
                  Connectez-vous
                </Link>
              </p>
              
              <Link 
                href="/" 
                className="inline-block text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                ← Retour à l&apos;accueil
              </Link>
            </div>
          </motion.form>
        </div>
      </motion.div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
