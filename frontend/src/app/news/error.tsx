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
    console.error('Erreur page news:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-restaurant-black text-restaurant-white">
      <Header />
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-restaurant-primary text-6xl mb-6">⚠️</div>
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Une erreur est survenue
          </h1>
          <p className="text-restaurant-white/80 mb-6">
            Nous nous excusons pour la gêne occasionnée. Une erreur s&apos;est produite lors du chargement des actualités.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="bg-restaurant-primary hover:bg-restaurant-primary/80 text-restaurant-black font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Réessayer
            </button>
            <Link 
              href="/"
              className="inline-block bg-transparent border border-restaurant-primary text-restaurant-primary hover:bg-restaurant-primary hover:text-restaurant-black font-semibold px-6 py-3 rounded-lg transition-colors duration-200 text-center"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}