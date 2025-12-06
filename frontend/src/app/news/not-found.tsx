import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-restaurant-black text-restaurant-white">
      <Header />
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-restaurant-primary text-6xl mb-6">📰</div>
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Actualité introuvable
          </h1>
          <p className="text-restaurant-white/80 mb-6">
            L'actualité que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Link 
            href="/news"
            className="inline-block bg-restaurant-primary hover:bg-restaurant-primary/80 text-restaurant-black font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Retour aux actualités
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}