'use client';

import { useSession } from 'next-auth/react';

export function UserBanner() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#1F2937] text-white px-4 py-2 text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-start">
        <span className="font-medium">Welcome, {session.user.name || session.user.email}</span>
      </div>
    </div>
  );
}

