import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ThemeProvider } from './hooks/useTheme.jsx';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
// Import des autres pages (à créer)
// import Users from './pages/Users';
// import Products from './pages/Products';
// import Orders from './pages/Orders';
// import Reservations from './pages/Reservations';
// import Payments from './pages/Payments';
// import News from './pages/News';
// import Settings from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Route de connexion */}
            <Route path="/login" element={<Login />} />
            
            {/* Routes protégées du dashboard */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              } 
            >
              <Route index element={<Home />} />
              {/* <Route path="utilisateurs" element={<Users />} />
              <Route path="produits" element={<Products />} />
              <Route path="commandes" element={<Orders />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="paiements" element={<Payments />} />
              <Route path="actualites" element={<News />} />
              <Route path="settings" element={<Settings />} /> */}
            </Route>
            
            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}