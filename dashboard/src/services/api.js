// src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// Configuration de base pour l'API
const API_BASE_URL = 'http://localhost:3000/api';

// Instance Axios avec configuration par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
});

// Interceptor pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expirée. Veuillez vous reconnecter.');
    } else if (error.response?.status === 403) {
      toast.error('Accès interdit. Vous n\'avez pas les permissions nécessaires.');
    } else if (error.response?.status >= 500) {
      toast.error('Erreur serveur. Veuillez réessayer plus tard.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Délai d\'attente dépassé. Vérifiez votre connexion.');
    }
    return Promise.reject(error);
  }
);

// Services pour l'authentification
export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Connexion réussie !');
      }
      return response.data;
    } catch (error) {
      toast.error('Erreur de connexion. Vérifiez vos identifiants.');
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Déconnexion réussie');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Services pour les utilisateurs
export const usersService = {
  getAll: () => api.get('/utilisateurs'),
  getById: (id) => api.get(`/utilisateurs/${id}`),
  create: (data) => api.post('/utilisateurs', data),
  update: (id, data) => api.put(`/utilisateurs/${id}`, data),
  delete: (id) => api.delete(`/utilisateurs/${id}`),
  toggleStatus: (id) => api.patch(`/utilisateurs/${id}/toggle-status`),
  getStats: () => api.get('/utilisateurs/stats'),
};

// Services pour les produits
export const productsService = {
  getAll: () => api.get('/produits'),
  getById: (id) => api.get(`/produits/${id}`),
  create: (data) => api.post('/produits', data),
  update: (id, data) => api.put(`/produits/${id}`, data),
  delete: (id) => api.delete(`/produits/${id}`),
  getByCategory: (category) => api.get(`/produits/category/${category}`),
  updateStock: (id, stock) => api.patch(`/produits/${id}/stock`, { stock }),
  getStats: () => api.get('/produits/stats'),
};

// Services pour les commandes
export const ordersService = {
  getAll: () => api.get('/commandes'),
  getById: (id) => api.get(`/commandes/${id}`),
  updateStatus: (id, status) => api.patch(`/commandes/${id}/status`, { status }),
  getStats: () => api.get('/commandes/stats'),
  getByDateRange: (startDate, endDate) => api.get(`/commandes/date-range?start=${startDate}&end=${endDate}`),
  getRecentOrders: (limit = 10) => api.get(`/commandes/recent?limit=${limit}`),
};

// Services pour les réservations
export const reservationsService = {
  getAll: () => api.get('/reservations'),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  delete: (id) => api.delete(`/reservations/${id}`),
  updateStatus: (id, status) => api.patch(`/reservations/${id}/status`, { status }),
  getByDate: (date) => api.get(`/reservations/date/${date}`),
  getStats: () => api.get('/reservations/stats'),
};

// Services pour les paiements
export const paymentsService = {
  getAll: () => api.get('/paiements'),
  getById: (id) => api.get(`/paiements/${id}`),
  getStats: () => api.get('/paiements/stats'),
  getByDateRange: (startDate, endDate) => api.get(`/paiements/date-range?start=${startDate}&end=${endDate}`),
  processRefund: (id, amount) => api.post(`/paiements/${id}/refund`, { amount }),
};

// Services pour les actualités
export const newsService = {
  getAll: () => api.get('/actualites'),
  getById: (id) => api.get(`/actualites/${id}`),
  create: (data) => api.post('/actualites', data),
  update: (id, data) => api.put(`/actualites/${id}`, data),
  delete: (id) => api.delete(`/actualites/${id}`),
  publish: (id) => api.patch(`/actualites/${id}/publish`),
  unpublish: (id) => api.patch(`/actualites/${id}/unpublish`),
  getPublished: () => api.get('/actualites/published'),
};

// Services pour le dashboard (statistiques générales)
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getChartData: (period = '30d') => api.get(`/dashboard/charts?period=${period}`),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getTopProducts: () => api.get('/dashboard/top-products'),
  getRevenue: (period = '30d') => api.get(`/dashboard/revenue?period=${period}`),
};

// Service pour l'upload de fichiers
export const uploadService = {
  uploadImage: async (file, type = 'general') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteImage: (imagePath) => api.delete(`/upload/image?path=${imagePath}`),
};

export default api;