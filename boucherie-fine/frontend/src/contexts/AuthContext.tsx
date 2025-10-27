'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

// Types pour l'utilisateur
interface User {
  id: number;
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role: 'ADMIN' | 'CLIENT';
  dateCreation: string;
  dateModification: string;
}

// Types pour l'authentification
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, motDePasse: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; message: string }>;
}

interface RegisterData {
  nom: string;
  prenom?: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  adresse?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    utilisateur: User;
    token: string;
  };
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Provider d'authentification
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // URL de base de l'API
  const API_BASE_URL = '/api/auth';

  // Charger l'utilisateur depuis les cookies au démarrage
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedToken = Cookies.get('auth_token');
        const storedUser = Cookies.get('auth_user');

        if (storedToken && storedUser) {
          // Vérifier que le token est encore valide
          const response = await fetch(`${API_BASE_URL}/verify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data: AuthResponse = await response.json();
            if (data.success && data.data) {
              setToken(storedToken);
              setUser(JSON.parse(storedUser));
            } else {
              // Token invalide, nettoyer les cookies
              Cookies.remove('auth_token');
              Cookies.remove('auth_user');
            }
          } else {
            // Token invalide ou expiré
            Cookies.remove('auth_token');
            Cookies.remove('auth_user');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        Cookies.remove('auth_token');
        Cookies.remove('auth_user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Fonction de connexion
  const login = async (email: string, motDePasse: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, motDePasse }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        // Sauvegarder dans les cookies avec sécurité
        Cookies.set('auth_token', data.data.token, { 
          expires: 7, // 7 jours
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax'
        });
        Cookies.set('auth_user', JSON.stringify(data.data.utilisateur), { 
          expires: 7, // 7 jours
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax'
        });

        // Mettre à jour l'état
        setToken(data.data.token);
        setUser(data.data.utilisateur);

        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { success: false, message: 'Erreur de connexion. Vérifiez votre connexion internet.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        // Sauvegarder dans les cookies avec sécurité
        Cookies.set('auth_token', data.data.token, { 
          expires: 7, // 7 jours
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax'
        });
        Cookies.set('auth_user', JSON.stringify(data.data.utilisateur), { 
          expires: 7, // 7 jours
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax'
        });

        // Mettre à jour l'état
        setToken(data.data.token);
        setUser(data.data.utilisateur);

        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return { success: false, message: 'Erreur d\'inscription. Vérifiez votre connexion internet.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    // Supprimer des cookies
    Cookies.remove('auth_token');
    Cookies.remove('auth_user');

    // Réinitialiser l'état
    setToken(null);
    setUser(null);

    // Optionnel : appeler l'endpoint de déconnexion du backend
    if (token) {
      fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).catch(error => console.error('Erreur lors de la déconnexion:', error));
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; message: string }> => {
    try {
      if (!token) {
        return { success: false, message: 'Vous devez être connecté pour modifier votre profil' };
      }

      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        // Mettre à jour l'utilisateur dans l'état et les cookies
        const updatedUser = data.data.utilisateur;
        setUser(updatedUser);
        Cookies.set('auth_user', JSON.stringify(updatedUser), { 
          expires: 7, // 7 jours
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax'
        });

        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { success: false, message: 'Erreur lors de la mise à jour. Vérifiez votre connexion internet.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer si l'utilisateur est authentifié
  const isAuthenticated = !!token && !!user;

  // Valeur du contexte
  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};