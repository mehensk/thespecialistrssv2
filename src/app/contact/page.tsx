'use client';

import { useState, FormEvent } from 'react';
import { Phone, Mail, MapPin, Clock, Home as HomeIcon, TrendingUp, Key, FileCheck, Calculator, Lightbulb, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ScrollAnimation } from '@/components/ui/scroll-animation';
import { executeRecaptcha } from '@/lib/recaptcha';
import { sendContactEmail, type ContactFormData } from '@/lib/emailjs';

export default function ContactPage() {
  const [message, setMessage] = useState('');
  const [interest, setInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Store form reference before async operations (e.currentTarget can become null in async)
    const form = e.currentTarget as HTMLFormElement;
    
    // Get form values immediately before async operations
    const formDataObj = new FormData(form);
    const fullNameInput = form.querySelector<HTMLInputElement>('input[name="fullName"]');
    const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
    const phoneInput = form.querySelector<HTMLInputElement>('input[name="phone"]');
    const interestSelect = form.querySelector<HTMLSelectElement>('select[name="interest"]');
    const messageTextarea = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');

    try {
      // Execute reCAPTCHA to get token
      const recaptchaToken = await executeRecaptcha('contact_form');

      // Verify token with our API
      const verifyResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: recaptchaToken }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error(verifyData.error || 'reCAPTCHA verification failed');
      }

      // reCAPTCHA verified successfully - now send email via EmailJS
      const formData: ContactFormData = {
        fullName: fullNameInput?.value || formDataObj.get('fullName')?.toString() || '',
        email: emailInput?.value || formDataObj.get('email')?.toString() || '',
        phone: phoneInput?.value || formDataObj.get('phone')?.toString() || '',
        interest: interest || interestSelect?.value || formDataObj.get('interest')?.toString() || '',
        message: message || messageTextarea?.value || formDataObj.get('message')?.toString() || '',
      };

      // Send email via EmailJS
      await sendContactEmail(formData);

      // Show success message
      setSubmitSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        const form = e.currentTarget;
        form.reset();
        setMessage('');
        setInterest('');
        setSubmitSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
                  
                  {/* Success Message */}
                  {submitSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                      <p className="text-green-800 text-sm">
                        Thank you! Your message has been sent successfully. We'll get back to you soon.
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {submitError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                      <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                      <p className="text-red-800 text-sm">{submitError}</p>
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
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
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-8 py-4 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmitting ? (
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <Loader2 size={20} className="animate-spin" />
                            Verifying...
                          </span>
                        ) : (
                          <>
                            <span className="relative z-10">Send Inquiry</span>
                            <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          </>
                        )}
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

