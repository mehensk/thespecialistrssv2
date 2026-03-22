import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollAnimation } from '@/components/ui/scroll-animation';
import { getSiteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Developer Selling',
  description:
    'Buyer-focused guidance to accredited developer projects, with trusted support from consultation through project matching.',
  alternates: {
    canonical: `${getSiteUrl()}/developer-selling`,
  },
};

const developers: Array<{
  name: string;
  logo: string;
  alt: string;
  darkTile?: boolean;
  zoomClass?: string;
}> = [
  {
    name: 'Rockwell Land Corporation',
    logo: '/images/developers/rockwell-primaries.svg',
    alt: 'Rockwell logo',
  },
  {
    name: 'Shang Properties, Inc.',
    logo: '/images/developers/shang-properties.png',
    alt: 'Shang Properties logo',
    darkTile: true,
    zoomClass: 'scale-[1.85] md:scale-[2.05]',
  },
  {
    name: 'Federal Land, Inc.',
    logo: '/images/developers/federal-land.webp',
    alt: 'Federal Land, Inc. official logo',
    darkTile: true,
    zoomClass: 'scale-[1.35] md:scale-[1.5]',
  },
  {
    name: 'DMCI Project Developers, Inc. (DMCI Homes)',
    logo: '/images/developers/dmci-homes.png',
    alt: 'DMCI Project Developers, Inc. official logo',
  },
  {
    name: 'RLC Residences (Robinsons Land Corporation)',
    logo: '/images/developers/rlc-residences.webp',
    alt: 'RLC Residences official logo',
    zoomClass: 'scale-[1.2] md:scale-[1.3]',
  },
  {
    name: 'SM Development Corporation (SMDC)',
    logo: '/images/developers/smdc.png',
    alt: 'SM Development Corporation official logo',
  },
  {
    name: 'Antel Land',
    logo: '/images/developers/antel-land.png',
    alt: 'Antel Land official logo',
    darkTile: true,
    zoomClass: 'scale-[1.3] md:scale-[1.4]',
  },
  {
    name: 'Cathay Land Inc.',
    logo: '/images/developers/cathay-land.png',
    alt: 'Cathay Land Inc. official logo',
    darkTile: true,
  },
];

export default function DeveloperSellingPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden border-b border-[#dde2e7] pt-[clamp(6.5rem,18vw,8.5rem)] pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80"
            alt="Modern real estate development skyline"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d0f12]/92 via-[#0d0f12]/88 to-[#1e2a36]/85" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
          <p className="mb-3 font-space-mono text-xs uppercase tracking-[0.2em] text-[#4d7bb0] md:text-sm">
            Developer Selling
          </p>
          <h1 className="mb-4 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
            Explore Accredited Developer Projects With Expert Guidance
          </h1>
          <p className="max-w-4xl text-base leading-relaxed text-white/90 md:text-lg">
            We help buyers navigate trusted options from major developers we are accredited with, so
            you can choose the right project with confidence and clarity.
          </p>
        </div>
      </section>

      <section className="border-y border-[#dde2e7] bg-white py-16 md:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <ScrollAnimation>
            <p className="mb-2 font-space-mono text-xs uppercase tracking-[0.2em] text-[#2f5f8f] md:text-sm">
              Official Partners
            </p>
            <h2 className="mb-10 text-3xl font-semibold text-[#0d0f12] md:text-4xl">
              Accredited With Major Developers
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {developers.map((developer) => (
                <article
                  key={developer.name}
                  className="rounded-xl border border-[#dde2e7] bg-gradient-to-b from-white to-[#fafbfc] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-6"
                >
                  <div
                    className={`mb-4 grid min-h-[80px] place-items-center rounded-lg border border-dashed px-3 py-3 ${
                      developer.darkTile
                        ? 'border-[#D4AF37]/40 bg-[#1e2a36]'
                        : 'border-[#1e2a36]/20 bg-white'
                    }`}
                  >
                    <Image
                      src={developer.logo}
                      alt={developer.alt}
                      width={280}
                      height={80}
                      className={`h-auto max-h-10 w-auto max-w-full object-contain md:max-h-9 sm:max-h-8 ${developer.zoomClass ?? ''}`}
                    />
                  </div>
                  <p className="text-center text-base font-semibold text-[#0d0f12]">{developer.name}</p>
                </article>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <section className="bg-[#0d0f12] py-16 text-white md:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <ScrollAnimation>
            <p className="mb-3 font-space-mono text-xs uppercase tracking-[0.2em] text-[#D4AF37] md:text-sm">
              Ready to Start?
            </p>
            <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
              Book a Consultation for Developer Project Matching
            </h2>
            <p className="mb-6 max-w-3xl text-base leading-relaxed text-white/85 md:text-lg">
              Tell us your budget, preferred area, and timeline. We will guide you through
              accredited developer options that align with your goals.
            </p>

            <Link
              href="/contact"
              className="inline-block rounded-md bg-white px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-[#0d0f12] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg"
            >
              Book a Consultation
            </Link>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
}
