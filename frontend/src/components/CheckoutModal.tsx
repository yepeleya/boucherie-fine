'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  UserIcon, 
  MapPinIcon, 
  PhoneIcon,
  CreditCardIcon,
  TruckIcon,
  ClockIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface CartItem {
  id: number;
  nom: string;
  prix: number;
  quantite: number;
  imageUrl?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onConfirmOrder: (orderData: OrderData) => void;
  isLoading?: boolean;
}

interface OrderData {
  items: Array<{
    produitId: number;
    quantite: number;
  }>;
  total: number;
  adresseLivraison?: string;
  telephone: string;
  typeCommande: 'CLICK_COLLECT' | 'LIVRAISON';
  heureRetrait?: string;
  notes?: string;
  modePaiement: string;
}

const DELIVERY_ZONES = [
  { name: 'Plateau', price: 1200, duration: '20-30 min', distance: '3-5 km', popular: true },
  { name: 'Cocody', price: 1500, duration: '30-45 min', distance: '5-8 km', popular: true },
  { name: 'Treichville', price: 1800, duration: '30-40 min', distance: '6-10 km', popular: false },
  { name: 'Marcory', price: 2000, duration: '35-50 min', distance: '8-12 km', popular: false },
  { name: 'Koumassi', price: 2300, duration: '40-55 min', distance: '10-14 km', popular: false },
  { name: 'Adjamé', price: 2200, duration: '40-55 min', distance: '10-15 km', popular: false },
  { name: 'Yopougon', price: 2500, duration: '45-60 min', distance: '12-18 km', popular: false },
  { name: 'Port-Bouët', price: 2800, duration: '45-65 min', distance: '12-16 km', popular: false },
  { name: 'Abobo', price: 3000, duration: '50-70 min', distance: '15-20 km', popular: false }
];

const TIME_SLOTS = [
  '11h30 - 12h00',
  '12h00 - 12h30',
  '12h30 - 13h00', 
  '13h00 - 13h30',
  '17h00 - 17h30',
  '17h30 - 18h00',
  '18h00 - 18h30',
  '18h30 - 19h00'
];

