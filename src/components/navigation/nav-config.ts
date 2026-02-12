import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  FileText,
  Home,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const dashboardDesktopNav: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/listings', label: 'My Listings', icon: Home },
  { href: '/dashboard/blogs', label: 'My Blogs', icon: FileText },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export const dashboardMobilePrimaryNav: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/listings', label: 'Listings', icon: Home },
  { href: '/dashboard/blogs', label: 'Blogs', icon: FileText },
];

export const dashboardMobileSecondaryNav: DashboardNavItem[] = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export type AdminNavItem = DashboardNavItem & {
  section?: 'personal';
};

export const adminDesktopNav: AdminNavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/listings', label: 'All Listings', icon: Home },
  { href: '/admin/blogs', label: 'All Blogs', icon: FileText },
  { href: '/admin/logs', label: 'Activity Logs', icon: Activity },
  { href: '/dashboard/listings', label: 'My Listings', icon: Home, section: 'personal' },
  { href: '/dashboard/blogs', label: 'My Blogs', icon: FileText, section: 'personal' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, section: 'personal' },
];

export const adminMobilePrimaryNav: DashboardNavItem[] = [
  { href: '/admin/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/admin/listings', label: 'Listings', icon: Home },
  { href: '/admin/blogs', label: 'Blogs', icon: FileText },
  { href: '/admin/logs', label: 'Activity', icon: Activity },
];

export const adminMobileSecondaryNav: DashboardNavItem[] = [
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/listings', label: 'My Listings', icon: Home },
  { href: '/dashboard/blogs', label: 'My Blogs', icon: FileText },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];
