'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  EyeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Commande {
  id: number;
  numero: string;
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'EN_PREPARATION' | 'PRETE' | 'LIVREE' | 'ANNULEE';
  total: number;
  dateCommande: string;
  dateLivraison?: string;
  adresseLivraison: string;
  produits: Array<{
    id: number;
    nom: string;
    prix: number;
    quantite: number;
  }>;
}

export default function MesCommandesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [filtreStatut, setFiltreStatut] = useState<string>('TOUS');
  const [commandeSelectionnee, setCommandeSelectionnee] = useState<Commande | null>(null);
  const [loadingCommandes, setLoadingCommandes] = useState(true);

  // Vérifier l'authentification
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Simuler le chargement des commandes
  useEffect(() => {
    if (isAuthenticated && user) {
      // Simulation de données - À remplacer par un appel API réel
      const commandesSimulees: Commande[] = [
        {
          id: 1,
          numero: 'CMD-2024-001',
          statut: 'LIVREE',
          total: 89.50,
          dateCommande: '2024-10-20T14:30:00Z',
          dateLivraison: '2024-10-21T18:00:00Z',
          adresseLivraison: 'Riviera 3, Abidjan',
          produits: [
            { id: 1, nom: 'Côte de bœuf Premium', prix: 45.00, quantite: 1 },
            { id: 2, nom: 'Filet de porc', prix: 22.50, quantite: 2 }
          ]
        },
        {
          id: 2,
          numero: 'CMD-2024-002',
          statut: 'EN_PREPARATION',
          total: 156.00,
          dateCommande: '2024-10-25T10:15:00Z',
          adresseLivraison: 'Cocody, Abidjan',
          produits: [
            { id: 3, nom: 'Gigot d\'agneau', prix: 78.00, quantite: 2 }
          ]
        },
        {
          id: 3,
          numero: 'CMD-2024-003',
          statut: 'CONFIRMEE',
          total: 67.50,
          dateCommande: '2024-10-26T09:45:00Z',
          adresseLivraison: 'Plateau, Abidjan',
          produits: [
            { id: 4, nom: 'Escalope de veau', prix: 33.75, quantite: 2 }
          ]
        }
      ];

      setTimeout(() => {
        setCommandes(commandesSimulees);
        setLoadingCommandes(false);
      }, 1000);
    }
  }, [isAuthenticated, user]);

  const getStatutBadge = (statut: string) => {
    const configs = {
      'EN_ATTENTE': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'En attente' },
      'CONFIRMEE': { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon, text: 'Confirmée' },
      'EN_PREPARATION': { color: 'bg-purple-100 text-purple-800', icon: ShoppingBagIcon, text: 'En préparation' },
      'PRETE': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Prête' },
      'LIVREE': { color: 'bg-green-100 text-green-800', icon: TruckIcon, text: 'Livrée' },
      'ANNULEE': { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Annulée' }
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

  const commandesFiltrees = filtreStatut === 'TOUS' 
    ? commandes 
    : commandes.filter(cmd => cmd.statut === filtreStatut);

  if (isLoading || loadingCommandes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-restaurant-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos commandes...</p>
        </div>
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
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-restaurant-black mb-4">
              Mes Commandes
            </h1>
            <p className="text-gray-600 text-lg">
              Suivez l&apos;état de vos commandes en temps réel
            </p>
          </motion.div>

          {/* Filtres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {['TOUS', 'EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'PRETE', 'LIVREE'].map(statut => (
                <button
                  key={statut}
                  onClick={() => setFiltreStatut(statut)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filtreStatut === statut
                      ? 'bg-restaurant-primary text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {statut === 'TOUS' ? 'Toutes' : statut.replace('_', ' ')}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Liste des commandes */}
          <div className="grid gap-6">
            {commandesFiltrees.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Aucune commande trouvée
                </h3>
                <p className="text-gray-600 mb-6">
                  {filtreStatut === 'TOUS' 
                    ? 'Vous n\'avez pas encore passé de commande.'
                    : `Aucune commande avec le statut "${filtreStatut.replace('_', ' ')}".`
                  }
                </p>
                <motion.a
                  href="/commandes"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-restaurant-primary text-restaurant-white px-6 py-3 rounded-lg font-semibold hover:bg-restaurant-primary-dark transition-colors"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span>Passer une commande</span>
                </motion.a>
              </motion.div>
            ) : (
              commandesFiltrees.map((commande, index) => (
                <motion.div
                  key={commande.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                        <div className="bg-restaurant-primary/10 p-3 rounded-xl">
                          <ShoppingBagIcon className="w-6 h-6 text-restaurant-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {commande.numero}
                          </h3>
                          <p className="text-gray-600 flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {new Date(commande.dateCommande).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {getStatutBadge(commande.statut)}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-restaurant-primary">
                            {commande.total.toFixed(2)} €
                          </p>
                          <p className="text-sm text-gray-600">
                            {commande.produits.length} produit{commande.produits.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Produits */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Produits commandés</h4>
                        <div className="space-y-2">
                          {commande.produits.map(produit => (
                            <div key={produit.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-800">{produit.nom}</p>
                                <p className="text-sm text-gray-600">Quantité: {produit.quantite}</p>
                              </div>
                              <p className="font-semibold text-restaurant-primary">
                                {(produit.prix * produit.quantite).toFixed(2)} €
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Informations de livraison</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-800 mb-2">
                            <strong>Adresse:</strong> {commande.adresseLivraison}
                          </p>
                          {commande.dateLivraison && (
                            <p className="text-gray-800">
                              <strong>Livrée le:</strong> {new Date(commande.dateLivraison).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCommandeSelectionnee(commande)}
                        className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>Voir détails</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Actions rapides */}
          {commandes.length > 0 && (
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
                  href="/commandes"
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center space-x-2 bg-restaurant-primary text-restaurant-white py-3 px-4 rounded-xl hover:bg-restaurant-primary-dark transition-colors"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span>Nouvelle commande</span>
                </motion.a>
                
                <motion.a
                  href="/profile"
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <span>👤</span>
                  <span>Mon profil</span>
                </motion.a>
                
                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
                >
                  <span>💬</span>
                  <span>Support</span>
                </motion.a>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}