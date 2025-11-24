'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Home, 
  FileText, 
  Activity,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { ActivityTracker } from '@/components/activity-tracker';
import { broadcastLogout } from '@/components/providers/LogoutSync';

// Memoize nav items to prevent recreation on every render
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/listings', label: 'My Listings', icon: Home },
  { href: '/dashboard/blogs', label: 'My Blogs', icon: FileText },
  { href: '/dashboard/activity', label: 'Activity Log', icon: Activity },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const;

// Memoize navigation item component to prevent unnecessary re-renders
const NavItem = memo(({ item, isActive, onMobileClick }: { 
  item: typeof navItems[number]; 
  isActive: boolean;
  onMobileClick?: () => void;
}) => {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onMobileClick}
      prefetch={true}
      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
        isActive
          ? 'bg-[#111111] text-white'
          : 'text-white/70 hover:bg-[#374151] hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span>{item.label}</span>
    </Link>
  );
});

NavItem.displayName = 'NavItem';

export const DashboardLayout = memo(function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Client-side check: If session becomes null (server restart, logout, etc.), redirect to home
  // IMPORTANT: Only redirect if status is 'unauthenticated', not during 'loading' state
  // This prevents false redirects when session is still loading
  useEffect(() => {
    // Only redirect if we're sure the user is unauthenticated (not just loading)
    if (status === 'unauthenticated') {
      // User is definitely logged out - redirect to home
      window.location.href = '/';
    }
    // Don't redirect if status is 'loading' - session might still be loading
  }, [status]);

  const handleLogout = useCallback(async () => {
    try {
      // Broadcast logout to all tabs
      broadcastLogout();
      
      // Sign out without redirect first to ensure cookies are cleared
      await signOut({ 
        redirect: false, // Don't redirect automatically - we'll do it manually
        callbackUrl: '/'
      });
      
      // Manually clear all auth cookies to ensure they're removed
      // NextAuth v5 uses authjs.session-token
      document.cookie = 'authjs.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = '__Secure-authjs.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure';
      // Also clear old cookie names for backward compatibility
      document.cookie = 'next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = '__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure';
      
      // Force redirect to home page - this ensures middleware checks the session
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear cookies and force redirect even if signOut fails
      document.cookie = 'authjs.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = '__Secure-authjs.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure';
      document.cookie = 'next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = '__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure';
      window.location.replace('/');
    }
  }, []);

  // Memoize active state calculation
  const activeStates = useMemo(() => {
    return navItems.map(item => ({
      item,
      isActive: pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
    }));
  }, [pathname]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  return (
    <div className="min-h-screen bg-white pt-[84px]">
      <ActivityTracker />
      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 bg-[#1F2937] text-white flex-col min-h-[calc(100vh-84px)]">
          <div className="p-6 border-b border-[#374151]">
            <h2 className="text-xl font-semibold">My Dashboard</h2>
            {session?.user && (
              <p className="text-sm text-white/70 mt-1">{session.user.email}</p>
            )}
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {activeStates.map(({ item, isActive }) => (
              <NavItem key={item.href} item={item} isActive={isActive} />
            ))}
          </nav>
          <div className="p-4 border-t border-[#374151] space-y-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-md text-white/70 hover:bg-[#374151] hover:text-white transition-colors w-full"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden fixed top-[84px] left-0 right-0 bg-[#1F2937] text-white p-4 z-40 border-b border-[#374151]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Dashboard</h2>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-[#374151] rounded-md"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 pt-[140px]">
            <div className="bg-[#1F2937] text-white w-64 h-full overflow-y-auto">
              <nav className="p-4 space-y-2">
                {activeStates.map(({ item, isActive }) => (
                  <NavItem 
                    key={item.href} 
                    item={item} 
                    isActive={isActive}
                    onMobileClick={closeSidebar}
                  />
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    closeSidebar();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-white/70 hover:bg-[#374151] hover:text-white transition-colors w-full"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
            <div
              className="flex-1 bg-black/50"
              onClick={closeSidebar}
            />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
});

