import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { GeistSans, GeistMono } from 'geist/font';
import { sora } from '@/app/lib/fonts';  // ✅ Correct path
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { SessionProvider } from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'The Specialist | Luxury Real Estate',
  description: 'Premium real estate services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${sora.variable} antialiased`}
      >
        <SessionProvider>
          {recaptchaSiteKey && (
            <Script
              src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
              strategy="afterInteractive"
            />
          )}
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}