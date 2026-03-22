import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import HowWeWorkPageClient from './how-we-work-page-client';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'How We Work',
  description:
    'Explore the client-focused buying and selling process used by The Specialist Realty Solutions.',
  alternates: {
    canonical: `${siteUrl}/how-we-work`,
  },
};

export default function HowWeWorkPage() {
  return <HowWeWorkPageClient />;
}
