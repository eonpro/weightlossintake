import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from '@/components/ClientProviders';
import MetaPixel from '@/components/MetaPixel';

export const metadata: Metadata = {
  title: "EONMeds - Medical Intake",
  description: "Secure medical intake form for telehealth consultations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/gdk8cbv.css" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* Preload critical landing page images */}
        <link
          rel="preload"
          href="https://static.wixstatic.com/media/c49a9b_3505f05c6c774d748c2e20f178e7c917~mv2.png"
          as="image"
        />
        <link
          rel="preload"
          href="https://static.wixstatic.com/media/c49a9b_db8b1c89bbf14aeaa7c55037b3fd6aec~mv2.webp"
          as="image"
        />
      </head>
      <body className="font-sofia antialiased bg-white">
        <MetaPixel />
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}