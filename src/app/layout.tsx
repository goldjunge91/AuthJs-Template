import React from 'react';
import type { Metadata } from 'next/types';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '@/components/ThemeToggle';
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
          'dark:background mx-auto h-screen',
          inter.variable,
          rubik.variable,
        )}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          <main>{children}</main>
          <Toaster />
          <ThemeToggle />
          <CookieConsentComponent />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
