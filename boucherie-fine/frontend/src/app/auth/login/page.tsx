'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage('');

    // Validation simple
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) newErrors.email = 'L\'email est requis';
    if (!formData.motDePasse) newErrors.motDePasse = 'Le mot de passe est requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.motDePasse);
      
      if (result.success) {
        setMessage('Connexion réussie ! Redirection...');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setMessage(result.message);
      }
    } catch (error: unknown) {
      console.error('Erreur de connexion:', error);
      setMessage('Une erreur est survenue lors de la connexion');
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
        {/* Section Formulaire - Gauche */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex items-center justify-center p-8 bg-restaurant-white"
        >
          <div className="max-w-md w-full">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center mb-8"
            >
              <Link href="/" className="inline-block mb-6">
                <Image
                  src="/logo-white.png"
                  alt="La Boucherie Fine"
                  width={80}
                  height={80}
                  className="mx-auto filter brightness-0"
                />
              </Link>
              <h1 className="text-3xl font-bold text-restaurant-black mb-2">
                Bon retour !
              </h1>
              <p className="text-gray-600">
                Connectez-vous à votre espace La Boucherie Fine
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

            {/* Comptes de test */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
            >
              <h3 className="font-semibold text-blue-800 mb-2 text-sm flex items-center">
                🧪 Comptes de test disponibles
              </h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Admin :</strong> admin@boucheriefine.ci / admin123</p>
                <p><strong>Client :</strong> ama.kouassi@email.com / client123</p>
              </div>
            </motion.div>

            {/* Formulaire */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-restaurant-black mb-2">
                  Adresse email
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

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-restaurant-black mb-2">
                  Mot de passe
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
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
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

              {/* Bouton de connexion */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-restaurant-primary to-restaurant-primary-dark text-restaurant-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-restaurant-primary-dark hover:to-restaurant-primary transition-all duration-300 transform disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-restaurant-white mr-2"></div>
                    Connexion...
                  </div>
                ) : (
                  <>
                    <span>Se connecter</span>
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
                  Pas encore de compte ?{' '}
                  <Link 
                    href="/auth/register" 
                    className="text-restaurant-primary hover:text-restaurant-primary-dark font-semibold transition-colors"
                  >
                    Créez un compte
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

        {/* Section Image - Droite */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex flex-1 relative overflow-hidden"
        >
          {/* Image de fond */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80"
              alt="Restaurant élégant"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* Overlay dégradé */}
          <div className="absolute inset-0 bg-gradient-to-br from-restaurant-black/70 via-restaurant-primary/60 to-restaurant-primary-dark/80"></div>
          
          {/* Contenu */}
          <div className="relative z-10 flex items-center justify-center p-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-center text-restaurant-white"
            >
              <h2 className="text-4xl font-bold mb-6">
                Bienvenue chez La Boucherie Fine
              </h2>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Découvrez nos viandes d&apos;exception et notre service personnalisé. 
                Connectez-vous pour accéder à vos commandes, réservations et profil.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="bg-restaurant-white/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <div className="text-2xl mb-2">🥩</div>
                  <h3 className="font-semibold">Viandes Premium</h3>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="bg-restaurant-white/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <div className="text-2xl mb-2">🍽️</div>
                  <h3 className="font-semibold">Réservations</h3>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="bg-restaurant-white/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <div className="text-2xl mb-2">🚚</div>
                  <h3 className="font-semibold">Livraison</h3>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
