import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollAnimation } from '@/components/ui/scroll-animation';

export const metadata: Metadata = {
  title: 'Investor Relations | The Specialist Realty',
  description:
    'Strategic real estate partnerships for private, corporate, and institutional investors focused on performance, transparency, and long-term growth.',
};

const benefitItems = [
  {
    title: 'Proven Returns',
    description: 'High-demand urban and emerging markets selected for strong long-term potential.',
  },
  {
    title: 'Portfolio Diversification',
    description: 'Residential, commercial, and mixed-use assets for balanced investment exposure.',
  },
  {
    title: 'Data-Driven Strategy',
    description: 'Market intelligence and analysis guide acquisition and timing decisions.',
  },
  {
    title: 'Dedicated Relations Team',
    description: 'Personalized service, communication, and reporting for each investor profile.',
  },
  {
    title: 'Ethical Growth',
    description: 'Responsible development principles aligned with sustainable long-term value.',
  },
];

const investmentOpportunities = [
  'Pre-Construction Projects in high-yield zones',
  'Income-Producing Rentals with optimized tenancy solutions',
  'Luxury Property Redevelopments in premium locations',
  'Equity Partnerships and Joint Venture Projects',
];

const specialistExperience = [
  'Tailored investment planning and guidance',
  'Regular portfolio performance reports',
  'Private previews of upcoming listings',
  'Legal and financial coordination support',
  'Direct access to our executive relations team',
];

export default function InvestorRelationsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden border-b border-[#dde2e7] pt-[clamp(6.5rem,18vw,8.5rem)] pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1920&q=80"
            alt="City skyline at dusk representing investor growth opportunities"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d0f12]/92 via-[#0d0f12]/88 to-[#1e2a36]/85" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
          <p className="mb-3 font-space-mono text-xs uppercase tracking-[0.2em] text-[#4d7bb0] md:text-sm">
            Investor Relations
          </p>
          <h1 className="mb-4 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
            Strategic Partnerships. Lasting Returns.
          </h1>
          <p className="max-w-4xl text-base leading-relaxed text-white/90 md:text-lg">
            At The Specialist Realty Solutions and Services, we believe that real estate is not just
            about properties, it is about possibilities. Our curated investment offerings are
            designed for discerning investors who value performance, transparency, and long-term
            growth.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <ScrollAnimation>
            <p className="mb-9 max-w-5xl text-base leading-relaxed text-[#1e2a36] md:mb-12 md:text-lg">
              Whether you&apos;re a private investor, corporate partner, or institutional buyer, our
              team offers a seamless, end-to-end experience rooted in market intelligence and elite
              property strategy.
            </p>

            <div className="mb-7 grid grid-cols-1 gap-4 md:mb-8 md:grid-cols-2">
              <div className="group relative h-56 overflow-hidden rounded-xl border border-[#dde2e7] shadow-lg md:h-64">
                <Image
                  src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80"
                  alt="Urban skyline and commercial district"
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12]/50 to-[#0d0f12]/5" />
                <span className="absolute bottom-3 left-3 text-xs font-semibold uppercase tracking-[0.1em] text-white">
                  Urban Growth Markets
                </span>
              </div>

              <div className="group relative h-56 overflow-hidden rounded-xl border border-[#dde2e7] shadow-lg md:h-64">
                <Image
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80"
                  alt="Financial planning desk with reports and charts"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12]/50 to-[#0d0f12]/5" />
                <span className="absolute bottom-3 left-3 text-xs font-semibold uppercase tracking-[0.1em] text-white">
                  Data-Led Investment Strategy
                </span>
              </div>
            </div>

            <div className="mb-7 rounded-xl border border-[#dde2e7] bg-white p-6 shadow-md md:mb-8 md:p-8">
              <h2 className="mb-3 text-2xl font-semibold text-[#0d0f12] md:text-3xl">
                Why Invest With Us
              </h2>
              <p className="text-[#1e2a36]">
                Built for serious investors focused on resilient growth, transparency, and portfolio
                performance.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {benefitItems.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border-l-4 border-[#D4AF37] bg-[#f0f2f4] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <h3 className="mb-3 text-lg font-semibold text-[#0d0f12]">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-[#1e2a36]">{item.description}</p>
                </article>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <section className="border-y border-[#dde2e7] bg-[#f0f2f4] py-16 md:py-24">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 md:px-6 lg:grid-cols-2">
          <ScrollAnimation className="h-full">
            <article className="flex h-full flex-col rounded-xl border border-[#dde2e7] bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8">
              <div className="-mx-6 -mt-6 mb-6 h-44 overflow-hidden rounded-t-xl border-b border-[#dde2e7] md:-mx-8 md:-mt-8 md:h-52">
                <Image
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80"
                  alt="Modern real estate development project"
                  width={1400}
                  height={900}
                  className="h-full w-full object-cover"
                />
              </div>

              <h2 className="mb-4 text-2xl font-semibold text-[#0d0f12] md:text-3xl">
                Investment Opportunities
              </h2>
              <p className="mb-4 text-[#1e2a36]">We offer exclusive access to:</p>
              <ul className="mb-4 space-y-3">
                {investmentOpportunities.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border-l-4 border-[#D4AF37] bg-[#f0f2f4] px-3 py-2 text-sm text-[#1e2a36]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-relaxed text-[#1e2a36] md:text-base">
                Each opportunity is rigorously vetted by our acquisitions and legal teams to ensure
                integrity, security, and strategic alignment with your financial goals.
              </p>
            </article>
          </ScrollAnimation>

          <ScrollAnimation delay={100} className="h-full">
            <article className="flex h-full flex-col rounded-xl border border-[#dde2e7] bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8">
              <div className="-mx-6 -mt-6 mb-6 h-44 overflow-hidden rounded-t-xl border-b border-[#dde2e7] md:-mx-8 md:-mt-8 md:h-52">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80"
                  alt="Executive team discussing an investment portfolio"
                  width={1400}
                  height={900}
                  className="h-full w-full object-cover"
                />
              </div>

              <h2 className="mb-4 text-2xl font-semibold text-[#0d0f12] md:text-3xl">
                The Specialist Experience
              </h2>
              <ul className="space-y-4">
                {specialistExperience.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border-l-4 border-[#D4AF37] bg-[#f0f2f4] px-4 py-3 text-sm leading-relaxed text-[#1e2a36]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </ScrollAnimation>
        </div>
      </section>

      <section className="bg-[#0d0f12] py-16 text-white md:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <ScrollAnimation>
            <p className="mb-3 font-space-mono text-xs uppercase tracking-[0.2em] text-[#D4AF37] md:text-sm">
              Ready to Invest With Confidence?
            </p>
            <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
              We Invite You to Explore Partnership With Us
            </h2>
            <p className="mb-6 max-w-3xl text-base leading-relaxed text-white/85 md:text-lg">
              Choose your next step and connect with our investor relations team for opportunities,
              planning support, and private consultation.
            </p>

            <Link
              href="/contact"
              className="inline-block rounded-md bg-white px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-[#0d0f12] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg"
            >
              Schedule a Private Consultation
            </Link>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
}
