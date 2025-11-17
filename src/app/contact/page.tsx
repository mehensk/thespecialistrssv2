'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Home as HomeIcon, TrendingUp, Key, FileCheck, Calculator, Lightbulb } from 'lucide-react';
import { ScrollAnimation } from '@/components/ui/scroll-animation';

export default function ContactPage() {
  const [message, setMessage] = useState('');
  const [interest, setInterest] = useState('');

  const handleServiceClick = (serviceName: string, interestValue: string) => {
    setMessage(`I need help with ${serviceName}. Please contact me.`);
    setInterest(interestValue);
    // Scroll to message field
    setTimeout(() => {
      const messageField = document.getElementById('message');
      if (messageField) {
        messageField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageField.focus();
      }
    }, 100);
  };
  return (
    <div className="min-h-screen bg-white pt-[84px]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1F2937] to-[#111111] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
              Contact Us
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto tracking-wide">
              Get in touch with us. We're here to help you find your perfect property or assist with your real estate needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information & Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information Sidebar */}
            <div className="lg:col-span-1">
              <ScrollAnimation>
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-[100px]">
                  <h2 className="text-2xl font-semibold text-[#111111] mb-6 tracking-tight">
                    Get in Touch
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Phone */}
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#F9FAFB] rounded-lg">
                        <Phone size={20} className="text-[#1F2937]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[#111111]/70 mb-1">Phone</h3>
                        <a 
                          href="tel:+639212303011" 
                          className="text-lg font-semibold text-[#111111] hover:text-[#1F2937] transition-colors"
                        >
                          +63 921 2303011
                        </a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#F9FAFB] rounded-lg">
                        <Mail size={20} className="text-[#1F2937]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[#111111]/70 mb-1">Email</h3>
                        <a 
                          href="mailto:thespecialistrss@gmail.com" 
                          className="text-lg font-semibold text-[#111111] hover:text-[#1F2937] transition-colors break-all"
                        >
                          thespecialistrss@gmail.com
                        </a>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#F9FAFB] rounded-lg">
                        <MapPin size={20} className="text-[#1F2937]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[#111111]/70 mb-1">Address</h3>
                        <p className="text-lg font-semibold text-[#111111]">
                          Las Pinas City
                        </p>
                      </div>
                    </div>

                    {/* Business Hours */}
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#F9FAFB] rounded-lg">
                        <Clock size={20} className="text-[#1F2937]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[#111111]/70 mb-1">Business Hours</h3>
                        <p className="text-lg font-semibold text-[#111111]">
                          Monday - Saturday<br />
                          <span className="text-base font-normal text-[#111111]/70">9:00 AM - 6:00 PM</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Services Section */}
                  <div className="pt-6 mt-6 border-t border-[#E5E7EB]">
                    <h3 className="text-lg font-semibold text-[#111111] mb-4 tracking-tight">
                      Our Services
                    </h3>
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => handleServiceClick('Property Buying Assistance', 'buying')}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors text-left"
                      >
                        <div className="h-8 w-8 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center flex-shrink-0">
                          <HomeIcon size={16} className="text-white" />
                        </div>
                        <span className="text-sm text-[#111111]/80">Property Buying Assistance</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleServiceClick('Property Selling & Marketing', 'selling')}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors text-left"
                      >
                        <div className="h-8 w-8 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center flex-shrink-0">
                          <TrendingUp size={16} className="text-white" />
                        </div>
                        <span className="text-sm text-[#111111]/80">Property Selling & Marketing</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleServiceClick('Leasing & Rental Services', 'renting')}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors text-left"
                      >
                        <div className="h-8 w-8 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Key size={16} className="text-white" />
                        </div>
                        <span className="text-sm text-[#111111]/80">Leasing & Rental Services</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleServiceClick('Documentation & Title Transfer', 'documentation')}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors text-left"
                      >
                        <div className="h-8 w-8 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileCheck size={16} className="text-white" />
                        </div>
                        <span className="text-sm text-[#111111]/80">Documentation & Title Transfer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleServiceClick('Property Valuation', 'other')}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors text-left"
                      >
                        <div className="h-8 w-8 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calculator size={16} className="text-white" />
                        </div>
                        <span className="text-sm text-[#111111]/80">Property Valuation</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleServiceClick('Real Estate Advisory', 'other')}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors text-left"
                      >
                        <div className="h-8 w-8 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Lightbulb size={16} className="text-white" />
                        </div>
                        <span className="text-sm text-[#111111]/80">Real Estate Advisory</span>
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <ScrollAnimation delay={100}>
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-semibold text-[#111111] mb-6 tracking-tight">
                    Send us a Message
                  </h2>
                  
                  <form className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-[#111111] mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        placeholder="Juan Dela Cruz"
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent shadow-sm focus:shadow-md transition-shadow"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#111111] mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="myemail@email.com"
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent shadow-sm focus:shadow-md transition-shadow"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-[#111111] mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="09XX-XXXX"
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent shadow-sm focus:shadow-md transition-shadow"
                        required
                      />
                    </div>

                    {/* I'm Interested in */}
                    <div>
                      <label htmlFor="interest" className="block text-sm font-medium text-[#111111] mb-2">
                        I'm Interested in
                      </label>
                      <select
                        id="interest"
                        name="interest"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent bg-white shadow-sm focus:shadow-md transition-shadow"
                        required
                      >
                        <option value="">Select an option</option>
                        <option value="buying">Buying</option>
                        <option value="selling">Selling</option>
                        <option value="renting">Renting</option>
                        <option value="documentation">Documentation (Transfer of Title, Tax Dec, Etc)</option>
                        <option value="schedule-tour">Schedule Tour</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-[#111111] mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us about your inquiry or requirements"
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent resize-vertical shadow-sm focus:shadow-md transition-shadow"
                        required
                      />
                    </div>

                    {/* Checkbox */}
                    <div>
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          name="consent"
                          className="mt-1 mr-3 h-4 w-4 text-[#1F2937] focus:ring-[#1F2937]"
                          required
                        />
                        <span className="text-sm text-[#111111]/80">
                          I agree to receive follow-up communication about my inquiry. The privacy and confidentiality of my data will be given due importance and protection.
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-8 py-4 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden group"
                      >
                        <span className="relative z-10">Send Inquiry</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      </button>
                    </div>
                  </form>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

