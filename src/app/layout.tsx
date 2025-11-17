import type { Metadata } from 'next';
import './globals.css';
import { GeistSans, GeistMono } from 'geist/font';
import { sora } from '@/app/lib/fonts';  // ✅ Correct path
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

export const metadata: Metadata = {
  title: 'The Specialist | Luxury Real Estate',
  description: 'Premium real estate services',
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
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}