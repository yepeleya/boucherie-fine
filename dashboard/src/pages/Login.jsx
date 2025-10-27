// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import Preloader from '../components/Preloader';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || '/';

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'L\'adresse email est requise';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Validation simple des identifiants de démo
      if (formData.email === 'admin@boucheriefine.com' && formData.password === 'admin123') {
        // Simulation d'authentification pour la démo
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simuler une réponse d'authentification réussie
        const mockUser = {
          id: 1,
          nom: 'Administrateur',
          email: formData.email,
          role: 'admin'
        };
        
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
        
        // Stocker les données d'authentification
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        toast.success('Connexion réussie !');
        
        // Attendre un petit délai puis rediriger
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        throw new Error('Identifiants incorrects');
      }
    } catch (error) {
      toast.error('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (loading) {
    return <Preloader text="Connexion en cours..." />;
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-brand-gray-dark' : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      {/* Fond avec motif */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 opacity-10 ${
          isDark ? 'bg-white' : 'bg-brand-red'
        } rounded-full transform rotate-45`} />
        <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 opacity-5 ${
          isDark ? 'bg-white' : 'bg-brand-black'
        } rounded-full`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-md w-full mx-4"
      >
        {/* Bouton de thème */}
        <motion.button
          onClick={toggleTheme}
          className={`absolute top-0 right-0 p-2 rounded-lg ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-brand-black'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isDark ? '☀️' : '🌙'}
        </motion.button>

        {/* Logo et titre */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="mx-auto w-20 h-20 bg-brand-red rounded-2xl flex items-center justify-center shadow-xl mb-6">
            <span className="text-white font-bold text-2xl">LBF</span>
          </div>
          <h2 className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-brand-black'
          }`}>
            Dashboard Admin
          </h2>
          <p className={`mt-2 text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Connectez-vous à votre espace d'administration
          </p>
        </motion.div>

        {/* Formulaire de connexion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className={`rounded-2xl shadow-2xl p-8 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className={`h-5 w-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field pl-10 ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : ''
                  } ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-brand-black'
                  }`}
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className={`h-5 w-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : ''
                  } ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-brand-black'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className={`h-5 w-5 ${
                      isDark ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  ) : (
                    <EyeIcon className={`h-5 w-5 ${
                      isDark ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Se souvenir de moi */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-brand-red focus:ring-brand-red border-gray-300 rounded"
                />
                <label htmlFor="remember" className={`ml-2 block text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Se souvenir de moi
                </label>
              </div>
              <button 
                type="button" 
                className="text-sm text-brand-red hover:text-red-700 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton de connexion */}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </motion.button>
          </form>

          {/* Informations de test */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className={`mt-6 p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}
          >
            <p className={`text-xs text-center ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Plateforme de gestion pour La Boucherie Fine
            </p>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-8"
        >
          <p className={`text-xs ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>
            © 2025 La Boucherie Fine. Tous droits réservés.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}