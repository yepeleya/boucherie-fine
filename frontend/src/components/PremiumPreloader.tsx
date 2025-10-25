"use client";

import { motion } from "framer-motion";

export default function PremiumPreloader() {
  return (
    <div className="preloader">
      <div className="preloader-content">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="text-6xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            <span className="text-restaurant-white">La </span>
            <span className="text-restaurant-primary">Boucherie</span>
            <span className="text-restaurant-white">-Fine</span>
          </div>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
            className="h-1 bg-gradient-to-r from-restaurant-primary to-red-500 rounded-full mx-auto max-w-xs"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-restaurant-white/70 text-sm tracking-wider uppercase"
        >
          Excellence culinaire en préparation...
        </motion.div>
        
        {/* Animated dots */}
        <motion.div 
          className="flex justify-center mt-6 space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-restaurant-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}