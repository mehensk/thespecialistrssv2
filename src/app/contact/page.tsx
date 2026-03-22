import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import ContactPageClient from './contact-page-client';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    "Get in touch with The Specialist Realty Solutions for property inquiries, tours, and real estate support.",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
