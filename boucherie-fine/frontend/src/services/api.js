// Configuration de l'API backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

// Fonction pour récupérer le token depuis les cookies
function getAuthToken() {
  if (typeof document !== 'undefined') {
    // Côté client : récupérer depuis les cookies
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    return authCookie ? authCookie.split('=')[1] : null;
  }
  return null;
}

// Fonction utilitaire pour faire des appels API
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Service pour les réservations
export const reservationService = {
  // Créer une nouvelle réservation
  async create(reservationData) {
    const token = getAuthToken();
    return apiCall('/reservations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        dateReservation: reservationData.date,
        heureReservation: reservationData.time,
        nombrePersonnes: parseInt(reservationData.guests),
        telephone: reservationData.phone,
        commentaires: reservationData.message || ''
      })
    });
  },

  // Récupérer les réservations de l'utilisateur connecté
  async getUserReservations() {
    const token = getAuthToken();
    return apiCall('/reservations/mes-reservations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Modifier une réservation (seulement si EN_ATTENTE)
  async update(reservationId, updateData) {
    const token = getAuthToken();
    return apiCall(`/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
  },

  // Annuler une réservation
  async cancel(reservationId) {
    const token = getAuthToken();
    return apiCall(`/reservations/${reservationId}/annuler`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Vérifier les disponibilités pour une date
  async checkAvailability(date) {
    return apiCall(`/reservations/availability/${date}`);
  }
};

// Service pour l'authentification
export const authService = {
  // Inscription
  async register(userData) {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Connexion
  async login(credentials) {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  // Récupérer les infos utilisateur
  async getProfile(token) {
    return apiCall('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// Service pour les produits
export const productService = {
  // Récupérer tous les produits
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    return apiCall(`/produits?${params}`);
  },

  // Récupérer un produit par ID
  async getById(id) {
    return apiCall(`/produits/${id}`);
  },

  // Récupérer les catégories
  async getCategories() {
    return apiCall('/produits/categories/all');
  }
};

// Service pour les actualités
export const newsService = {
  // Récupérer les actualités récentes pour l'accueil
  async getRecent(limit = 5) {
    return apiCall(`/actualites/public/recentes?limit=${limit}`);
  },

  // Récupérer toutes les actualités publiques
  async getPublic(filters = {}) {
    const params = new URLSearchParams({
      publiquesOnly: 'true',
      ...filters
    });
    return apiCall(`/actualites?${params}`);
  },

  // Récupérer une actualité par ID
  async getById(id) {
    return apiCall(`/actualites/${id}`);
  }
};

const apiServices = {
  reservationService,
  authService,
  productService,
  newsService
};

export default apiServices;