import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Loading() {
  return (
    <div className="min-h-screen bg-restaurant-black text-restaurant-white">
      <Header />
      <main className="min-h-screen">
        {/* Hero Section Skeleton */}
        <div className="relative h-[60vh] bg-restaurant-black/50 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-restaurant-black/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16">
            <div className="max-w-4xl mx-auto">
              <div className="h-8 bg-restaurant-white/20 rounded mb-4 w-1/3"></div>
              <div className="h-12 bg-restaurant-white/20 rounded mb-6 w-2/3"></div>
              <div className="h-6 bg-restaurant-white/20 rounded w-1/4"></div>
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="space-y-4">
              <div className="h-4 bg-restaurant-white/10 rounded w-full"></div>
              <div className="h-4 bg-restaurant-white/10 rounded w-5/6"></div>
              <div className="h-4 bg-restaurant-white/10 rounded w-4/6"></div>
              <div className="h-4 bg-restaurant-white/10 rounded w-full"></div>
              <div className="h-4 bg-restaurant-white/10 rounded w-3/4"></div>
            </div>
            
            <div className="text-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-restaurant-primary mx-auto"></div>
              <p className="text-restaurant-white/60 mt-4">Chargement de l&apos;article...</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}