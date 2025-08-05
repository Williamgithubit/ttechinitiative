import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";

export const metadata: Metadata = {
  title: "T-Tech Initiative",
  description: "Empowering Liberian youth through digital education and technology training.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  themeColor: '#000054',
  viewport: 'width=device-width, initial-scale=1',
  keywords: ['T-Tech Initiative', 'Liberia', 'Digital Education', 'Tech Training', 'Youth Empowerment'],
  authors: [{ name: 'T-Tech Initiative' }],
  openGraph: {
    title: 'T-Tech Initiative',
    description: 'Empowering Liberian youth through digital education and technology training.',
    url: 'https://ttechinitiative.org',
    siteName: 'T-Tech Initiative',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'T-Tech Initiative',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'T-Tech Initiative',
    description: 'Empowering Liberian youth through digital education and technology training.',
    creator: '@ttechinitiative',
    images: ['/og-image.jpg'],
  },
};

// This is a Server Component by default
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
