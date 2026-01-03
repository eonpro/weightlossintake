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
    <html lang="en" className="bg-white">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/gdk8cbv.css" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="font-sofia antialiased bg-white">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}