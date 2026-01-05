import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from '@/components/ClientProviders';
import MetaPixel from '@/components/MetaPixel';

export const metadata: Metadata = {
  title: "EONMeds - Medical Intake",
  description: "Secure medical intake form for telehealth consultations",
  icons: {
    icon: "https://static.wixstatic.com/media/c49a9b_f1c55bbf207b4082bdef7d23fd95f39e~mv2.png",
    shortcut: "https://static.wixstatic.com/media/c49a9b_f1c55bbf207b4082bdef7d23fd95f39e~mv2.png",
    apple: "https://static.wixstatic.com/media/c49a9b_f1c55bbf207b4082bdef7d23fd95f39e~mv2.png",
  },
  openGraph: {
    title: "EONMeds - Medical Intake",
    description: "Secure medical intake form for telehealth consultations",
    images: [
      {
        url: "https://static.wixstatic.com/media/c49a9b_81e73b843c9a45a0880abe0b345de391~mv2.jpg",
        width: 1200,
        height: 630,
        alt: "EONMeds Weight Loss Program",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EONMeds - Medical Intake",
    description: "Secure medical intake form for telehealth consultations",
    images: ["https://static.wixstatic.com/media/c49a9b_81e73b843c9a45a0880abe0b345de391~mv2.jpg"],
  },
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