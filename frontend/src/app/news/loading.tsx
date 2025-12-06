import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Loading() {
  return (
    <div className="min-h-screen bg-restaurant-black text-restaurant-white">
      <Header />
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-restaurant-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
            Chargement des actualités...
          </h2>
          <p className="text-restaurant-white/60">
            Veuillez patienter pendant que nous récupérons les dernières nouvelles.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}