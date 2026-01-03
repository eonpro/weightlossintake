import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from '@/components/ClientProviders';

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
    <html lang="en" className="bg-[#d2c7bb]">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/gdk8cbv.css" />
        <meta name="theme-color" content="#d2c7bb" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="font-sofia antialiased bg-gradient-to-r from-[#d2c7bb] to-[#e9e1d7]">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}