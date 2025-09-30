import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import "./globals.css";
import ClientProviders from '@/components/ClientProviders';

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

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
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}