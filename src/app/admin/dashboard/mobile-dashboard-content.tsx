import Link from 'next/link';
import { CheckCircle2, ClipboardCheck, Edit3, Plus, ShieldCheck } from 'lucide-react';

function MobileTaskCard({
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
      className="block bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-4 active:scale-[0.99] transition-transform"
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

export default function MobileDashboardContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-[#111111]">Admin Dashboard</h1>
      <p className="text-[#111111]/70 text-sm">
        Mobile-first workspace focused on your 3 core tasks.
      </p>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#111111]/70">Top Tasks</h2>
        <MobileTaskCard
          title="Create Listing"
          description="Start a new property listing."
          href="/dashboard/listings/new"
          icon={Plus}
          cta="Open Create"
        />
        <MobileTaskCard
          title="Edit Listing"
          description="Update existing listings quickly."
          href="/admin/listings"
          icon={Edit3}
          cta="Open Listings"
        />
        <MobileTaskCard
          title="Approve Listings"
          description="Review and approve pending listings."
          href="/admin/listings"
          icon={ShieldCheck}
          cta="Open Approval Queue"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#111111]/70 mb-3">Queue Shortcuts</h2>
        <div className="space-y-2">
          <Link
            href="/admin/listings"
            prefetch={true}
            className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] px-3 py-3 text-sm"
          >
            <span className="inline-flex items-center gap-2 text-[#111111]">
              <ClipboardCheck size={16} className="text-[#1F2937]" />
              Pending listing approvals
            </span>
            <span className="text-[#1F2937]">Open</span>
          </Link>
          <Link
            href="/admin/listings"
            prefetch={true}
            className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] px-3 py-3 text-sm"
          >
            <span className="inline-flex items-center gap-2 text-[#111111]">
              <CheckCircle2 size={16} className="text-[#1F2937]" />
              Listings needing edits
            </span>
            <span className="text-[#1F2937]">Open</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
