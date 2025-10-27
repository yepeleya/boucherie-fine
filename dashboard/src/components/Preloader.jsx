// src/components/Preloader.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme.jsx';

export default function Preloader({ size = 'large', text = 'Chargement...', fullScreen = true }) {
  const { isDark } = useTheme();
  
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const LoaderContent = () => (
    <div className="flex flex-col items-center space-y-6">
      {/* Logo animé */}
      <motion.div 
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`${sizeClasses[size]} relative`}>
          {/* Logo de La Boucherie Fine */}
          <div className="absolute inset-0 bg-brand-red rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">LBF</span>
          </div>
          
          {/* Cercle de chargement animé */}
          <motion.div
            className="absolute inset-0 border-4 border-transparent border-t-brand-red rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Cercle extérieur avec pulse */}
          <motion.div
            className="absolute -inset-2 border-2 border-brand-red/20 rounded-full"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Texte de chargement */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center"
      >
        <p className={`font-medium ${isDark ? 'text-white' : 'text-brand-black'}`}>
          {text}
        </p>
        <div className="flex justify-center space-x-1 mt-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-brand-red rounded-full"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Nom du restaurant */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-center"
      >
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-brand-black'}`}>
          La Boucherie Fine
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Dashboard Administration
        </p>
      </motion.div>
    </div>
  );

  if (!fullScreen) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoaderContent />
      </div>
    );
  }

  return (
    <motion.div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDark ? 'bg-brand-gray-dark' : 'bg-white'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Fond avec motif subtil */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-1/2 -left-1/2 w-full h-full opacity-5 ${
          isDark ? 'bg-white' : 'bg-brand-black'
        } transform rotate-12`} />
      </div>
      
      <div className="relative z-10">
        <LoaderContent />
      </div>
    </motion.div>
  );
}

// Composant Loader inline pour les boutons et petites sections
export function InlineLoader({ size = 'small', className = '' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div 
        className={`${sizeClasses[size]} border-2 border-gray-200 border-t-brand-red rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// Composant pour les états de chargement des cartes
export function CardLoader({ lines = 3 }) {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="grid grid-cols-3 gap-4">
            <div className="h-4 bg-gray-200 rounded col-span-2"></div>
            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
          </div>
        ))}
      </div>
    </div>
  );
}