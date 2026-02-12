'use client';

import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DashboardNavItem } from './nav-config';

type MobileDashboardNavProps = {
  primaryItems: DashboardNavItem[];
  secondaryItems: DashboardNavItem[];
  pathname: string;
  panelTitle: string;
  onLogout: () => void;
};

function isItemActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/dashboard' && href !== '/admin/dashboard' && pathname.startsWith(href));
}

export function MobileDashboardNav({
  primaryItems,
  secondaryItems,
  pathname,
  panelTitle,
  onLogout,
}: MobileDashboardNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [viewportBottomOffset, setViewportBottomOffset] = useState(0);

  const closeMore = useCallback(() => setMoreOpen(false), []);
  const toggleMore = useCallback(() => setMoreOpen((prev) => !prev), []);

  useEffect(() => {
    document.body.style.overflow = moreOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [moreOpen]);

  useEffect(() => {
    const updateViewportOffset = () => {
      const vv = window.visualViewport;
      if (!vv) {
        setViewportBottomOffset(0);
        return;
      }
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setViewportBottomOffset(offset);
    };

    updateViewportOffset();
    window.visualViewport?.addEventListener('resize', updateViewportOffset);
    window.visualViewport?.addEventListener('scroll', updateViewportOffset);
    window.addEventListener('resize', updateViewportOffset);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewportOffset);
      window.visualViewport?.removeEventListener('scroll', updateViewportOffset);
      window.removeEventListener('resize', updateViewportOffset);
    };
  }, []);

  const activePrimaryHref = useMemo(
    () => primaryItems.find((item) => isItemActive(pathname, item.href))?.href,
    [pathname, primaryItems]
  );

  return (
    <>
      <div className="lg:hidden fixed top-[84px] left-0 right-0 bg-[#1F2937] text-white px-4 py-4 z-40 border-b border-[#374151]">
        <h2 className="text-lg font-semibold">{panelTitle}</h2>
      </div>

      <nav
        className="lg:hidden fixed left-0 right-0 z-40 bg-[#111827] border-t border-[#374151] h-[70px] overflow-hidden"
        style={{ bottom: `${viewportBottomOffset}px` }}
      >
        <ul
          className="grid h-full"
          style={{ gridTemplateColumns: `repeat(${primaryItems.length + 1}, minmax(0, 1fr))` }}
        >
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePrimaryHref === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 h-full text-[11px] transition-colors ${
                    isActive ? 'text-white' : 'text-white/60'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-white/60'} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={toggleMore}
              className={`w-full h-full flex flex-col items-center justify-center gap-1 text-[11px] transition-colors ${
                moreOpen ? 'text-white' : 'text-white/60'
              }`}
              aria-label="Open more navigation options"
            >
              <MoreHorizontal size={18} className={moreOpen ? 'text-white' : 'text-white/60'} />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={closeMore} />
          <div
            className="absolute left-0 right-0 bg-white rounded-t-2xl border-t border-[#E5E7EB] shadow-2xl max-h-[72vh] overflow-y-auto"
            style={{ bottom: `${70 + viewportBottomOffset}px` }}
          >
            <div className="w-10 h-1 bg-[#CBD5E1] rounded-full mx-auto mt-3 mb-3" />
            <p className="px-4 pb-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              More Navigation
            </p>
            <div className="divide-y divide-[#EEF2F7]">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMore}
                    className={`flex items-center gap-3 px-4 py-4 text-sm ${
                      isActive ? 'text-[#111827] font-semibold bg-[#F8FAFC]' : 'text-[#111827]'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  closeMore();
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-4 text-sm text-red-700"
              >
                <span className="inline-block w-[18px] text-center">-&gt;</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
