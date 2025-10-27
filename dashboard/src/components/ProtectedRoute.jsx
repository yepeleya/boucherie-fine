// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Preloader from './Preloader';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Preloader text="Vérification de l'authentification..." />;
  }

  if (!isAuthenticated) {
    // Rediriger vers login avec l'URL de retour
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}