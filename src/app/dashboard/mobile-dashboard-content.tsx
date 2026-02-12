import Link from 'next/link';
import { ClipboardList, Edit3, FileText, Plus, ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/get-user-from-token';

async function getMobileStats(userId: string) {
  const [listingCount, blogCount, pendingListingCount, pendingBlogCount] = await Promise.all([
    prisma.listing.count({ where: { userId } }),
    prisma.blogPost.count({ where: { userId } }),
    prisma.listing.count({ where: { userId, isPublished: false } }),
    prisma.blogPost.count({ where: { userId, isPublished: false } }),
  ]);

  return {
    listingCount,
    blogCount,
    pendingTotal: pendingListingCount + pendingBlogCount,
  };
}

function TaskCard({
  title,
  description,
  href,
  icon: Icon,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  cta: string;
}) {
  return (
    <Link
      href={href}
      prefetch={true}
      className="block bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#111111]">{title}</h2>
          <p className="text-sm text-[#111111]/70 mt-1">{description}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
          <Icon size={20} className="text-[#1F2937]" />
        </div>
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1F2937]">
        <span>{cta}</span>
        <span aria-hidden="true">-&gt;</span>
      </div>
    </Link>
  );
}

export default async function MobileDashboardContent() {
  const user = await getUserFromToken();

  if (!user?.id) {
    redirect('/');
  }

  if (user.role === UserRole.ADMIN) {
    redirect('/admin/dashboard');
  }

  const stats = await getMobileStats(user.id);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-[#111111]">My Dashboard</h1>
      <p className="text-[#111111]/70 text-sm">Mobile-first workspace for listings and blogs.</p>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#111111]/70">Top Tasks</h2>
        <TaskCard
          title="Create Listing"
          description="Start a new property listing."
          href="/dashboard/listings/new"
          icon={Plus}
          cta="Open Create"
        />
        <TaskCard
          title="Edit Listing"
          description="Update your existing listings."
          href="/dashboard/listings"
          icon={Edit3}
          cta="Open Listings"
        />
        <TaskCard
          title="Manage Blogs"
          description="Write or update your blog posts."
          href="/dashboard/blogs"
          icon={FileText}
          cta="Open Blogs"
        />
      </section>

      <section className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#111111]/70 mb-3">Quick Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-3">
            <span className="inline-flex items-center gap-2 text-[#111111]">
              <ClipboardList size={16} className="text-[#1F2937]" />
              Total Listings
            </span>
            <strong>{stats.listingCount}</strong>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-3">
            <span className="inline-flex items-center gap-2 text-[#111111]">
              <FileText size={16} className="text-[#1F2937]" />
              Total Blogs
            </span>
            <strong>{stats.blogCount}</strong>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-3">
            <span className="inline-flex items-center gap-2 text-[#111111]">
              <ShieldCheck size={16} className="text-[#1F2937]" />
              Pending Approval
            </span>
            <strong>{stats.pendingTotal}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
