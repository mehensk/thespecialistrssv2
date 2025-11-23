'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use redirect: false to handle errors, then redirect manually
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Session is established - redirect to callback route which handles redirect server-side
        // This is more reliable in production (Netlify) where client-side session reading can be delayed
        // The callback route reads the token server-side and redirects based on role
        const delay = typeof window !== 'undefined' && window.location.hostname.includes('netlify') 
          ? 500 
          : 250;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Always use callback route for reliable server-side redirect
        const callbackUrl = `${window.location.origin}/auth/callback`;
        console.log('Login successful, redirecting to callback:', callbackUrl);
        // Use replace to ensure redirect completes and prevent back navigation
        window.location.replace(callbackUrl);
      } else {
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err?.message?.includes('JSON') 
          ? 'Connection error. Please check your network and try again.'
          : 'An error occurred. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-[84px] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-[#E5E7EB]">
          <h1 className="text-3xl font-semibold text-[#111111] mb-2 text-center">
            Sign In
          </h1>
          <p className="text-[#111111]/70 text-center mb-8">
            Access your dashboard
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#111111] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#111111] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#111111]/50 hover:text-[#111111] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F2937] rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-[#111111]/70 hover:text-[#111111] text-sm"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white pt-[84px] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-[#E5E7EB]">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-8"></div>
              <div className="space-y-6">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

