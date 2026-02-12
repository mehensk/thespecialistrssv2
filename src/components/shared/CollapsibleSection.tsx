'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isMobile: boolean;
  defaultOpenMobile?: boolean;
  className?: string;
}

export function CollapsibleSection({
  title,
  children,
  isMobile,
  defaultOpenMobile = false,
  className = '',
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpenMobile);

  if (!isMobile) {
    return (
      <section className={`space-y-6 ${className}`}>
        <h2 className="text-xl font-semibold text-[#111111] border-b border-[#E5E7EB] pb-2">
          {title}
        </h2>
        {children}
      </section>
    );
  }

  return (
    <section className={`border border-[#E5E7EB] rounded-lg ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-[#F9FAFB] rounded-t-lg"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[#111111]">{title}</span>
        {open ? (
          <ChevronUp size={18} className="text-[#111111]/70" />
        ) : (
          <ChevronDown size={18} className="text-[#111111]/70" />
        )}
      </button>
      {open && <div className="space-y-6 p-4 bg-white rounded-b-lg">{children}</div>}
    </section>
  );
}
