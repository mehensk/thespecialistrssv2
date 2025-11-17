import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

// Auth is already handled by middleware, so we don't need to check here
// This eliminates a blocking server call on every navigation
export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

