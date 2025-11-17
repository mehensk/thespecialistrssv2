import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-white pt-[84px] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-semibold text-[#111111] mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-[#111111] mb-4">Access Forbidden</h2>
        <p className="text-[#111111]/70 mb-8">
          You don't have permission to access this page. This area is restricted to administrators only.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="bg-white border-2 border-[#1F2937] text-[#1F2937] px-6 py-3 rounded-md hover:bg-[#1F2937] hover:text-white transition-all duration-300 font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

