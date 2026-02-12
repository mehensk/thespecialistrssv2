'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/ui/footer';

export function ConditionalFooter() {
  const pathname = usePathname();

  const hideFooter = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');

  if (hideFooter) {
    return null;
  }

  return <Footer />;
}
