'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                src={isScrolled ? "/logo_blanc.png" : "/logo_blanc.png"}
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

            {/* Bouton Réservation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/reservations"
                className="btn-primary"
              >
                Réserver une table
              </Link>
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