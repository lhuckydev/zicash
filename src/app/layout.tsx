import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { MobileNav } from "@/components/layout/MobileNav";
import { UserDataSync } from "@/components/auth/UserDataSync";
import { ProfilePrompt } from "@/components/auth/ProfilePrompt";

export const metadata: Metadata = {
  title: 'ZiCash GH Limited | Premium Online Marketplace',
  description: 'Your premium destination for curated products, lifestyle essentials, and professional services.',
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
