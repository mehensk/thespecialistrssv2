export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.URL ||
    process.env.NEXTAUTH_URL;

  if (configured && configured.trim().length > 0) {
    return configured.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  return 'https://www.thespecialistofficial.com';
}

