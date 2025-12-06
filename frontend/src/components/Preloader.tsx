'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setTimeout(() => setIsVisible(false), 500);
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible || !isClient) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-restaurant-black via-restaurant-primary to-restaurant-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        {/* Logo animé */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <Image
            src="/logo_blanc.png"
            alt="La Boucherie Fine"
            width={120}
            height={120}
            priority
            className="mx-auto drop-shadow-2xl"
          />
        </motion.div>

        {/* Titre élégant */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-wider"
        >
          LA BOUCHERIE FINE
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-restaurant-light text-lg mb-8 font-light"
        >
          L&apos;Excellence de la Cuisine Africaine
        </motion.p>

        {/* Barre de progression élégante */}
        <div className="w-80 mx-auto">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-restaurant-primary to-restaurant-light rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white/80 text-sm mt-4"
          >
            Chargement... {progress}%
          </motion.p>
        </div>

        {/* Particules flottantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { left: '20%', top: '30%' },
            { left: '80%', top: '20%' },
            { left: '10%', top: '70%' },
            { left: '90%', top: '60%' },
            { left: '50%', top: '10%' },
            { left: '60%', top: '80%' }
          ].map((position, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-restaurant-primary/30 rounded-full"
              animate={{
                y: [0, -100, 0],
                x: [0, 30 - i * 10, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
              style={{
                left: position.left,
                top: position.top,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}