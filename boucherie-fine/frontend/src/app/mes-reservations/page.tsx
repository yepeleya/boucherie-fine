'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { reservationService } from '@/services/api';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon as UsersIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Reservation {
  id: number;
  numero: string;
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'TERMINEE';
  dateReservation: string;
  heureReservation: string;
  nombrePersonnes: number;
  tableSpeciale?: string;
  commentaires?: string;
  dateCreation: string;
  restaurant: {
    nom: string;
    adresse: string;
    telephone: string;
  };
}

export default function MesReservationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [activeFilter, setActiveFilter] = useState<'TOUTES' | 'EN_ATTENTE' | 'CONFIRMEE' | 'TERMINEE' | 'ANNULEE'>('TOUTES');
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les modales
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Vérifier l'authentification
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Charger les vraies réservations depuis l'API
  useEffect(() => {
    if (isAuthenticated && user) {
      const loadUserReservations = async () => {
        try {
          setLoadingReservations(true);
          setError(null);
          
          // Appel à l'API pour récupérer les réservations de l'utilisateur connecté
          const userReservations = await reservationService.getUserReservations();
          
          // Mettre à jour l'état avec les vraies données
          setReservations(userReservations);
          setFilteredReservations(userReservations);
          
        } catch (error: unknown) {
          console.error('Erreur lors du chargement des réservations:', error);
          setError('Impossible de charger vos réservations. Veuillez réessayer.');
          
          // En cas d'erreur, afficher une liste vide (pas de données de simulation)
          setReservations([]);
          setFilteredReservations([]);
          
        } finally {
          setLoadingReservations(false);
        }
      };
      
      loadUserReservations();
    }
  }, [isAuthenticated, user]);

  // Filtrage des réservations par statut
  useEffect(() => {
    if (activeFilter === 'TOUTES') {
      setFilteredReservations(reservations);
    } else {
      setFilteredReservations(reservations.filter(r => r.statut === activeFilter));
    }
  }, [activeFilter, reservations]);

  const getStatutBadge = (statut: string) => {
    const configs = {
      'EN_ATTENTE': { color: 'bg-orange-100 text-orange-800', icon: ClockIcon, text: 'En attente' },
      'CONFIRMEE': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Confirmée' },
      'ANNULEE': { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Annulée' },
      'TERMINEE': { color: 'bg-gray-100 text-gray-800', icon: CheckCircleIcon, text: 'Terminée' }
    };

    const config = configs[statut as keyof typeof configs];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const isReservationPassee = (dateReservation: string, heureReservation: string) => {
    const reservationDateTime = new Date(`${dateReservation}T${heureReservation}`);
    return reservationDateTime < new Date();
  };

  const peutModifier = (reservation: Reservation) => {
    return !isReservationPassee(reservation.dateReservation, reservation.heureReservation) 
           && ['EN_ATTENTE', 'CONFIRMEE'].includes(reservation.statut);
  };

  const peutAnnuler = (reservation: Reservation) => {
    return !isReservationPassee(reservation.dateReservation, reservation.heureReservation) 
           && ['EN_ATTENTE', 'CONFIRMEE'].includes(reservation.statut);
  };

  // Fonction pour annuler une réservation
  const handleCancelReservation = async () => {
    console.log('🚫 Début annulation, réservation:', selectedReservation);
    if (!selectedReservation) {
      console.log('❌ Aucune réservation sélectionnée');
      return;
    }
    
    try {
      console.log('🔄 Début du processus d\'annulation pour réservation ID:', selectedReservation.id, 'numéro:', selectedReservation.numero);
      setActionLoading(true);
      
      const result = await reservationService.cancel(selectedReservation.id);
      console.log('✅ Annulation réussie:', result);
      
      // Actualiser la liste des réservations
      console.log('🔄 Actualisation de la liste des réservations...');
      const userReservations = await reservationService.getUserReservations();
      console.log('📋 Nouvelles réservations:', userReservations);
      
      setReservations(userReservations);
      setFilteredReservations(userReservations);
      
      // Fermer la modale
      setShowCancelModal(false);
      setSelectedReservation(null);
      console.log('✅ Modale fermée et processus terminé');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation:', error);
      setError('Impossible d\'annuler la réservation. Veuillez réessayer.');
    } finally {
      setActionLoading(false);
    }
  };

  // Fonction pour ouvrir la modale d'annulation
  const openCancelModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowCancelModal(true);
  };

  // Fonction pour ouvrir la modale de modification
  const openEditModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowEditModal(true);
  };

  const reservationsFiltrees = activeFilter === 'TOUTES'
    ? reservations
    : reservations.filter(res => res.statut === activeFilter);  if (isLoading || loadingReservations) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-restaurant-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos réservations...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-restaurant-black mb-4">
              Mes Réservations
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Gérez vos réservations de table en toute simplicité
            </p>
            
            {/* Message informatif sur le processus de validation */}
            <div className="bg-restaurant-primary/5 border border-restaurant-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  ℹ️
                </div>
                <div className="text-sm text-restaurant-black">
                  <p className="font-semibold mb-1 text-restaurant-primary">Processus de validation</p>
                  <p>Vos réservations apparaissent ici dès leur création. Elles sont d'abord "En attente" puis passent à "Confirmée" après validation par notre équipe. Vous recevrez une notification lors de la confirmation.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistiques rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-4 gap-6 mb-8"
          >
            {[
              { label: 'Total', count: reservations.length, color: 'bg-restaurant-primary', icon: '📊' },
              { label: 'En attente', count: reservations.filter(r => r.statut === 'EN_ATTENTE').length, color: 'bg-orange-500', icon: '⏳' },
              { label: 'Confirmées', count: reservations.filter(r => r.statut === 'CONFIRMEE').length, color: 'bg-green-500', icon: '✅' },
              { label: 'Terminées', count: reservations.filter(r => r.statut === 'TERMINEE').length, color: 'bg-gray-500', icon: '✨' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color} text-white text-xl mr-4`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
                    <p className="text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Filtres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {['TOUTES', 'EN_ATTENTE', 'CONFIRMEE', 'TERMINEE', 'ANNULEE'].map(statut => (
                <button
                  key={statut}
                  onClick={() => setActiveFilter(statut as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeFilter === statut
                      ? 'bg-restaurant-primary text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {statut === 'TOUS' ? 'Toutes' : statut.replace('_', ' ')}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Liste des réservations */}
          <div className="grid gap-6">
            {reservationsFiltrees.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <CalendarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Aucune réservation trouvée
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeFilter === 'TOUTES' 
                    ? 'Vous n\'avez pas encore fait de réservation.'
                    : `Aucune réservation avec le statut "${activeFilter.replace('_', ' ')}".`
                  }
                </p>
                <motion.a
                  href="/reservations"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-restaurant-primary text-restaurant-white px-6 py-3 rounded-lg font-semibold hover:bg-restaurant-primary-dark transition-colors"
                >
                  <CalendarIcon className="w-5 h-5" />
                  <span>Réserver une table</span>
                </motion.a>
              </motion.div>
            ) : (
              reservationsFiltrees.map((reservation, index) => (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                      <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                        <div className="bg-restaurant-primary/10 p-3 rounded-xl">
                          <CalendarIcon className="w-6 h-6 text-restaurant-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {reservation.numero}
                          </h3>
                          <p className="text-gray-600">
                            Créée le {new Date(reservation.dateCreation).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {getStatutBadge(reservation.statut)}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-restaurant-primary">
                            {new Date(reservation.dateReservation).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            {reservation.heureReservation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Détails de la réservation */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <UsersIcon className="w-4 h-4 mr-2" />
                            Détails de la réservation
                          </h4>
                          <div className="space-y-2 text-sm text-gray-700">
                            <p><strong className="text-gray-800">Nombre de personnes:</strong> {reservation.nombrePersonnes}</p>
                            {reservation.tableSpeciale && (
                              <p><strong className="text-gray-800">Table spéciale:</strong> {reservation.tableSpeciale}</p>
                            )}
                            {reservation.commentaires && (
                              <p><strong className="text-gray-800">Commentaires:</strong> {reservation.commentaires}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-2" />
                            Restaurant
                          </h4>
                          <div className="space-y-2 text-sm text-gray-700">
                            <p><strong className="text-gray-800">{reservation.restaurant.nom}</strong></p>
                            <p className="text-gray-600">{reservation.restaurant.adresse}</p>
                            <p className="text-gray-600">📞 {reservation.restaurant.telephone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                      {peutModifier(reservation) && (
                        <motion.button
                          onClick={() => openEditModal(reservation)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-2 bg-restaurant-primary text-restaurant-white px-4 py-2 rounded-lg hover:bg-restaurant-primary-dark transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span>Modifier</span>
                        </motion.button>
                      )}
                      
                      {peutAnnuler(reservation) && (
                        <motion.button
                          onClick={() => openCancelModal(reservation)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Annuler</span>
                        </motion.button>
                      )}

                      <motion.a
                        href={`/contact?reservation=${reservation.numero}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 bg-gray-700 text-restaurant-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <span>💬</span>
                        <span>Contacter</span>
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Actions rapides */}
          {reservations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Actions rapides
              </h3>
              <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <motion.a
                  href="/reservations"
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center space-x-2 bg-restaurant-primary text-restaurant-white py-3 px-4 rounded-xl hover:bg-restaurant-primary-dark transition-colors"
                >
                  <CalendarIcon className="w-5 h-5" />
                  <span>Nouvelle réservation</span>
                </motion.a>
                
                <motion.a
                  href="/menus"
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center space-x-2 bg-gray-700 text-restaurant-white py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <span>📋</span>
                  <span>Voir les menus</span>
                </motion.a>
                
                <motion.a
                  href="/profile"
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <span>👤</span>
                  <span>Mon profil</span>
                </motion.a>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Modale d'annulation */}
      <AnimatePresence>
        {showCancelModal && selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Annuler la réservation</h3>
                  <p className="text-sm text-gray-500">Cette action est irréversible</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Êtes-vous sûr de vouloir annuler votre réservation{' '}
                  <span className="font-semibold">{selectedReservation.numero}</span>{' '}
                  du {new Date(selectedReservation.dateReservation).toLocaleDateString('fr-FR')}{' '}
                  à {selectedReservation.heureReservation} ?
                </p>
              </div>
              
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={actionLoading}
                >
                  Garder
                </button>
                <button
                  onClick={handleCancelReservation}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Annulation...' : 'Annuler la réservation'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale de modification */}
      <AnimatePresence>
        {showEditModal && selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <PencilIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Modifier la réservation</h3>
                  <p className="text-sm text-gray-500">Réservation {selectedReservation.numero}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Pour modifier votre réservation, veuillez nous contacter directement.
                  Nos équipes pourront vous aider à ajuster votre réservation selon vos besoins.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    📞 Téléphone : <span className="font-semibold">0544 54 47 35</span><br />
                    📧 Email : <span className="font-semibold">contact@boucheriefine.ci</span>
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Fermer
                </button>
                <a
                  href={`/contact?reservation=${selectedReservation.numero}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Nous contacter
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}