import type { Metadata } from 'next';
import './globals.css';
import { GeistSans, GeistMono } from 'geist/font';
import { Navbar } from '@/components/ui/navbar';
import { ConditionalFooter } from '@/components/ui/conditional-footer';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { LogoutSync } from '@/components/providers/LogoutSync';
import { ToastProvider } from '@/components/ui/toast';

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  'http://localhost:3000'
).replace(/\/$/, '');

export const metadata: Metadata = {
  title: {
    default: 'The Specialist Realty Solutions',
    template: '%s | The Specialist Realty Solutions',
  },
  description:
    'Buy, sell, or invest with confidence. The Specialist Realty Solutions delivers expert real estate support and high-value listings.',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: '/',
    siteName: 'The Specialist Realty Solutions',
    title: 'The Specialist Realty Solutions',
    description:
      'Buy, sell, or invest with confidence. The Specialist Realty Solutions delivers expert real estate support and high-value listings.',
    images: [
      {
        url: '/home-og.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'The Specialist Realty Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Specialist Realty Solutions',
    description:
      'Buy, sell, or invest with confidence. The Specialist Realty Solutions delivers expert real estate support and high-value listings.',
    images: ['/home-og.png'],
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
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <SessionProvider>
            <LogoutSync />
            <ToastProvider>
              <Navbar />
              <main>{children}</main>
              <ConditionalFooter />
            </ToastProvider>
          </SessionProvider>
      </body>
    </html>
  );
}
