import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-[84px]">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-[#111111] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[#111111] mb-4">
          Page Not Found
        </h2>
        <p className="text-[#111111]/70 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been removed, 
          renamed, or doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#111111] text-white px-6 py-3 rounded-lg hover:bg-[#111111]/80 transition-colors"
        >
          <Home size={20} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
