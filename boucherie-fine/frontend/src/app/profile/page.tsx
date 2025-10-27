'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  PencilIcon, 
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: ''
  });

  // Vérifier l'authentification
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setMessage('Profil mis à jour avec succès !');
        setIsEditing(false);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
      setMessage('Erreur lors de la mise à jour du profil');
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || ''
      });
    }
    setIsEditing(false);
    setMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-restaurant-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header de la page */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-restaurant-black mb-4">
              Mon Profil
            </h1>
            <p className="text-gray-600 text-lg">
              Gérez vos informations personnelles
            </p>
          </motion.div>

          {/* Messages */}
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-2xl mx-auto p-4 rounded-xl mb-8 text-center ${
                message.includes('succès') 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message}
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar - Informations principales */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                {/* Avatar */}
                <div className="relative mx-auto w-24 h-24 mb-6">
                  <div className="w-full h-full bg-gradient-to-br from-restaurant-primary to-restaurant-primary-dark rounded-full flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-white" />
                  </div>
                  {user.role === 'ADMIN' && (
                    <div className="absolute -top-2 -right-2 bg-gold text-restaurant-black text-xs font-bold px-2 py-1 rounded-full">
                      ADMIN
                    </div>
                  )}
                </div>

                {/* Nom complet */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {user.nom} {user.prenom}
                </h2>
                <p className="text-gray-600 mb-6">{user.email}</p>

                {/* Badge de statut */}
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  user.role === 'ADMIN' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'ADMIN' ? '👑 Administrateur' : '👤 Client'}
                </div>

                {/* Date d'inscription */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Membre depuis
                  </p>
                  <p className="text-gray-800 font-medium">
                    {new Date(user.dateCreation).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Contenu principal - Formulaire */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Header avec bouton d'édition */}
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Informations personnelles
                  </h3>
                  
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 bg-restaurant-primary text-restaurant-white px-4 py-2 rounded-lg hover:bg-restaurant-primary-dark transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Modifier</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckIcon className="w-4 h-4" />
                        <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Annuler</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Formulaire */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <UserIcon className="w-4 h-4 inline mr-2" />
                      Nom *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-restaurant-primary focus:border-restaurant-primary transition-all"
                        placeholder="Votre nom"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">
                        {user.nom || 'Non renseigné'}
                      </div>
                    )}
                  </div>

                  {/* Prénom */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <UserIcon className="w-4 h-4 inline mr-2" />
                      Prénom
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-restaurant-primary focus:border-restaurant-primary transition-all"
                        placeholder="Votre prénom"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">
                        {user.prenom || 'Non renseigné'}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                      Email *
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-restaurant-primary focus:border-restaurant-primary transition-all"
                        placeholder="votre@email.com"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">
                        {user.email}
                      </div>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <PhoneIcon className="w-4 h-4 inline mr-2" />
                      Téléphone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-restaurant-primary focus:border-restaurant-primary transition-all"
                        placeholder="0544 54 47 35"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">
                        {user.telephone || 'Non renseigné'}
                      </div>
                    )}
                  </div>

                  {/* Adresse */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPinIcon className="w-4 h-4 inline mr-2" />
                      Adresse
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-restaurant-primary focus:border-restaurant-primary transition-all"
                        placeholder="Votre adresse complète"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">
                        {user.adresse || 'Non renseignée'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Actions rapides
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <motion.a
                      href="/mes-commandes"
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-3 px-4 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <span>📦</span>
                      <span>Mes commandes</span>
                    </motion.a>
                    
                    <motion.a
                      href="/mes-reservations"
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-3 px-4 rounded-xl hover:bg-green-100 transition-colors"
                    >
                      <span>🍽️</span>
                      <span>Mes réservations</span>
                    </motion.a>
                    
                    <motion.a
                      href="/commandes"
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-center space-x-2 bg-red-50 text-red-700 py-3 px-4 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <span>🛒</span>
                      <span>Nouvelle commande</span>
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}