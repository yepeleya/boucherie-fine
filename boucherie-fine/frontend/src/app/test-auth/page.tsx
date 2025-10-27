'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function TestAuthPage() {
  const { login, register, user, isAuthenticated, logout } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: '', motDePasse: '' });
  const [registerForm, setRegisterForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: ''
  });
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const result = await login(loginForm.email, loginForm.motDePasse);
    setMessage(result.message);
    setIsLoading(false);
    
    if (result.success) {
      setLoginForm({ email: '', motDePasse: '' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const result = await register(registerForm);
    setMessage(result.message);
    setIsLoading(false);
    
    if (result.success) {
      setRegisterForm({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
        telephone: ''
      });
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-green-600">
            ✅ Authentification Réussie !
          </h1>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="font-semibold text-gray-800">Informations utilisateur :</h2>
              <p><strong>ID :</strong> {user.id}</p>
              <p><strong>Nom :</strong> {user.nom} {user.prenom}</p>
              <p><strong>Email :</strong> {user.email}</p>
              <p><strong>Téléphone :</strong> {user.telephone || 'Non renseigné'}</p>
              <p><strong>Rôle :</strong> <span className={user.role === 'ADMIN' ? 'text-red-600 font-bold' : 'text-blue-600'}>{user.role}</span></p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          🧪 Test d&apos;Authentification
        </h1>

        {/* Toggle entre Login et Register */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              mode === 'login' 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              mode === 'register' 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Inscription
          </button>
        </div>

        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-4 ${
              message.includes('succès') || message.includes('Connexion réussie')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message}
          </motion.div>
        )}

        {/* Comptes de test */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Comptes de test :</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Admin :</strong> admin@boucheriefine.ci / admin123</p>
            <p><strong>Client :</strong> ama.kouassi@email.com / client123</p>
          </div>
        </div>

        {/* Formulaire de connexion */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={loginForm.motDePasse}
                onChange={(e) => setLoginForm({ ...loginForm, motDePasse: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        )}

        {/* Formulaire d'inscription */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={registerForm.nom}
                  onChange={(e) => setRegisterForm({ ...registerForm, nom: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  value={registerForm.prenom}
                  onChange={(e) => setRegisterForm({ ...registerForm, prenom: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={registerForm.telephone}
                onChange={(e) => setRegisterForm({ ...registerForm, telephone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="0544 54 47 35"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe *
              </label>
              <input
                type="password"
                value={registerForm.motDePasse}
                onChange={(e) => setRegisterForm({ ...registerForm, motDePasse: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}