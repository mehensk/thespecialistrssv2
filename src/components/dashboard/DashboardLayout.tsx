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
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState, useMemo, useCallback, memo } from 'react';

// Memoize nav items to prevent recreation on every render
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/listings', label: 'My Listings', icon: Home },
  { href: '/dashboard/blogs', label: 'My Blogs', icon: FileText },
  { href: '/dashboard/activity', label: 'Activity Log', icon: Activity },
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
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/login');
  }, [router]);

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
          <div className="p-4 border-t border-[#374151]">
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
          <div className="p-6 lg:pl-4 lg:pr-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
});

