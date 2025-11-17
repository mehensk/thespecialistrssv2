import Image from 'next/image';
import Link from 'next/link';
import { Home as HomeIcon, TrendingUp, Key, FileCheck, Calculator, Lightbulb, Bed, Bath, Square, MapPin } from 'lucide-react';
import { ScrollAnimation } from '@/components/ui/scroll-animation';
import { HeroSearch } from '@/components/ui/hero-search';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-screen min-h-[100vh] mb-40 sm:mb-32 md:mb-32">
        {/* Background Image - Luxury Condo Facade */}
        <div className="absolute inset-0 w-full h-full">
        <Image
            src="/images/hero-condo.jpg"
            alt="Luxury Condo Facade"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col pt-[84px] md:pt-0">
          {/* Top Content - Headline and Description */}
          <div className="flex-1 flex items-center">
            <div className="mx-auto max-w-7xl w-full px-4 md:px-6">
              <div className="max-w-3xl">
                <h1 className="text-5xl md:text-7xl font-semibold text-white mb-6 leading-tight tracking-tight">
                  Real Estate Solutions. Made Even Easier.
          </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl tracking-wide">
                  Sales · Rentals · Documentation assistance across Metro Manila and nearby cities. Work with a licensed broker backed by a trusted network and decades of finance & admin expertise.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
            <a
                    href="/listings"
                    className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-8 py-4 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 text-center font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden group"
                  >
                    <span className="relative z-10">View Properties</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </a>
            <a
                    href="/contact"
                    className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-8 py-4 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 text-center font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Schedule Tour</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar Overlay - Bottom Portion */}
          <div className="pb-8 md:pb-12 px-4 md:px-6 relative z-10">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-28 bg-white">
        <ScrollAnimation>
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <h2 className="text-4xl md:text-5xl font-semibold text-[#111111] text-center mb-20 tracking-tight">
              Why Choose Us
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Licensed & Experienced */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-64 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop"
                  alt="Licensed & Experienced"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-[#111111] mb-3 tracking-tight">
                  Licensed & Experienced
                </h3>
                <p className="text-[#111111]/80 leading-relaxed tracking-wide">
                  Licensed PRC Real Estate Broker offering industry expertise and a smooth, hassle-free client experience.
                </p>
              </div>
            </div>

            {/* Card 2: Accessibility & Responsiveness */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-64 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop"
                  alt="Accessibility & Responsiveness"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-[#111111] mb-3 tracking-tight">
                  Accessibility & Responsiveness
                </h3>
                <p className="text-[#111111]/80 leading-relaxed tracking-wide">
                  Easy to reach, fast to respond, and simple to work with.
                </p>
              </div>
            </div>

            {/* Card 3: Trust & Integrity */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-64 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop"
                  alt="Trust & Integrity"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-[#111111] mb-3 tracking-tight">
                  Trust & Integrity
                </h3>
                <p className="text-[#111111]/80 leading-relaxed tracking-wide">
                  Transparent, ethical practices that prioritize client interests.
                </p>
              </div>
            </div>
          </div>
          </div>
        </ScrollAnimation>
      </section>

      {/* Our Services Section */}
      <section className="py-28 bg-white">
        <ScrollAnimation delay={100}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <h2 className="text-4xl md:text-5xl font-semibold text-[#111111] text-center mb-16 tracking-tight">
              Our Services
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service 1: Property Buying Assistance */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 space-y-3">
              <div className="h-10 w-10 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center shadow-md">
                <HomeIcon size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#111111] tracking-tight">
                Property Buying Assistance
              </h3>
              <p className="text-[#111111]/60 text-sm leading-relaxed tracking-wide">
                Guidance on choosing the right property, negotiating effectively, and completing the transaction smoothly.
              </p>
            </div>

            {/* Service 2: Property Selling & Marketing */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 space-y-3">
              <div className="h-10 w-10 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center shadow-md">
                <TrendingUp size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#111111] tracking-tight">
                Property Selling & Marketing
              </h3>
              <p className="text-[#111111]/60 text-sm leading-relaxed tracking-wide">
                Professional listing exposure, pricing strategy, and buyer qualification to help sell efficiently and at fair market value.
              </p>
            </div>

            {/* Service 3: Leasing & Rental Services */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 space-y-3">
              <div className="h-10 w-10 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center shadow-md">
                <Key size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#111111] tracking-tight">
                Leasing & Rental Services
              </h3>
              <p className="text-[#111111]/60 text-sm leading-relaxed tracking-wide">
                For both landlords and tenants—unit showcasing, inquiry handling, tenant screening, and drafting lease agreements.
              </p>
            </div>

            {/* Service 4: Documentation & Title Transfer */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 space-y-3">
              <div className="h-10 w-10 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center shadow-md">
                <FileCheck size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#111111] tracking-tight">
                Documentation & Title Transfer
              </h3>
              <p className="text-[#111111]/60 text-sm leading-relaxed tracking-wide">
                Assistance with title transfer, deed preparation, taxes, BIR coordination, and LGU processing.
              </p>
            </div>

            {/* Service 5: Property Valuation */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 space-y-3">
              <div className="h-10 w-10 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center shadow-md">
                <Calculator size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#111111] tracking-tight">
                Property Valuation
              </h3>
              <p className="text-[#111111]/60 text-sm leading-relaxed tracking-wide">
                Market-based property assessments for owners, buyers, and investors to support informed decision-making.
              </p>
            </div>

            {/* Service 6: Real Estate Advisory */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 space-y-3">
              <div className="h-10 w-10 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center shadow-md">
                <Lightbulb size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#111111] tracking-tight">
                Real Estate Advisory
              </h3>
              <p className="text-[#111111]/60 text-sm leading-relaxed tracking-wide">
                Consultation on investment options, location strategy, market trends, and ownership structures.
              </p>
            </div>
          </div>
          </div>
        </ScrollAnimation>
      </section>

      {/* Featured Listings Section */}
      <section className="py-28 bg-white">
        <ScrollAnimation delay={200}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <h2 className="text-4xl md:text-5xl font-semibold text-[#111111] text-center mb-16 tracking-tight">
              Featured Listings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Property Card 1 */}
            <Link href="/listings/1" className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 block">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
                  alt="Property Listing"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Rent/Sale Badge - Top Right */}
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide shadow-md">
                    Sale
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-3">
                  <p className="text-2xl font-semibold text-[#111111]">₱12,500,000</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-[#111111]/70 mb-4">
                  <div className="flex items-center gap-2">
                    <Bed size={18} className="text-[#1F2937]" />
                    <span>3 Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath size={18} className="text-[#1F2937]" />
                    <span>2 Toilets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square size={18} className="text-[#1F2937]" />
                    <span>120 sqm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-[#1F2937]" />
                    <span>Makati</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2 rounded-md text-sm uppercase tracking-wide shadow-md">Condominium</span>
                </div>
              </div>
            </Link>

            {/* Property Card 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"
                  alt="Property Listing"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Rent/Sale Badge - Top Right */}
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide shadow-md">
                    Sale
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-3">
                  <p className="text-2xl font-semibold text-[#111111]">₱8,900,000</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-[#111111]/70 mb-4">
                  <div className="flex items-center gap-2">
                    <Bed size={18} className="text-[#1F2937]" />
                    <span>2 Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath size={18} className="text-[#1F2937]" />
                    <span>2 Toilets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square size={18} className="text-[#1F2937]" />
                    <span>85 sqm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-[#1F2937]" />
                    <span>Quezon City</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2 rounded-md text-sm uppercase tracking-wide shadow-md">House and Lot</span>
                </div>
              </div>
            </div>

            {/* Property Card 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop"
                  alt="Property Listing"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Rent/Sale Badge - Top Right */}
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide shadow-md">
                    Sale
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-3">
                  <p className="text-2xl font-semibold text-[#111111]">₱15,800,000</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-[#111111]/70 mb-4">
                  <div className="flex items-center gap-2">
                    <Bed size={18} className="text-[#1F2937]" />
                    <span>4 Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath size={18} className="text-[#1F2937]" />
                    <span>3 Toilets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square size={18} className="text-[#1F2937]" />
                    <span>150 sqm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-[#1F2937]" />
                    <span>BGC</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2 rounded-md text-sm uppercase tracking-wide shadow-md">Lot</span>
                </div>
              </div>
            </div>

            {/* Property Card 4 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-64 w-full overflow-hidden">
            <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
                  alt="Property Listing"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Rent/Sale Badge - Top Right */}
                <div className="absolute top-3 right-3">
                  <span className="bg-[#D4AF37] text-white px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide shadow-md">
                    Rent
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-3">
                  <p className="text-2xl font-semibold text-[#111111]">₱6,500,000<span className="text-base font-normal text-[#111111]/70">/mo</span></p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-[#111111]/70 mb-4">
                  <div className="flex items-center gap-2">
                    <Bed size={18} className="text-[#1F2937]" />
                    <span>2 Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath size={18} className="text-[#1F2937]" />
                    <span>1 Toilet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square size={18} className="text-[#1F2937]" />
                    <span>65 sqm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-[#1F2937]" />
                    <span>Manila</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2 rounded-md text-sm uppercase tracking-wide shadow-md">Building</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Browse Listings Button */}
          <div className="flex justify-center mt-12">
            <a
              href="/listings"
              className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-8 py-4 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 text-center font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden group"
            >
              <span className="relative z-10">Browse our listings</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </a>
        </div>
          </div>
        </ScrollAnimation>
      </section>

      {/* Call to Action Section */}
      <section className="py-28 bg-white relative overflow-hidden">
        <ScrollAnimation delay={300}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CTA Card - Left */}
              <div className="relative bg-gradient-to-br from-[#1F2937] via-[#111111] to-[#1F2937] rounded-2xl overflow-hidden shadow-2xl">
                {/* Background Pattern/Decoration */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 px-8 md:px-12 py-12 md:py-16 h-full flex flex-col justify-center">
                  <div className="text-center lg:text-left">
                    {/* Icon/Decoration */}
                    <div className="mb-6 flex justify-center lg:justify-start">
                      <div className="h-20 w-20 bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6 tracking-tight">
                      Ready to Find Your Perfect Property?
                    </h2>
                    <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed tracking-wide">
                      Let's work together to make your real estate dreams a reality. Get in touch with our expert team today.
                    </p>
                    
                    {/* Contact Us Button */}
                    <div className="flex justify-center lg:justify-start">
                      <a
                        href="/contact"
                        className="bg-white text-[#1F2937] px-8 py-4 rounded-md hover:bg-white/90 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden group inline-block"
                      >
                        <span className="relative z-10">Contact Us</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Card - Right */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-full min-h-[400px] lg:min-h-[500px]">
                <Image
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop"
                  alt="Real Estate Professional Consultation"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Overlay for better text readability if needed */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </section>
    </div>
  );
}
