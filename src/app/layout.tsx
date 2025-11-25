import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { GeistSans, GeistMono } from 'geist/font';
import { sora } from '@/app/lib/fonts';  // ✅ Correct path
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { LogoutSync } from '@/components/providers/LogoutSync';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'The Specialist | Luxury Real Estate',
  description: 'Premium real estate services',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://thespecialistrealty.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'The Specialist Realty',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${sora.variable} antialiased`}
      >
        <SessionProvider>
          <LogoutSync />
          <ToastProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}