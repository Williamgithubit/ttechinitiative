'use client';

import dynamic from 'next/dynamic';

// Dynamically import ClientLayout with no SSR
const ClientLayout = dynamic(
  () => import('./client-layout').then(mod => mod.ClientLayout),
  { ssr: false }
);

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${process.env.NEXT_PUBLIC_GEIST_SANS} ${process.env.NEXT_PUBLIC_GEIST_MONO} antialiased`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
