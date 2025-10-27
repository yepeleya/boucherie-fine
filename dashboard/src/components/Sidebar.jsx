// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme.jsx';
import { 
  HomeIcon, 
  CubeIcon, 
  ClipboardDocumentListIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  NewspaperIcon, 
  UsersIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { 
    to: '/', 
    label: 'Accueil', 
    icon: HomeIcon,
    description: 'Vue d\'ensemble'
  },
  { 
    to: '/utilisateurs', 
    label: 'Utilisateurs', 
    icon: UsersIcon,
    description: 'Gestion des comptes'
  },
  { 
    to: '/produits', 
    label: 'Produits', 
    icon: CubeIcon,
    description: 'Catalogue & menu'
  },
  { 
    to: '/commandes', 
    label: 'Commandes', 
    icon: ClipboardDocumentListIcon,
    description: 'Suivi des ventes'
  },
  { 
    to: '/reservations', 
    label: 'Réservations', 
    icon: CalendarIcon,
    description: 'Planning des tables'
  },
  { 
    to: '/paiements', 
    label: 'Paiements', 
    icon: CurrencyDollarIcon,
    description: 'Transactions'
  },
  { 
    to: '/actualites', 
    label: 'Actualités', 
    icon: NewspaperIcon,
    description: 'Blog & annonces'
  },
];

const settingsNav = [
  { 
    to: '/settings', 
    label: 'Paramètres', 
    icon: Cog6ToothIcon,
    description: 'Configuration'
  },
];

export default function Sidebar() {
  const { isDark } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  };

  const linkVariants = {
    hover: { x: 4, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  };

  const NavItem = ({ item, isActive }) => (
    <motion.div
      variants={linkVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <NavLink
        to={item.to}
        end={item.to === '/'}
        className={({ isActive }) =>
          `group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-brand-red text-white shadow-lg shadow-brand-red/25'
              : isDark
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-brand-black'
          }`
        }
      >
        <item.icon className="h-6 w-6 flex-shrink-0" />
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="ml-3 flex-1"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.label}</span>
                {!isActive && (
                  <span className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicateur actif */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </NavLink>
    </motion.div>
  );

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`relative min-h-screen border-r ${
        isDark 
          ? 'bg-brand-gray-dark border-gray-700' 
          : 'bg-white border-gray-200'
      }`}
    >
      {/* Header avec logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">LBF</span>
            </div>
          </motion.div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-3"
              >
                <h2 className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-brand-black'
                }`}>
                  Boucherie Fine
                </h2>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Dashboard Admin
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="p-4 space-y-2">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-2"
            >
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Navigation
              </h3>
            </motion.div>
          )}
        </AnimatePresence>

        {navigation.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            isActive={location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))}
          />
        ))}

        {/* Séparateur */}
        <div className={`my-4 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`} />

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-2"
            >
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Configuration
              </h3>
            </motion.div>
          )}
        </AnimatePresence>

        {settingsNav.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            isActive={location.pathname === item.to}
          />
        ))}
      </nav>

      {/* Bouton de réduction/expansion */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute -right-3 top-20 w-6 h-6 rounded-full border-2 ${
          isDark 
            ? 'bg-brand-gray-dark border-gray-600 text-gray-300' 
            : 'bg-white border-gray-300 text-gray-600'
        } flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-3 h-3" />
        ) : (
          <ChevronLeftIcon className="w-3 h-3" />
        )}
      </motion.button>

      {/* Footer info */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="text-center">
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                © 2025 La Boucherie Fine
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Version 1.0.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}