const PAYMENT_METHODS = [
  {
    id: 'CINETPAY',
    name: 'CinetPay',
    description: 'Visa, Mastercard, Mobile Money',
    icon: '💳',
    processingFee: 0,
    type: 'online',
    instant: true
  },
  {
    id: 'ORANGE_MONEY', 
    name: 'Orange Money',
    description: 'Prélèvement direct + frais livraison',
    icon: '🥡',
    processingFee: 0,
    type: 'online',
    instant: true
  },
  {
    id: 'MTN_MONEY',
    name: 'MTN Mobile Money',
    description: 'Prélèvement direct + frais livraison',
    icon: '🔶',
    processingFee: 0,
    type: 'online',
    instant: true
  },
  {
    id: 'MOOV_MONEY',
    name: 'Moov Money',
    description: 'Prélèvement direct + frais livraison',
    icon: '🔵',
    processingFee: 0,
    type: 'online',
    instant: true
  },
  {
    id: 'WAVE',
    name: 'Wave',
    description: 'Prélèvement direct + frais livraison',
    icon: '💙',
    processingFee: 0,
    type: 'online',
    instant: true
  },
  {
    id: 'ESPECES',
    name: 'Espèces',
    description: 'Paiement à la livraison (exact SVP)',
    icon: '💵',
    processingFee: 0,
    type: 'cash',
    instant: false
  }
];

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  onConfirmOrder,
  isLoading = false 
}: CheckoutModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Informations client
    telephone: '',
    
    // Livraison
    typeCommande: 'CLICK_COLLECT' as 'CLICK_COLLECT' | 'LIVRAISON',
    adresseLivraison: '',
    zone: '',
    heureRetrait: '',
    
    // Notes
    notes: '',
    
    // Paiement
    modePaiement: 'CINETPAY'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = cartItems.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
  
  // Calcul dynamique des frais de livraison
  const selectedZone = DELIVERY_ZONES.find(zone => zone.name === formData.zone);
  const deliveryFee = formData.typeCommande === 'LIVRAISON' ? (selectedZone?.price || 0) : 0;
  const deliveryInfo = selectedZone ? {
    duration: selectedZone.duration,
    distance: selectedZone.distance,
    price: selectedZone.price
  } : null;
  
  const packagingFee = 300;
  const total = subtotal + deliveryFee + packagingFee;

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.telephone) {
        newErrors.telephone = 'Téléphone requis';
      } else if (!/^[0-9]{8,10}$/.test(formData.telephone.replace(/\s/g, ''))) {
        newErrors.telephone = 'Numéro de téléphone invalide';
      }
    }

    if (stepNumber === 2) {
      if (formData.typeCommande === 'LIVRAISON') {
        if (!formData.zone) {
          newErrors.zone = 'Veuillez sélectionner votre zone de livraison';
        }
        if (!formData.adresseLivraison) {
          newErrors.adresseLivraison = 'Adresse complète requise';
        }
      } else {
        if (!formData.heureRetrait) {
          newErrors.heureRetrait = 'Heure de retrait requise';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      const orderData: OrderData = {
        items: cartItems.map(item => ({
          produitId: item.id,
          quantite: item.quantite
        })),
        total,
        telephone: formData.telephone,
        typeCommande: formData.typeCommande,
        adresseLivraison: formData.typeCommande === 'LIVRAISON' ? formData.adresseLivraison : undefined,
        heureRetrait: formData.typeCommande === 'CLICK_COLLECT' ? formData.heureRetrait : undefined,
        notes: formData.notes || undefined,
        modePaiement: formData.modePaiement
      };
      
      onConfirmOrder(orderData);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      telephone: '',
      typeCommande: 'CLICK_COLLECT',
      adresseLivraison: '',
      zone: '',
      heureRetrait: '',
      notes: '',
      modePaiement: 'CINETPAY'
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div
              className="bg-white rounded-2xl w-full max-w-2xl min-h-[600px] max-h-none my-8 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#C8102E] to-[#A50E26] p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Finaliser la commande</h2>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Progress Steps */}
                <div className="flex items-center space-x-4 mt-6">
                  {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        stepNumber <= step 
                          ? 'bg-white text-[#C8102E]' 
                          : 'bg-white/30 text-white'
                      }`}>
                        {stepNumber < step ? <CheckIcon className="w-5 h-5" /> : stepNumber}
                      </div>
                      {stepNumber < 3 && (
                        <div className={`w-12 h-1 mx-2 rounded ${
                          stepNumber < step ? 'bg-white' : 'bg-white/30'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 min-h-0">
                {/* Step 1: Informations Client */}
                {step === 1 && (
                  <motion.div
                    className="p-8 bg-gray-50 min-h-[400px]"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <UserIcon className="w-6 h-6 text-[#C8102E]" />
                      <h3 className="text-xl font-bold text-gray-800">Informations de contact</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Numéro de téléphone *
                        </label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="tel"
                            value={formData.telephone}
                            onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                            placeholder="Ex: 07 XX XX XX XX"
                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] bg-white text-gray-800 font-medium placeholder-gray-400 ${
                              errors.telephone ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                            }`}
                          />
                        </div>
                        {errors.telephone && (
                          <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Livraison / Retrait */}
                {step === 2 && (
                  <motion.div
                    className="p-8 bg-gray-50 min-h-[400px]"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <TruckIcon className="w-6 h-6 text-[#C8102E]" />
                      <h3 className="text-xl font-bold text-gray-800">Mode de récupération</h3>
                    </div>

                    {/* Type de commande */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, typeCommande: 'CLICK_COLLECT' }))}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                          formData.typeCommande === 'CLICK_COLLECT'
                            ? 'border-[#C8102E] bg-red-50 shadow-lg text-gray-800'
                            : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ClockIcon className="w-8 h-8 mx-auto mb-3 text-[#C8102E]" />
                        <h4 className="font-bold text-lg text-gray-800">Retrait en magasin</h4>
                        <p className="text-sm font-semibold text-green-600 mt-2 bg-green-50 px-2 py-1 rounded-full">Gratuit • 15-30 min</p>
                      </button>

                      <button
                        onClick={() => setFormData(prev => ({ ...prev, typeCommande: 'LIVRAISON' }))}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                          formData.typeCommande === 'LIVRAISON'
                            ? 'border-[#C8102E] bg-red-50 shadow-lg text-gray-800'
                            : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <TruckIcon className="w-8 h-8 mx-auto mb-3 text-[#C8102E]" />
                        <h4 className="font-bold text-lg text-gray-800">Livraison à domicile</h4>
                        <p className="text-sm font-semibold text-[#C8102E] mt-2 bg-red-50 px-2 py-1 rounded-full">
                          {deliveryInfo ? `${deliveryInfo.price.toLocaleString()} FCFA • ${deliveryInfo.duration}` : 'Sélectionner une zone'}
                        </p>
                      </button>
                    </div>

                    {/* Formulaire conditionnel */}
                    {formData.typeCommande === 'LIVRAISON' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-lg font-black text-gray-900 mb-4 bg-white p-3 rounded-lg border-2 border-gray-300">
                            📍 CHOISISSEZ VOTRE ZONE DE LIVRAISON
                          </label>
                          
                          {/* Zones populaires */}
                          <div className="mb-4">
                            <h5 className="text-sm font-bold text-green-700 mb-2 flex items-center">
                              ⭐ ZONES POPULAIRES (Livraison rapide)
                            </h5>
                            <div className="grid gap-3">
                              {DELIVERY_ZONES.filter(zone => zone.popular).map(zone => (
                                <button
                                  key={zone.name}
                                  onClick={() => setFormData(prev => ({ ...prev, zone: zone.name }))}
                                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                                    formData.zone === zone.name
                                      ? 'border-[#C8102E] bg-red-50 shadow-lg'
                                      : 'border-green-300 bg-green-50 hover:border-green-500'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h6 className="font-bold text-gray-900">{zone.name}</h6>
                                      <p className="text-sm text-gray-600">{zone.distance} • {zone.duration}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-black text-lg text-[#C8102E]">{zone.price.toLocaleString()} FCFA</div>
                                      <div className="text-xs text-green-600 font-semibold">⚡ Rapide</div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Autres zones */}
                          <div>
                            <h5 className="text-sm font-bold text-gray-700 mb-2">
                              🏢 AUTRES ZONES DISPONIBLES
                            </h5>
                            <div className="grid gap-2 max-h-60 overflow-y-auto">
                              {DELIVERY_ZONES.filter(zone => !zone.popular).map(zone => (
                                <button
                                  key={zone.name}
                                  onClick={() => setFormData(prev => ({ ...prev, zone: zone.name }))}
                                  className={`p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                                    formData.zone === zone.name
                                      ? 'border-[#C8102E] bg-red-50 shadow-md'
                                      : 'border-gray-300 bg-white hover:border-gray-400'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h6 className="font-semibold text-gray-800">{zone.name}</h6>
                                      <p className="text-xs text-gray-500">{zone.distance} • {zone.duration}</p>
                                    </div>
                                    <div className="font-bold text-[#C8102E]">{zone.price.toLocaleString()} FCFA</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {errors.zone && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-red-600 text-sm font-semibold">⚠️ {errors.zone}</p>
                            </div>
                          )}
                          
                          {/* Informations sur la zone sélectionnée */}
                          {selectedZone && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h6 className="font-bold text-blue-900 mb-2">📝 RÉSUMÉ DE VOTRE LIVRAISON</h6>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-blue-700 font-semibold">Zone :</span>
                                  <div className="font-bold">{selectedZone.name}</div>
                                </div>
                                <div>
                                  <span className="text-blue-700 font-semibold">Prix :</span>
                                  <div className="font-bold text-[#C8102E]">{selectedZone.price.toLocaleString()} FCFA</div>
                                </div>
                                <div>
                                  <span className="text-blue-700 font-semibold">Durée :</span>
                                  <div className="font-bold">{selectedZone.duration}</div>
                                </div>
                                <div>
                                  <span className="text-blue-700 font-semibold">Distance :</span>
                                  <div className="font-bold">{selectedZone.distance}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Adresse complète *
                          </label>
                          <div className="relative">
                            <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <textarea
                              value={formData.adresseLivraison}
                              onChange={(e) => setFormData(prev => ({ ...prev, adresseLivraison: e.target.value }))}
                              placeholder="Ex: Cocody Riviera Golf, Immeuble X, Apt Y"
                              rows={3}
                              className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] bg-white text-gray-800 font-medium placeholder-gray-400 hover:border-gray-400 resize-none ${
                                errors.adresseLivraison ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                          </div>
                          {errors.adresseLivraison && (
                            <p className="text-red-500 text-sm mt-1">{errors.adresseLivraison}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Heure de retrait souhaitée *
                        </label>
                        <select
                          value={formData.heureRetrait}
                          onChange={(e) => setFormData(prev => ({ ...prev, heureRetrait: e.target.value }))}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] bg-white text-gray-800 font-medium ${
                            errors.heureRetrait ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <option value="" className="text-gray-500">Сélectionner un créneau</option>
                          {TIME_SLOTS.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        {errors.heureRetrait && (
                          <p className="text-red-500 text-sm mt-1">{errors.heureRetrait}</p>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Instructions spéciales (optionnel)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Précisions, allergies, demandes particulières..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] bg-white text-gray-800 font-medium placeholder-gray-400 hover:border-gray-400 resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Résumé et Paiement */}
                {step === 3 && (
                  <motion.div
                    className="p-8 bg-gray-50 min-h-[400px]"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <div className="flex items-center space-x-4 mb-8 bg-white p-4 rounded-xl shadow-md border-2 border-[#C8102E]">
                      <CreditCardIcon className="w-8 h-8 text-[#C8102E]" />
                      <h3 className="text-2xl font-black text-gray-900">RÉSUMÉ ET PAIEMENT</h3>
                    </div>

                    {/* Information transparente sur les frais */}
                    <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                        ℹ️ TARIFICATION TRANSPARENTE
                      </h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• <strong>Frais d&apos;emballage :</strong> 300 FCFA (inclus dans tous les prix)</p>
                        {formData.typeCommande === 'LIVRAISON' && selectedZone ? (
                          <p>• <strong>Frais de livraison :</strong> {selectedZone.price.toLocaleString()} FCFA pour {selectedZone.name}</p>
                        ) : (
                          <p>• <strong>Retrait gratuit</strong> en magasin (aucun frais de livraison)</p>
                        )}
                        <p>• <strong>Paiement en ligne :</strong> Montant total prélevé directement</p>
                        <p className="font-semibold text-blue-900">✅ Aucun frais caché - Prix final affiché ci-dessous</p>
                      </div>
                    </div>

                    {/* Résumé commande */}
                    <div className="bg-white rounded-xl p-6 mb-8 shadow-lg border-2 border-gray-300">
                      <h4 className="font-black text-xl text-gray-900 mb-6 bg-gray-100 p-3 rounded-lg border border-gray-300">RÉCAPITULATIF</h4>
                      <div className="space-y-4 text-base">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-semibold text-gray-800">Sous-total ({cartItems.length} articles)</span>
                          <span className="font-bold text-lg text-gray-900">{subtotal.toLocaleString()} FCFA</span>
                        </div>
                        {deliveryFee > 0 && (
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="font-semibold text-blue-800">Frais de livraison</span>
                            <span className="font-bold text-lg text-blue-900">{deliveryFee.toLocaleString()} FCFA</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <span className="font-semibold text-amber-800">Frais d&apos;emballage</span>
                          <span className="font-bold text-lg text-amber-900">{packagingFee.toLocaleString()} FCFA</span>
                        </div>
                        <hr className="my-4 border-2 border-gray-300" />
                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#C8102E] to-[#A50E26] text-white rounded-xl shadow-lg">
                          <span className="font-black text-xl">TOTAL</span>
                          <span className="font-black text-2xl">{total.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    </div>

                    {/* Mode de paiement */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-300">
                      <h4 className="font-black text-xl text-gray-900 mb-6 bg-gray-100 p-3 rounded-lg border border-gray-300">MODE DE PAIEMENT</h4>
                      <div className="space-y-4">
                        {PAYMENT_METHODS.map(method => (
                          <button
                            key={method.id}
                            onClick={() => setFormData(prev => ({ ...prev, modePaiement: method.id }))}
                            className={`w-full p-5 border-3 rounded-xl text-left transition-all duration-300 hover:scale-105 shadow-md ${
                              formData.modePaiement === method.id
                                ? 'border-[#C8102E] bg-red-50 shadow-lg border-4'
                                : 'border-gray-400 hover:border-gray-600 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <span className="text-3xl">{method.icon}</span>
                              <div>
                                <div className="font-bold text-lg text-gray-900">{method.name}</div>
                                <div className="text-base font-medium text-gray-700">{method.description}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="checkout-footer border-t-4 border-[#C8102E] bg-white shadow-lg p-8 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-[#C8102E] to-[#A50E26] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg border-2 border-white checkout-step-badge">
                    Étape {step} sur 3
                  </div>
                  <div className="text-sm text-gray-800 font-semibold bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">
                    {step === 1 ? 'Informations' : step === 2 ? 'Livraison' : 'Paiement'}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="checkout-footer-button px-6 py-3 border-2 border-gray-400 rounded-lg font-semibold text-base text-gray-700 bg-white hover:bg-gray-100 hover:border-gray-500 transition-all duration-200 flex items-center space-x-2 shadow-md"
                    >
                      <span className="text-lg">←</span>
                      <span>Précédent</span>
                    </button>
                  )}
                  
                  {step < 3 ? (
                    <button
                      onClick={handleNext}
                      className="checkout-footer-button px-8 py-3 bg-gradient-to-r from-[#C8102E] to-[#A50E26] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2 border-2 border-white shadow-md"
                    >
                      <span className="text-base">Suivant</span>
                      <span className="text-lg">→</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="checkout-footer-button px-8 py-3 bg-gradient-to-r from-[#C8102E] to-[#A50E26] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 border-2 border-white shadow-md"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-base">Traitement...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-base">Confirmer la commande</span>
                          <span className="bg-white text-[#C8102E] px-3 py-1 rounded-lg text-base font-bold shadow-md border border-[#C8102E]">
                            {total.toLocaleString()} FCFA
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}