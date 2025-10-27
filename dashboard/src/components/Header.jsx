// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { 
  BellIcon, 
  UserCircleIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notifications = [
    { id: 1, type: 'order', message: 'Nouvelle commande reçue', time: '5 min', unread: true },
    { id: 2, type: 'payment', message: 'Paiement confirmé', time: '15 min', unread: true },
    { id: 3, type: 'reservation', message: 'Nouvelle réservation', time: '1h', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className={`sticky top-0 z-30 border-b ${
      isDark 
        ? 'bg-brand-gray-dark border-gray-700' 
        : 'bg-white border-gray-200'
    } backdrop-blur-lg bg-opacity-95`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Section gauche - Titre et info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-6"
          >
            <div>
              <h1 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-brand-black'
              }`}>
                Dashboard
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  La Boucherie Fine - Administration
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {currentTime.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Section droite - Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            {/* Barre de recherche */}
            <div className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-400'
                }`} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`block w-80 pl-10 pr-3 py-2 border rounded-lg leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-brand-black'
                }`}
                placeholder="Rechercher..."
              />
            </div>

            {/* Bouton thème */}
            <motion.button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-brand-black hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDark ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg transition-colors duration-200 ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-brand-black hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-brand-red text-xs text-white items-center justify-center"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 ${
                      isDark ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <div className="p-4">
                      <h3 className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-brand-black'
                      }`}>
                        Notifications ({unreadCount} non lues)
                      </h3>
                      <div className="mt-3 space-y-2">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-lg ${
                              notif.unread 
                                ? (isDark ? 'bg-gray-700' : 'bg-blue-50')
                                : (isDark ? 'bg-gray-750' : 'bg-gray-50')
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <p className={`text-sm ${
                                isDark ? 'text-gray-200' : 'text-gray-800'
                              }`}>
                                {notif.message}
                              </p>
                              <span className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {notif.time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Menu profil */}
            <div className="relative">
              <motion.button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${
                  isDark 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.nom?.charAt(0) || 'A'}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block text-left">
                  <p className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-brand-black'
                  }`}>
                    {user?.nom || 'Administrateur'}
                  </p>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {user?.email || 'admin@boucheriefine.com'}
                  </p>
                </div>
                <ChevronDownIcon className={`w-4 h-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 ${
                      isDark ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <div className="py-1">
                      <motion.button
                        onClick={() => {
                          navigate('/settings');
                          setShowProfileMenu(false);
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 ${
                          isDark 
                            ? 'text-gray-200 hover:bg-gray-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-3" />
                        Paramètres
                      </motion.button>
                      <hr className={`my-1 ${
                        isDark ? 'border-gray-700' : 'border-gray-200'
                      }`} />
                      <motion.button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                        whileHover={{ x: 4 }}
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        Déconnexion
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}