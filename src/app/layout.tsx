import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import SiteHeader from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CartProvider } from '@/contexts/cart-context';
import { AppProvider } from '@/contexts/app-context';
import ClientOnlyChatWidget from '@/components/client-only-chat-widget';
import { AuthProvider } from '@/contexts/auth-context';

export const metadata: Metadata = {
  title: 'NutriWise AI',
  description: 'AI-powered supplement advisor for your fitness goals.',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background flex flex-col">
        <AppProvider>
          <AuthProvider>
            <CartProvider>
              <SiteHeader />
              <main className="flex-grow pt-16 lg:pt-20">{children}</main>
              <SiteFooter />
              <Toaster />
              <ClientOnlyChatWidget />
            </CartProvider>
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
