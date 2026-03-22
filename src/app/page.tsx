import type { Metadata } from 'next';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Sparkles, House } from 'lucide-react';
import { ScrollAnimation } from '@/components/ui/scroll-animation';
import { HeroSearch } from '@/components/ui/hero-search';
import { LogoutMessage } from '@/components/logout-message';
import { getSiteUrl } from '@/lib/site-url';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Buy, sell, or invest with confidence through The Specialist Realty Solutions and Services.',
  alternates: {
    canonical: `${siteUrl}/`,
  },
};

// Lazy load FeaturedListings component - it's below the fold
const FeaturedListings = dynamic(() => import('@/components/featured-listings').then(mod => ({ default: mod.FeaturedListings })), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  ),
  ssr: true,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={null}>
        <LogoutMessage />
      </Suspense>
      {/* Hero Section - Phase 2 Redesign */}
      <section className="hero hero-split">
        <div className="container hero-split-grid">
          {/* Hero Panel - Left */}
          <div className="hero-panel">
            <h1>
              Meet <span style={{ color: 'var(--gold)' }}>The Specialist</span>
            </h1>
            <p className="lead">Welcome to The Specialist Realty Solutions and Services. Elevated Real Estate guidance meets genuine client care.</p>
            <p className="lead">With over 10 years of expertise in general brokerage, developer selling, documentation and valuation, we help you make confident property decisions through expert support and a refreshingly honest approach.</p>
            <p className="lead">Whether you're searching for a condominium, family home, or investment property, we make your journey smooth, informed, and truly rewarding.</p>
          </div>

          {/* Hero Actions Card - Right */}
          <div className="hero-actions-card">
            <div className="hero-actions-header">
              <Sparkles size={16} className="section-icon" />
              Quick Actions
            </div>
            <p className="hero-actions-intro">Ready to explore your next home? Browse our curated listings or book a personalized tour today.</p>
            <div className="cta-row">
              <a href="/listings">View Listings</a>
              <a href="/contact">Schedule Tour</a>
            </div>
            
            <div className="hero-actions-sell">
              <div className="hero-actions-header">
                <House size={16} className="section-icon" />
                Sell Your Property
              </div>
              <div className="cta-row">
                <a href="/contact" className="enlist-button">Enlist Now</a>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="container hero-search">
          <div className="search-header">Search our Properties</div>
          <HeroSearch />
        </div>
      </section>

      {/* Why Choose Us Section - Phase 3 */}
      <section className="section grid-section">
        <div className="container">
          <div className="section-header-centered">
            <p className="eyebrow">Our Difference</p>
            <h2>Why Choose The Specialist Realty</h2>
            <p className="why-choose-subtext">Expertise You Can Trust, Service You Can Feel</p>
          </div>
          
          <div className="why-choose-grid">
            {/* Card 1: Expert Guidance - Shield Icon */}
            <article className="card">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <h3>Professional Guidance</h3>
              <div className="card-content">
                <p>From property selection to final turnover, we guide you with clarity and confidence throughout the entire process.</p>
              </div>
            </article>

            {/* Card 2: Personalized Experience - Clock Icon */}
            <article className="card">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3>Personalized Experience</h3>
              <div className="card-content">
                <p>No two clients are the same. We listen closely to what matters most and align you with the right property opportunities.</p>
              </div>
            </article>

            {/* Card 3: Life Transitions - Refresh Arrows Icon */}
            <article className="card">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                  <path d="M16 21h5v-5"/>
                </svg>
              </div>
              <h3>Life Transitions</h3>
              <div className="card-content">
                <p>Real estate is tied to life's biggest turning points. We offer steady support through every transition.</p>
              </div>
            </article>

            {/* Card 4: Elevated Marketing - Checkmark Icon */}
            <article className="card">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3>Elevated Marketing</h3>
              <div className="card-content">
                <p>Your property gets polished, high-quality presentation and strategic exposure to attract serious buyers.</p>
              </div>
            </article>

            {/* Card 5: Trust & Integrity - Bookmark Icon */}
            <article className="card">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
              </div>
              <h3>Trust & Integrity</h3>
              <div className="card-content">
                <p>Our approach is refreshingly honest, calm, and pressure-free, built on trust and long-term relationships.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Our Services Section - Phase 4 */}
      <section className="section grid-section">
        <div className="container">
          <div className="section-header-centered">
            <p className="eyebrow">What We Do</p>
            <h2>Our Services</h2>
            <p className="services-subtext">Comprehensive real estate solutions for all your needs</p>
          </div>

          <div className="cards-5">
            <article className="card">
              <h3>Buying</h3>
              <p className="text-base">Property search, negotiation, and purchase assistance</p>
            </article>

            <article className="card">
              <h3>Selling</h3>
              <p className="text-base">Marketing, pricing strategy, and buyer qualification</p>
            </article>

            <article className="card">
              <h3>Leasing</h3>
              <p className="text-base">Unit showcasing, tenant screening, and lease agreements</p>
            </article>

            <article className="card">
              <h3>Documentation</h3>
              <p className="text-base">Title transfer, deed preparation, and BIR coordination</p>
            </article>

            <article className="card">
              <h3>Valuation</h3>
              <p className="text-base">Market-based property assessments for informed decisions</p>
            </article>
          </div>
        </div>
      </section>

      {/* Featured Listings Section - Phase 5 */}
      <section className="section featured">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="section-header">
            <p className="eyebrow">Available Now</p>
            <h2>Featured Listings</h2>
            <a href="/listings">Browse all listings →</a>
          </div>

          <FeaturedListings cardVariant="landing" />
        </div>
      </section>

      {/* Stats Section - Phase 6 */}
      <section className="section stats">
        <div className="container stats-row">
          <div className="stat">Trusted Property Advisor</div>
          <div className="stat">Licensed PRC Broker</div>
          <div className="stat">Metro Manila & Luzon</div>
          <div className="stat">Developer Accredited Seller</div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section cta">
        <div className="container cta-centered">
          <p className="eyebrow">Ready to Find Your Perfect Property?</p>
          <h2>Let's find the right property for you. Beautifully and professionally.</h2>
          <p>With The Specialist, you're not just choosing a real estate serviceyou're choosing a trusted real estate specialist who listens, understands your goals, and represents your best interest every step of the way.</p>
          <a href="/contact" className="cta-button">Contact Us Today</a>
        </div>
      </section>
    </div>
  );
}



