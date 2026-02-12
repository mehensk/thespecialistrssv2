'use client';

import { useState } from 'react';
import { ScrollAnimation } from '@/components/ui/scroll-animation';

export default function HowWeWorkPage() {
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');

  const buyingSteps = [
    {
      number: 1,
      title: 'Consultation & Goal Setting',
      description: 'We begin by understanding your ideal location, budget, lifestyle needs, and property goals. This foundational step ensures we align our search with exactly what you\'re looking for.'
    },
    {
      number: 2,
      title: 'Property Matching & Shortlisting',
      description: 'We curate the best options—condos, houses, or lots—based on your exact requirements. Our market expertise helps us identify properties that offer the best value and fit your criteria.'
    },
    {
      number: 3,
      title: 'Site Viewing & Property Assessment',
      description: 'We schedule viewings at your convenience, review property details thoroughly, and guide you in comparing choices wisely. We point out both advantages and potential considerations for each property.'
    },
    {
      number: 4,
      title: 'Offer & Negotiation Support',
      description: 'We assist you in structuring a strong offer and negotiating terms that protect your best interest. Our experience ensures you get the best possible deal while maintaining a smooth process.'
    },
    {
      number: 5,
      title: 'Documentation & Transaction Guidance',
      description: 'We guide you through all requirements and ensure each step is organized and transparent. From contracts to government documents, we handle the paperwork so you can focus on your excitement.'
    },
    {
      number: 6,
      title: 'Closing & Turnover Assistance',
      description: 'From final payments to turnover coordination, we help you complete the purchase smoothly. We ensure all conditions are met and transition you seamlessly into your new property.'
    }
  ];

  const sellingSteps = [
    {
      number: 1,
      title: 'Property Assessment',
      description: 'We evaluate your property\'s market value and develop a strategic marketing plan tailored to your goals. Our comprehensive assessment includes market analysis and property positioning recommendations.'
    },
    {
      number: 2,
      title: 'Digital Marketing System',
      description: 'Your property is presented through our digital marketing system with 24/7 online accessibility for serious buyers. We create professional listings with high-quality images and compelling descriptions.'
    },
    {
      number: 3,
      title: 'Targeted Buyer Matching',
      description: 'Your listing is shared directly with qualified prospects within our database whose preferences align with your property. This targeted approach saves time and connects you with serious buyers.'
    },
    {
      number: 4,
      title: 'Professional Network Exposure',
      description: 'We circulate your property through our brokers\' network and MLS, connecting you with active buyers across multiple channels. This broad exposure increases your chances of finding the right buyer quickly.'
    },
    {
      number: 5,
      title: 'Inquiry Management',
      description: 'Our team remains ready to respond quickly and professionally to inquiries as they come in. We pre-qualify buyers and schedule viewings, ensuring your time is respected and protected.'
    },
    {
      number: 6,
      title: 'Closing Support',
      description: 'We support you through the entire closing process to ensure a smooth, successful transaction. From offer negotiation to final turnover, we handle all details and keep you informed every step of the way.'
    }
  ];

  const benefits = [
    {
      title: '✓ Transparent Communication',
      description: 'We keep you informed at every stage, with clear updates and no hidden surprises.'
    },
    {
      title: '✓ Expert Market Knowledge',
      description: 'Our deep understanding of the local market helps you make informed decisions.'
    },
    {
      title: '✓ Personalized Service',
      description: 'We tailor our approach to your unique needs and goals, never using a one-size-fits-all method.'
    },
    {
      title: '✓ Strong Negotiation Skills',
      description: 'We advocate fiercely for your interests to secure the best possible terms and price.'
    },
    {
      title: '✓ Time-Saving Efficiency',
      description: 'We handle all the details, paperwork, and coordination so you can focus on what matters.'
    },
    {
      title: '✓ Long-Term Partnership',
      description: 'We build lasting relationships and remain available for ongoing real estate needs.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#1F2937] to-[#111111] text-white py-20 md:py-24">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80")'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f12]/95 via-[#0d0f12]/92 to-[#1e2a36]/90"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <p className="text-[#4d7bb0] text-sm md:text-base font-space-mono uppercase tracking-widest mb-4">
              Our Process
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 tracking-tight">
              How We Work
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              At The Specialist Realty, we've developed a streamlined, client-focused approach to real estate transactions. Whether you're buying or selling, our process is designed to be transparent, efficient, and stress-free.
            </p>
          </div>
        </div>
      </section>

      {/* Process Tabs Section */}
      <section className="py-16 md:py-20 bg-[#f0f2f4]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <ScrollAnimation>
            {/* Tabs */}
            <div className="flex flex-wrap gap-3 mb-8 border-b border-[#dde2e7]">
              <button
                onClick={() => setActiveTab('buying')}
                className={`px-6 py-3 font-semibold text-sm md:text-base uppercase tracking-wider transition-all duration-300 ${
                  activeTab === 'buying'
                    ? 'bg-[#0d0f12] text-white scale-[1.02]'
                    : 'bg-black/3 text-[#1e2a36] hover:bg-black/6 hover:scale-[1.02]'
                }`}
              >
                Buying Process
              </button>
              <button
                onClick={() => setActiveTab('selling')}
                className={`px-6 py-3 font-semibold text-sm md:text-base uppercase tracking-wider transition-all duration-300 ${
                  activeTab === 'selling'
                    ? 'bg-[#0d0f12] text-white scale-[1.02]'
                    : 'bg-black/3 text-[#1e2a36] hover:bg-black/6 hover:scale-[1.02]'
                }`}
              >
                Selling Process
              </button>
            </div>

            {/* Buying Process */}
            <div
              className={`space-y-4 ${activeTab === 'buying' ? 'block' : 'hidden'} animate-fadeIn`}
            >
              <p className="text-[#1e2a36] text-lg max-w-3xl leading-relaxed mb-6">
                Our buying process is designed to help you find the perfect property with confidence and clarity. From initial consultation to final turnover, we're with you every step of the way.
              </p>
              
              {buyingSteps.map((step, index) => (
                <div
                  key={step.number}
                  className="bg-white border border-[#dde2e7] rounded-xl p-6 md:p-7 relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute top-6 left-6 w-12 h-12 bg-[#2f5f8f] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.number}
                  </div>
                  <div className="ml-16">
                    <h3 className="text-xl font-semibold text-[#0d0f12] mb-2 font-space-grotesk">
                      {step.title}
                    </h3>
                    <p className="text-[#1e2a36] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Selling Process */}
            <div
              className={`space-y-4 ${activeTab === 'selling' ? 'block' : 'hidden'} animate-fadeIn`}
            >
              <p className="text-[#1e2a36] text-lg max-w-3xl leading-relaxed mb-6">
                Our selling process maximizes your property's exposure and value through strategic marketing and professional management. We connect your property with qualified buyers and handle all transaction details.
              </p>
              
              {sellingSteps.map((step, index) => (
                <div
                  key={step.number}
                  className="bg-white border border-[#dde2e7] rounded-xl p-6 md:p-7 relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute top-6 left-6 w-12 h-12 bg-[#2f5f8f] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.number}
                  </div>
                  <div className="ml-16">
                    <h3 className="text-xl font-semibold text-[#0d0f12] mb-2 font-space-grotesk">
                      {step.title}
                    </h3>
                    <p className="text-[#1e2a36] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20 bg-white border-t border-b border-[#dde2e7]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <ScrollAnimation delay={100}>
            <p className="text-[#2f5f8f] text-sm md:text-base font-space-mono uppercase tracking-widest mb-4">
              Why Our Process Works
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#0d0f12] mb-8">
              The Benefits of Working With Us
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-[#f0f2f4] p-6 rounded-xl border-l-4 border-[#D4AF37] hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <h3 className="text-lg font-semibold text-[#0d0f12] mb-3 font-space-grotesk">
                    {benefit.title}
                  </h3>
                  <p className="text-[#1e2a36] text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-[#0d0f12] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <ScrollAnimation delay={200}>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-[#D4AF37] text-sm md:text-base font-space-mono uppercase tracking-widest mb-4">
                Ready to Get Started?
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold mb-6">
                Let's Make Your Real Estate Goals a Reality
              </h2>
              <p className="text-white/85 text-lg mb-8 leading-relaxed">
                Whether you're buying your dream home or selling your property, our proven process and dedicated team ensure a smooth, successful experience. Contact us today to begin your journey.
              </p>
              <a
                href="/contact"
                className="inline-block bg-[#4d7bb0] hover:bg-[#2f5f8f] text-white px-8 py-4 rounded-lg transition-all duration-300 font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Contact Us Today
              </a>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
}