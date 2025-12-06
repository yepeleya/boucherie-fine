'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import SocialIcons from './SocialIcons';

export default function Footer() {

  const quickLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'Nos Menus', href: '/menus' },
    { name: 'Actualités', href: '/actualites' },
    { name: 'Réservations', href: '/reservations' },
    { name: 'Commander', href: '/commandes' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <footer className="bg-gradient-to-br from-restaurant-black via-gray-900 to-restaurant-black text-white">
      {/* Section principale */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          
          {/* Logo et description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Image
                src="/logo_blanc.png"
                alt="La Boucherie Fine"
                width={60}
                height={60}
                className="drop-shadow-lg"
              />
              <div>
                <h3 className="text-2xl font-bold tracking-wide">LA BOUCHERIE</h3>
                <h3 className="text-2xl font-bold tracking-wide text-restaurant-primary">FINE</h3>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Découvrez l&apos;excellence de la cuisine africaine moderne dans un cadre élégant et chaleureux. 
              Une expérience gastronomique unique à Abidjan.
            </p>
            
            {/* Réseaux sociaux */}
            <SocialIcons variant="restaurant" size="md" className="justify-start" />
          </motion.div>

          {/* Liens rapides */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-xl font-bold mb-6 text-restaurant-primary">Liens Rapides</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-restaurant-primary transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-amber-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-xl font-bold mb-6 text-restaurant-primary">Nous Contacter</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-restaurant-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Riviera 3</p>
                  <p className="text-gray-400 text-sm">Abidjan, Côte d&apos;Ivoire</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-restaurant-primary flex-shrink-0" />
                <a href="tel:0544544735" className="text-gray-300 hover:text-restaurant-primary transition-colors">
                  0544 54 47 35
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-restaurant-primary flex-shrink-0" />
                <a href="mailto:contact@boucheriefine.ci" className="text-gray-300 hover:text-restaurant-primary transition-colors">
                  contact@boucheriefine.ci
                </a>
              </div>
            </div>
          </motion.div>

          {/* Horaires */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-xl font-bold mb-6 text-restaurant-primary">Horaires d&apos;Ouverture</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-restaurant-primary flex-shrink-0" />
                <div>
                  <p className="text-gray-300 font-medium">Lun - Jeu</p>
                  <p className="text-restaurant-primary font-bold">11h00 - 00h00</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-restaurant-primary flex-shrink-0" />
                <div>
                  <p className="text-gray-300 font-medium">Ven - Dim</p>
                  <p className="text-restaurant-primary font-bold">10h00 - 02h00</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-restaurant-primary to-red-600 p-4 rounded-lg mt-6">
                <p className="text-white font-semibold mb-2">Livraison disponible</p>
                <p className="text-red-100 text-sm">7j/7 selon nos horaires</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ligne de séparation */}
      <div className="border-t border-gray-700"></div>

      {/* Copyright */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 La Boucherie Fine. Tous droits réservés.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/mentions-legales" className="text-gray-400 hover:text-restaurant-primary transition-colors">
              Mentions légales
            </Link>
            <Link href="/politique-confidentialite" className="text-gray-400 hover:text-restaurant-primary transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="/cgu" className="text-gray-400 hover:text-restaurant-primary transition-colors">
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
