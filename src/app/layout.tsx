import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { MobileNav } from "@/components/layout/MobileNav";
import { UserDataSync } from "@/components/auth/UserDataSync";
import { ProfilePrompt } from "@/components/auth/ProfilePrompt";

export const metadata: Metadata = {
  title: {
    default: 'ZiCash GH Limited | Premium Online Marketplace',
    template: '%s | ZiCash GH Limited'
  },
  description: 'Your premium destination for curated products, lifestyle essentials, and professional services in Ghana. All You Need, All For You.',
  keywords: ['marketplace', 'Ghana', 'electronics', 'laptops', 'phones', 'lifestyle', 'ZiCash'],
  metadataBase: new URL('https://zicashgh.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ZiCash GH Limited | Premium Online Marketplace',
    description: 'Curated products and professional services delivered across Ghana.',
    url: 'https://zicashgh.com',
    siteName: 'ZiCash GH Limited',
    images: [
      {
        url: 'https://i.ibb.co/v4p0sdxs/zicash.jpg',
        width: 1200,
        height: 630,
        alt: 'ZiCash GH Limited Marketplace',
      },
    ],
    locale: 'en_GH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZiCash GH Limited',
    description: 'Premium hardware and lifestyle marketplace in Ghana.',
    images: ['https://i.ibb.co/v4p0sdxs/zicash.jpg'],
  }
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-slate-900 min-h-screen">
        <UserDataSync />
        <ProfilePrompt />
        {children}
        <Toaster />
        <div className="no-print">
          <MobileNav />
        </div>
      </body>
    </html>
  );
}