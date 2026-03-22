import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import ListingsPageClient from './listings-page-client';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Listings',
  description: 'Browse available properties from The Specialist Realty Solutions.',
  alternates: {
    canonical: `${siteUrl}/listings`,
  },
};

export default function ListingsPage() {
  return <ListingsPageClient />;
}
