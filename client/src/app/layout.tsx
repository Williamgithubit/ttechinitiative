import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";

export const metadata: Metadata = {
  title: "T-Tech Initiative",
  description: "TTI Official Website",
};

// This is a Server Component by default
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Pass the font variables to the client component through environment variables
  process.env.NEXT_PUBLIC_GEIST_SANS = GeistSans.variable;
  process.env.NEXT_PUBLIC_GEIST_MONO = GeistMono.variable;

  return (
    <RootLayoutClient>
      {children}
    </RootLayoutClient>
  );
}
