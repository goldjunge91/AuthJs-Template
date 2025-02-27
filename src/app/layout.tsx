import React from 'react';
import type { Metadata } from 'next/types';
import './globals.css';
import { Provider } from '@/providers/provider';
import { cn } from '@/lib/utils';
import { Inter, Rubik } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Footer } from '@/components/layout/footer';
import CookieConsentComponent from '@/utils/cookies/CookieConsent';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik',
});

export const metadata: Metadata = {
  title: 'AuthJs Template',
  description: 'A starter authentication template for Next.js',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='de' suppressHydrationWarning>
      <body
        className={cn(
          // 'dark:background mx-auto h-screen',
          'dark:background mx-auto flex min-h-screen flex-col overflow-hidden',

          inter.variable,
          rubik.variable,
        )}
      >
        <Provider>
          <Navbar />
          {/* <main className='pt-16'> */}
          <main className='flex-grow pb-16 pt-16 sm:pb-20'>
            {/* <main> */}
            {children}
          </main>
          <Toaster />
          <CookieConsentComponent />
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
