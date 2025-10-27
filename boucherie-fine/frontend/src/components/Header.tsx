'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, PhoneIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen && !(event.target as Element).closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const menuItems = [
    { name: 'Accueil', href: '/' },
    { name: 'Menus', href: '/menus' },
    { name: 'Réservations', href: '/reservations' },
    { name: 'Commandes', href: '/commandes' },
    { name: 'Actualités', href: '/news' },
    { name: 'À propos', href: '/a-propos' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Barre d'informations supérieure */}
      <div className="bg-restaurant-black text-white py-2 text-sm hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <PhoneIcon className="h-4 w-4" />
              <span>0544 54 47 35</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-4 w-4" />
              <span>Riviera 3, Abidjan</span>
            </div>
          </div>
          <div className="text-right">
            <span>Ouvert : Lun-Jeu 11h-00h | Ven-Dim 10h-02h</span>
          </div>
        </div>
      </div>

      {/* Header principal */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 site-header ${
          isScrolled ? 'scrolled' : ''
        }`}
        style={{ marginTop: isScrolled ? '0' : '40px' }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src={isScrolled ? "/logo-white.png" : "/logo-white.png"}
                alt="La Boucherie Fine"
                width={54}
                height={54}
                className="transition-all duration-300"
              />
              <div className="hidden md:block">
                <h1 className={`text-xl font-bold tracking-wide ${
                  isScrolled ? 'text-restaurant-white' : 'text-restaurant-white'
                }`}>
                  LA BOUCHERIE FINE
                </h1>
                <p className={`text-sm ${
                  isScrolled ? 'text-restaurant-primary' : 'text-red-200'
                }`}>
                  Excellence Culinaire
                </p>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <div className="hidden lg:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="nav-link"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Bouton Réservation et Authentification */}
            <div className="hidden md:flex items-center space-x-4">
              {!isAuthenticated ? (
                // Non connecté : Boutons de connexion/inscription
                <>
                  <Link
                    href="/auth/login"
                    className="text-white hover:text-restaurant-primary transition-colors px-4 py-2 border border-white/30 rounded-full hover:border-restaurant-primary"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-restaurant-primary hover:bg-restaurant-primary-dark text-white px-4 py-2 rounded-full font-semibold transition-all duration-300"
                  >
                    S&apos;inscrire
                  </Link>
                </>
              ) : (
                // Connecté : Menu utilisateur et bouton réservation
                <>
                  <Link
                    href="/reservations"
                    className="btn-primary"
                  >
                    Réserver une table
                  </Link>
                  
                  {/* Menu utilisateur */}
                  <div className="relative user-menu">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 text-white hover:text-restaurant-primary transition-colors p-2 rounded-full border border-white/30 hover:border-restaurant-primary"
                    >
                      <UserIcon className="h-5 w-5" />
                      <span className="hidden lg:block">{user?.nom}</span>
                    </button>
                    
                    {/* Dropdown menu utilisateur */}
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-50"
                      >
                        <div className="p-4 border-b">
                          <p className="font-semibold text-gray-800">{user?.nom} {user?.prenom}</p>
                          <p className="text-sm text-gray-600">{user?.email}</p>
                          {user?.role === 'ADMIN' && (
                            <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                              Administrateur
                            </span>
                          )}
                        </div>
                        <div className="py-2">
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Mon profil
                          </Link>
                          <Link
                            href="/mes-commandes"
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Mes commandes
                          </Link>
                          <Link
                            href="/mes-reservations"
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Mes réservations
                          </Link>
                          {user?.role === 'ADMIN' && (
                            <Link
                              href="/admin"
                              className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              Administration
                            </Link>
                          )}
                          <hr className="my-2" />
                          <button
                            onClick={() => {
                              logout();
                              setIsUserMenuOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Se déconnecter
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Menu Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-md transition-colors ${
                isScrolled ? 'text-gray-800' : 'text-white'
              }`}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Menu Mobile Dropdown */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white shadow-xl border-t"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col space-y-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-800 hover:text-restaurant-primary font-medium py-2 border-b border-gray-100 last:border-0 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Section Authentification Mobile */}
                {!isAuthenticated ? (
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <Link
                      href="/auth/login"
                      className="block text-center border border-gray-300 text-gray-800 hover:text-restaurant-primary py-3 rounded-full font-semibold transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block text-center bg-restaurant-primary hover:bg-restaurant-primary-dark text-white py-3 rounded-full font-semibold transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      S&apos;inscrire
                    </Link>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    {/* Info utilisateur mobile */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-semibold text-gray-800">{user?.nom} {user?.prenom}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                      {user?.role === 'ADMIN' && (
                        <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                          Administrateur
                        </span>
                      )}
                    </div>
                    
                    {/* Liens utilisateur mobile */}
                    <Link
                      href="/profile"
                      className="block text-gray-800 hover:text-restaurant-primary py-2 border-b border-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mon profil
                    </Link>
                    <Link
                      href="/mes-commandes"
                      className="block text-gray-800 hover:text-restaurant-primary py-2 border-b border-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mes commandes
                    </Link>
                    <Link
                      href="/mes-reservations"
                      className="block text-gray-800 hover:text-restaurant-primary py-2 border-b border-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mes réservations
                    </Link>
                    
                    {user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block text-gray-800 hover:text-restaurant-primary py-2 border-b border-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Administration
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left text-red-600 hover:text-red-700 py-2 font-semibold transition-colors"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
                
                {/* Bouton réservation en bas */}
                <Link
                  href="/reservations"
                  className="bg-restaurant-primary hover:bg-restaurant-primary-dark text-white px-6 py-3 rounded-full font-semibold text-center transition-all duration-300 mt-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Réserver une table
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.header>
    </>
  );
}