'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    // Only track scroll on homepage
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Determine if navbar should be transparent (only on homepage when not scrolled)
  const shouldBeTransparent = isHomePage && !isScrolled;

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        shouldBeTransparent
          ? 'bg-transparent' 
          : 'bg-white/95 backdrop-blur-sm shadow-lg'
      }`}
    >
      <div className="mx-auto max-w-7xl h-[84px] px-4 md:px-6 flex items-center">
        {/* Logo — Sora 600 (Left-aligned) */}
        <Link
          href="/"
          className={`text-lg lg:text-2xl font-[600] font-sora flex-shrink-0 transition-colors ${
            shouldBeTransparent
              ? 'text-white drop-shadow-lg' 
              : 'text-[#111111]'
          }`}
          style={{ fontFamily: 'var(--font-sora)' }}
        >
          The Specialist Realty
        </Link>

        {/* Desktop Navigation — Centered */}
        <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          <NavLink href="/" shouldBeTransparent={shouldBeTransparent}>Home</NavLink>
          <NavLink href="/listings" shouldBeTransparent={shouldBeTransparent}>Listings</NavLink>
          <NavLink href="/blog" shouldBeTransparent={shouldBeTransparent}>Blog</NavLink>
          <NavLink href="/contact" shouldBeTransparent={shouldBeTransparent}>Contact</NavLink>
        </nav>

        {/* Desktop CTA Button — Right-aligned */}
        <div className="hidden lg:flex items-center flex-shrink-0 ml-12">
        <Link
          href="/contact"
          className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-5 py-2 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 relative overflow-hidden group"
        >
          <span className="relative z-10">Contact Us</span>
          <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </Link>
        </div>

        {/* Mobile Buttons Container */}
        <div className="lg:hidden ml-auto flex items-center gap-2 flex-shrink-0">
          <Link
            href="/contact"
            className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-3 py-1.5 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 text-xs font-medium shadow-md whitespace-nowrap"
          >
            Contact Us
          </Link>
          <button
            className={`transition-colors ${
              shouldBeTransparent ? 'text-white drop-shadow-lg' : 'text-[#111111]'
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-[#E5E7EB] px-4 py-6 space-y-5">
          <MobileLink href="/" onClose={closeMenu}>Home</MobileLink>
          <MobileLink href="/listings" onClose={closeMenu}>Listings</MobileLink>
          <MobileLink href="/blog" onClose={closeMenu}>Blog</MobileLink>
          <MobileLink href="/contact" onClose={closeMenu}>Contact</MobileLink>
          <Link
            href="/contact"
            className="block text-center bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2.5 rounded-md mt-2 shadow-md"
            onClick={closeMenu}
          >
            Contact Us
          </Link>
        </div>
      )}
    </header>
  );
}

// Reusable desktop link — Geist Sans (not Sora)
function NavLink({ 
  href, 
  children, 
  shouldBeTransparent 
}: { 
  href: string; 
  children: React.ReactNode;
  shouldBeTransparent: boolean;
}) {
  return (
    <Link
      href={href}
      className={`hover:underline underline-offset-4 font-sans transition-colors ${
        shouldBeTransparent
          ? 'text-white decoration-white drop-shadow-md' 
          : 'text-[#111111] decoration-[#111111]'
      }`}
    >
      {children}
    </Link>
  );
}

// Reusable mobile link — Geist Sans
function MobileLink({
  href,
  children,
  onClose,
}: {
  href: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      className="block text-[#111111] text-lg font-sans"
      onClick={onClose}
    >
      {children}
    </Link>
  );
}