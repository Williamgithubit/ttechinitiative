'use client';

import { usePathname } from 'next/navigation';
import { Providers } from "@/providers/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";

// This component is used to wrap the application with client-side only components
export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  
  if (isDashboard) {
    return <Providers>{children}</Providers>;
  }
  
  return (
    <Providers>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </Providers>
  );
}
