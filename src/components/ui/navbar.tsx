'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, LayoutDashboard, LogOut, LogIn } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { broadcastLogout } from '@/components/providers/LogoutSync';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { data: session, status } = useSession();
  
  // Determine if user is authenticated - check both session and status
  // Status 'authenticated' means user is logged in, 'unauthenticated' means logged out
  const isAuthenticated = status === 'authenticated' && session?.user;

  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    try {
      // Broadcast logout to all tabs first
      broadcastLogout();
      
      // Sign out without redirect first to ensure cookies are cleared
      // Then manually redirect to ensure session is cleared
      await signOut({ 
        redirect: false, // Don't redirect automatically - we'll do it manually
        callbackUrl: '/'
      });
      
      // Manually clear all auth cookies to ensure they're removed
      // NextAuth v5 uses authjs.session-token
      document.cookie = 'authjs.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = '__Secure-authjs.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure';
      // Also clear old cookie names for backward compatibility
      document.cookie = 'next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = '__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure';
      
      // Force redirect to home page - this ensures middleware checks the session
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear cookies and force redirect even if signOut fails
      document.cookie = 'authjs.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = '__Secure-authjs.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure';
      document.cookie = 'next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = '__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure';
      window.location.replace('/');
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
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        shouldBeTransparent
          ? 'bg-transparent' 
          : 'bg-white/95 backdrop-blur-sm shadow-lg'
      }`}
    >
      {/* Username (very left edge) - only for logged in users */}
      {isAuthenticated && (
        <Link
          href={session.user.role === UserRole.ADMIN ? '/admin/dashboard' : '/dashboard'}
          className={`absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pl-4 pr-3 py-1.5 rounded-full transition-all max-w-fit hover:scale-105 active:scale-95 ${
            shouldBeTransparent
              ? 'bg-white/20 backdrop-blur-sm border border-white/30 text-white shadow-lg hover:bg-white/30' 
              : 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white shadow-md hover:from-[#1A232E] hover:to-[#0F1419]'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${
            shouldBeTransparent ? 'bg-white' : 'bg-[#D4AF37]'
          } animate-pulse`}></div>
          <span className="text-sm font-medium whitespace-nowrap">
            Welcome, <span className="font-semibold">{session.user.name || session.user.email}</span>
          </span>
        </Link>
      )}
      
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
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0 ml-12">
          {/* Login link - always visible for easy development access */}
          {!isAuthenticated && (
            <Link
              href="/login"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
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
            className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-5 py-2 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 relative overflow-hidden group"
          >
            <span className="relative z-10">Contact Us</span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 ${
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
        <div className="lg:hidden ml-auto flex items-center gap-2 flex-shrink-0">
          {/* Login link - always visible for easy development access */}
          {!isAuthenticated && (
            <Link
              href="/login"
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                shouldBeTransparent
                  ? 'text-white hover:bg-white/20 border border-white/30'
                  : 'text-[#111111] hover:bg-[#F9FAFB] border border-[#E5E7EB]'
              }`}
            >
              <LogIn size={12} />
              <span>Login</span>
            </Link>
          )}
          <Link
            href="/contact"
            className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-3 py-1.5 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 text-xs font-medium shadow-md whitespace-nowrap"
          >
            Contact Us
          </Link>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                shouldBeTransparent
                  ? 'bg-white/20 hover:bg-white/30 text-white'
                  : 'bg-white border border-[#E5E7EB] text-[#111111] hover:border-[#1F2937]'
              }`}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          )}
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
              className="block text-center bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2.5 rounded-md mt-2 shadow-md flex items-center justify-center gap-2"
              onClick={closeMenu}
            >
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
          <Link
            href="/contact"
            className="block text-center bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2.5 rounded-md mt-2 shadow-md"
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
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#E5E7EB] text-[#111111] px-4 py-2.5 rounded-md mt-2 hover:bg-[#F9FAFB] transition-colors"
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