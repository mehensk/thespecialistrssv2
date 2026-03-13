'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LayoutDashboard, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { broadcastLogout } from '@/components/providers/LogoutSync';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { data: session, status } = useSession();
  const [isStableAuthenticated, setIsStableAuthenticated] = useState(false);
  const unauthenticatedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Stabilize authentication state to prevent flickering
  // Only update when status actually changes from loading to authenticated/unauthenticated
  // Debounce for 'unauthenticated' state to handle brief transitions during refetches
  useEffect(() => {
    // Clear any pending timeout
    if (unauthenticatedTimeoutRef.current) {
      clearTimeout(unauthenticatedTimeoutRef.current);
      unauthenticatedTimeoutRef.current = null;
    }
    
    if (status === 'authenticated' && session?.user) {
      // Immediately set to true when authenticated
      setIsStableAuthenticated(true);
    } else if (status === 'unauthenticated') {
      // Debounce setting to false - wait 300ms to see if status changes back
      // Reduced from 1 second to 300ms for faster state stabilization
      // This handles brief 'unauthenticated' states during slow network refetches
      unauthenticatedTimeoutRef.current = setTimeout(() => {
        setIsStableAuthenticated(false);
        unauthenticatedTimeoutRef.current = null;
      }, 300);
    }
    // Don't update during 'loading' state to prevent flickering
    // If we're already authenticated and status becomes 'loading', keep the authenticated state
    
    return () => {
      if (unauthenticatedTimeoutRef.current) {
        clearTimeout(unauthenticatedTimeoutRef.current);
      }
    };
  }, [status, session?.user, isStableAuthenticated]);
  
  // Use stable authenticated state
  const isAuthenticated = isStableAuthenticated;

  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    try {
      // Set logout flag to prevent auto-refetch
      localStorage.setItem('auth-logout-flag', 'true');
      
      // Broadcast logout to all tabs first
      broadcastLogout();
      
      // Call server-side logout endpoint to properly clear HttpOnly cookies
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Logout request failed');
      }
      
      // Also call signOut for client-side cleanup
      await signOut({ 
        redirect: false,
        callbackUrl: '/?logout=success'
      });
      
      // Redirect to home with success message
      window.location.href = '/?logout=success';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force redirect even if logout fails
      localStorage.setItem('auth-logout-flag', 'true');
      window.location.href = '/?logout=success';
    }
  };

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
      className={`fixed top-0 w-full z-50 transition-[background-color,box-shadow,backdrop-filter] duration-700 ease-in-out ${
        shouldBeTransparent
          ? 'bg-transparent' 
          : 'bg-white/95 backdrop-blur-sm shadow-lg'
      }`}
      style={{ fontFamily: 'var(--font-geist-sans)' }}
    >
      {/* Username (very left edge) - only for logged in users - hidden on mobile */}
      {isAuthenticated && session?.user && (
        <Link
          href={session.user.role === UserRole.ADMIN ? '/admin/dashboard' : '/dashboard'}
          className={`hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 items-center gap-2 pl-4 pr-3 py-1.5 rounded-full transition-all max-w-fit hover:scale-105 active:scale-95 font-space-grotesk text-base font-medium ${
            shouldBeTransparent
              ? 'bg-white/20 backdrop-blur-sm border border-white/30 text-white shadow-lg hover:bg-white/30' 
              : 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white shadow-md hover:from-[#1A232E] hover:to-[#0F1419]'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${
            shouldBeTransparent ? 'bg-white' : 'bg-[#D4AF37]'
          } animate-pulse`}></div>
          <span className="text-base font-medium whitespace-nowrap">
            Welcome, <span className="font-semibold">{session.user.name || session.user.email}</span>
          </span>
        </Link>
      )}
      
      <div className="mx-auto max-w-7xl h-[84px] px-4 md:px-6 flex items-center">
                {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0 rounded-md py-1 transition-[background-color,box-shadow,backdrop-filter,opacity] duration-700 ease-in-out"
          aria-label="The Specialist Realty"
        >
          <Image
            src="/images/TSR LOGO FOR WEBSITE.png"
            alt="The Specialist Realty"
            width={998}
            height={312}
            priority
            className="h-auto w-[150px] sm:w-[170px] md:w-[210px] lg:w-[240px]"
            style={{
              filter: shouldBeTransparent
                ? 'drop-shadow(0 0 0.8px rgba(255,255,255,0.98)) drop-shadow(0 0 1.8px rgba(255,255,255,0.9))'
                : 'none',
              transition: 'filter 700ms ease-in-out, opacity 700ms ease-in-out',
            }}
          />
        </Link>

        {/* Desktop Navigation — Centered */}
        <nav className="hidden lg:flex items-center gap-7 flex-1 justify-center">
          <NavLink href="/" shouldBeTransparent={shouldBeTransparent}>Home</NavLink>
          <NavLink href="/how-we-work" shouldBeTransparent={shouldBeTransparent}>How We Work</NavLink>
          
          {/* Services Dropdown */}
          <div className="relative group">
            <button 
              className={`flex items-center gap-1 px-3 py-2 rounded-md transition-all font-space-grotesk text-base font-medium ${
                shouldBeTransparent
                  ? 'text-white hover:bg-white/20'
                  : 'text-[#111111] hover:bg-[#F9FAFB]'
              }`}
            >
              Services
              <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="bg-white rounded-lg shadow-lg border border-[#dde2e7] min-w-[180px] overflow-hidden">
                {/* Gold accent line at top */}
                <div className="h-0.5 bg-gradient-to-r from-[#D4AF37] via-[#D4AF37]/30 to-transparent"></div>
                
                {/* Arrow indicator */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-[#dde2e7] rotate-45 -mt-1"></div>
                
                <a 
                  href="/listings"
                  className="block px-5 py-2.5 text-base text-[#1e2a36] hover:bg-[#f0f2f4] hover:text-[#2f5f8f] border-l-3 border-transparent hover:border-[#D4AF37] transition-all pl-5 hover:pl-6 font-space-grotesk font-medium"
                >
                  Listings
                </a>
                <a 
                  href="/investor-relations"
                  className="block px-5 py-2.5 text-base text-[#1e2a36] hover:bg-[#f0f2f4] hover:text-[#2f5f8f] border-l-3 border-transparent hover:border-[#D4AF37] transition-all pl-5 hover:pl-6 font-space-grotesk font-medium"
                >
                  Investor Relations
                </a>
                <a 
                  href="/developer-selling"
                  className="block px-5 py-2.5 text-base text-[#1e2a36] hover:bg-[#f0f2f4] hover:text-[#2f5f8f] border-l-3 border-transparent hover:border-[#D4AF37] transition-all pl-5 hover:pl-6 font-space-grotesk font-medium"
                >
                  Developer Selling
                </a>
              </div>
            </div>
          </div>
          
          {isAuthenticated && (
            <NavLink 
              href={session?.user?.role === UserRole.ADMIN ? '/admin/dashboard' : '/dashboard'} 
              shouldBeTransparent={shouldBeTransparent}
            >
              <span className="flex items-center gap-1.5">
                <LayoutDashboard size={16} />
                Dashboard
              </span>
            </NavLink>
          )}
        </nav>

        {/* Desktop CTA Buttons — Right-aligned */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0 ml-10">
          {/* Login link - always visible for easy development access */}
          {!isAuthenticated && (
            <Link
              href="/login"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-space-grotesk text-base font-medium transition-all ${
                shouldBeTransparent
                  ? 'text-white hover:bg-white/20 border border-white/30'
                  : 'text-[#111111] hover:bg-[#F9FAFB] border border-[#E5E7EB]'
              }`}
            >
              <LogIn size={14} />
              <span>Login</span>
            </Link>
          )}
            <Link
              href="/contact"
              className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-5 py-2 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 relative overflow-hidden group font-space-grotesk text-base font-medium"
            >
            <span className="relative z-10">Contact Us</span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 font-space-grotesk text-base font-medium ${
                shouldBeTransparent
                  ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                  : 'bg-white border border-[#E5E7EB] text-[#111111] hover:border-[#1F2937] hover:bg-[#F9FAFB]'
              }`}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          )}
        </div>

        {/* Mobile Buttons Container */}
        <div className="lg:hidden ml-auto flex items-center gap-1.5 flex-shrink-0">
          {/* Login link - always visible for easy development access */}
          {!isAuthenticated && (
            <Link
              href="/login"
              className={`flex items-center justify-center gap-1 px-2.5 py-2 rounded-md font-space-grotesk text-base font-medium transition-all min-w-[60px] ${
                shouldBeTransparent
                  ? 'text-white hover:bg-white/20 border border-white/30'
                  : 'text-[#111111] hover:bg-[#F9FAFB] border border-[#E5E7EB]'
              }`}
            >
              <LogIn size={14} className="flex-shrink-0" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
          <Link
            href="/contact"
            className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-2.5 py-2 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-space-grotesk text-base font-medium shadow-md whitespace-nowrap flex items-center justify-center"
          >
            <span className="hidden sm:inline">Contact Us</span>
            <span className="sm:hidden">Contact</span>
          </Link>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className={`flex items-center justify-center gap-1 px-2.5 py-2 rounded-md font-space-grotesk text-base font-medium transition-all min-w-[60px] ${
                shouldBeTransparent
                  ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                  : 'bg-white border border-[#E5E7EB] text-[#111111] hover:border-[#1F2937] hover:bg-[#F9FAFB]'
              }`}
            >
              <LogOut size={14} className="flex-shrink-0" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
          <button
            className={`p-2 rounded-md transition-all ${
              shouldBeTransparent 
                ? 'text-white hover:bg-white/20 border border-white/30' 
                : 'text-[#111111] hover:bg-[#F9FAFB] border border-[#E5E7EB]'
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-[#E5E7EB] px-4 py-6 space-y-5">
          <MobileLink href="/" onClose={closeMenu}>Home</MobileLink>
          <MobileLink href="/how-we-work" onClose={closeMenu}>How We Work</MobileLink>
          
          {/* Services (Expanded in Mobile Drawer) */}
          <div className="py-2 border-b border-[#E5E7EB]">
            <div className="font-semibold text-[#111111] mb-3 font-space-grotesk">Services</div>
            <div className="space-y-2 ml-4">
              <a 
                href="/listings"
                onClick={closeMenu}
                className="block text-base font-medium text-[#1e2a36] hover:text-[#2f5f8f] border-l-2 border-[#E5E7EB] hover:border-[#D4AF37] pl-3 transition-all font-space-grotesk"
              >
                Listings
              </a>
              <a 
                href="/investor-relations"
                onClick={closeMenu}
                className="block text-base font-medium text-[#1e2a36] hover:text-[#2f5f8f] border-l-2 border-[#E5E7EB] hover:border-[#D4AF37] pl-3 transition-all font-space-grotesk"
              >
                Investor Relations
              </a>
              <a 
                href="/developer-selling"
                onClick={closeMenu}
                className="block text-base font-medium text-[#1e2a36] hover:text-[#2f5f8f] border-l-2 border-[#E5E7EB] hover:border-[#D4AF37] pl-3 transition-all font-space-grotesk"
              >
                Developer Selling
              </a>
            </div>
          </div>
          
          {isAuthenticated && (
            <MobileLink 
              href={session?.user?.role === UserRole.ADMIN ? '/admin/dashboard' : '/dashboard'} 
              onClose={closeMenu}
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard size={18} />
                Dashboard
              </span>
            </MobileLink>
          )}
          {!isAuthenticated && (
            <Link
              href="/login"
              className="block text-center bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2.5 rounded-md mt-2 shadow-md flex items-center justify-center gap-2 font-space-grotesk text-base font-medium"
              onClick={closeMenu}
            >
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
          <Link
            href="/contact"
            className="block text-center bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2.5 rounded-md mt-2 shadow-md font-space-grotesk text-base font-medium"
            onClick={closeMenu}
          >
            Contact Us
          </Link>
          {session && (
            <button
              onClick={() => {
                closeMenu();
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#E5E7EB] text-[#111111] px-4 py-2.5 rounded-md mt-2 hover:bg-[#F9FAFB] transition-colors font-space-grotesk text-base font-medium"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}

// Reusable desktop link — Space Grotesk (not Sora)
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
      className={`hover:underline underline-offset-4 font-space-grotesk text-base font-medium transition-colors ${
        shouldBeTransparent
          ? 'text-white decoration-white drop-shadow-md' 
          : 'text-[#111111] decoration-[#111111]'
      }`}
    >
      {children}
    </Link>
  );
}

// Reusable mobile link — Space Grotesk
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
      className="block text-[#111111] text-base font-medium font-space-grotesk"
      onClick={onClose}
    >
      {children}
    </Link>
  );
}

