import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1F2937] border-t border-[#374151] relative z-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1 — Branding */}
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">
                The Specialist - Realty Solutions & Services
              </h3>
              <p className="text-sm text-white/70">REBL PRC License # 33422</p>
            </div>
            {/* Social Icons */}
            <div className="flex gap-4 mt-8">
              <a
                href="#"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white/70 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/listings" className="text-white/70 hover:text-white transition-colors">
                  Listings
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/70 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Services */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-white/70">Buying Assistance</span>
              </li>
              <li>
                <span className="text-white/70">Selling & Marketing</span>
              </li>
              <li>
                <span className="text-white/70">Rentals</span>
              </li>
              <li>
                <span className="text-white/70">Documentation</span>
              </li>
              <li>
                <span className="text-white/70">Title Transfer</span>
              </li>
              <li>
                <span className="text-white/70">Valuation</span>
              </li>
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/70">
                <Phone size={18} className="text-white" />
                <span>+63 921 2303011</span>
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <Mail size={18} className="text-white" />
                <span>thespecialistrss@gmail.com</span>
              </li>
              <li className="flex items-start gap-2 text-white/70">
                <MapPin size={18} className="text-white mt-1" />
                <span>Las Pinas City</span>
              </li>
            </ul>
            {/* CTA Button */}
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-block bg-white text-[#1F2937] px-6 py-2 rounded-md hover:bg-white/90 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#374151]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="text-center text-sm text-white/70">
            <p>© The Specialist - Realty Solutions & Services. All rights reserved 2025.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

