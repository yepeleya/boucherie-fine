// Configuration de l'API backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

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
    return apiCall('/reservations', {
      method: 'POST',
      body: JSON.stringify({
        dateReservation: reservationData.date,
        heureReservation: reservationData.time,
        nombrePersonnes: parseInt(reservationData.guests),
        telephone: reservationData.phone,
        commentaires: reservationData.message || ''
      })
    });
  },

  // Vérifier les disponibilités pour une date
  async checkAvailability(date) {
    return apiCall(`/reservations/availability/${date}`);
  },

  // Récupérer les réservations d'un utilisateur (si connecté)
  async getUserReservations(token) {
    return apiCall('/reservations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// Service pour l'authentification
export const authService = {
  // Inscription
  async register(userData) {
    return apiCall('/utilisateurs/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Connexion
  async login(credentials) {
    return apiCall('/utilisateurs/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  // Récupérer les infos utilisateur
  async getProfile(token) {
    return apiCall('/utilisateurs/me', {
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

// Service pour les actualités
const actualitesService = {
  // Récupérer toutes les actualités avec pagination et filtres
  async getAll(params = {}) {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page);
      if (params.limit) searchParams.append('limit', params.limit);
      if (params.categorie) searchParams.append('categorie', params.categorie);
      if (params.search) searchParams.append('search', params.search);

      const queryString = searchParams.toString();
      const endpoint = `/actualites${queryString ? `?${queryString}` : ''}`;

      const response = await apiCall(endpoint);
      
      // Adapter la réponse au format attendu par le frontend
      return {
        success: true,
        data: response.actualites || [],
        totalPages: response.pagination?.totalPages || 1,
        currentPage: response.pagination?.currentPage || 1,
        total: response.pagination?.total || 0
      };
    } catch (error) {
      console.error('Error in actualitesService.getAll:', error);
      throw error;
    }
  },

  // Récupérer une actualité par son slug
  async getBySlug(slug) {
    const response = await apiCall(`/actualites/slug/${slug}`);
    // Adapter la réponse au format attendu par le frontend
    return {
      success: true,
      data: response.actualite
    };
  },

  // Récupérer toutes les catégories
  async getCategories() {
    try {
      const response = await apiCall('/actualites/categories/list');
      
      // Adapter la réponse au format attendu par le frontend
      return {
        success: true,
        data: response.categories?.map(cat => cat.nom) || []
      };
    } catch (error) {
      console.error('Error in actualitesService.getCategories:', error);
      // Retourner des catégories par défaut en cas d'erreur
      return {
        success: true,
        data: ['Promotions', 'Événements', 'Nouveautés', 'Services']
      };
    }
  },

  // Services Admin (nécessitent authentification)
  admin: {
    // Récupérer toutes les actualités pour l'admin
    async getAll(params = {}) {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page);
      if (params.limit) searchParams.append('limit', params.limit);
      if (params.categorie) searchParams.append('categorie', params.categorie);
      if (params.search) searchParams.append('search', params.search);
      if (params.actif !== undefined) searchParams.append('actif', params.actif);

      const queryString = searchParams.toString();
      const endpoint = `/actualites/admin/all${queryString ? `?${queryString}` : ''}`;

      return apiCall(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    },

    // Créer une nouvelle actualité
    async create(data) {
      return apiCall('/actualites/admin/create', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    },

    // Mettre à jour une actualité
    async update(id, data) {
      return apiCall(`/actualites/admin/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    },

    // Supprimer une actualité
    async delete(id) {
      return apiCall(`/actualites/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    }
  }
};

const apiServices = {
  reservationService,
  authService,
  productService,
  newsService,
  actualitesService
};

export default apiServices;