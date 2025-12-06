'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur page article:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-restaurant-black text-restaurant-white">
      <Header />
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-restaurant-primary text-6xl mb-6">⚠️</div>
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Erreur de chargement
          </h1>
          <p className="text-restaurant-white/80 mb-6">
            Impossible de charger cet article. Veuillez réessayer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="bg-restaurant-primary hover:bg-restaurant-primary/80 text-restaurant-black font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Réessayer
            </button>
            <Link 
              href="/news"
              className="inline-block bg-transparent border border-restaurant-primary text-restaurant-primary hover:bg-restaurant-primary hover:text-restaurant-black font-semibold px-6 py-3 rounded-lg transition-colors duration-200 text-center"
            >
              Retour aux actualités
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}