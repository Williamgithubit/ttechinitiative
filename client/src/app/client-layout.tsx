'use client';

import { usePathname } from 'next/navigation';
import { Providers } from "@/providers/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import SplashScreen from "@/components/ui/SplashScreen";
import { useSplashScreen } from "@/hooks/useSplashScreen";

// This component is used to wrap the application with client-side only components
export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  
  // Disable splash screen for dashboard routes and specific pages
  const shouldShowSplash = !isDashboard && 
    pathname !== '/login' && 
    pathname !== '/unauthorized';
  
  const { isLoading, showSplash, handleLoadingComplete } = useSplashScreen({
    enabled: shouldShowSplash,
    minDisplayTime: 2000
  });
  
  if (isDashboard) {
    return <Providers>{children}</Providers>;
  }
  
  return (
    <Providers>
      {showSplash && (
        <SplashScreen 
          onLoadingComplete={handleLoadingComplete}
          minDisplayTime={2000}
        />
      )}
      
      <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </Providers>
  );
}
