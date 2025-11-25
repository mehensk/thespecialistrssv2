'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Loader2, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { UserRole } from '@prisma/client';

interface NewUserFormData {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  generatePassword: boolean;
}

export default function NewUserPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [formData, setFormData] = useState<NewUserFormData>({
    name: '',
    email: '',
    role: UserRole.AGENT,
    password: '',
    generatePassword: true,
  });

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData({ ...formData, password: newPassword, generatePassword: false });
  };

  const handleCopy = async () => {
    if (temporaryPassword) {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTemporaryPassword('');

    // Validate password if manually entered
    if (!formData.generatePassword && formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include', // Ensure cookies are sent (important for Netlify)
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.generatePassword ? undefined : formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create user');
        setSaving(false);
        return;
      }

      // If password was generated, show it
      if (data.temporaryPassword) {
        setTemporaryPassword(data.temporaryPassword);
      }

      // Redirect after 3 seconds if password was shown, or immediately if custom password
      if (data.temporaryPassword) {
        setTimeout(() => {
          router.push('/admin/users');
        }, 5000);
      } else {
        setTimeout(() => {
          router.push('/admin/users');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/users"
          className="p-2 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded-md transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-semibold text-[#111111]">Add New User</h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {temporaryPassword && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-6">
            <p className="font-medium mb-2">✅ User created successfully!</p>
            <p className="text-sm mb-3">
              Share this temporary password with the user. They should change it after logging in.
            </p>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={temporaryPassword}
                readOnly
                className="w-full px-4 py-3 pr-20 border border-[#E5E7EB] rounded-md bg-white font-mono text-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-[#111111]/50 hover:text-[#111111] hover:bg-[#F9FAFB] rounded transition-colors"
                  title="Toggle visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 text-[#111111]/50 hover:text-[#111111] hover:bg-[#F9FAFB] rounded transition-colors"
                  title="Copy password"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#111111] mb-2"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
              placeholder="Enter user's full name"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#111111] mb-2"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
              placeholder="user@example.com"
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-[#111111] mb-2"
            >
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              required
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
            >
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.AGENT}>Agent</option>
              <option value={UserRole.WRITER}>Writer</option>
            </select>
            <p className="text-xs text-[#111111]/50 mt-1">
              Select the user's role and permissions
            </p>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#111111]"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Generate Secure Password
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value, generatePassword: false })}
                required
                minLength={8}
                className="w-full px-4 py-3 pr-12 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                placeholder={formData.generatePassword ? 'Click "Generate Secure Password" or enter manually' : 'Enter password (min. 8 characters)'}
              />
              {formData.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111111]/50 hover:text-[#111111] transition-colors p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            </div>
            <p className="text-xs text-[#111111]/50 mt-1">
              {formData.generatePassword
                ? 'A secure password will be generated automatically if left empty'
                : 'Password must be at least 8 characters long'}
            </p>
            {formData.password && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <Eye size={12} />
                Click the eye icon to {showPassword ? 'hide' : 'view'} the password
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create User
                </>
              )}
            </button>
            <Link
              href="/admin/users"
              className="px-6 py-3 border border-[#E5E7EB] text-[#111111] rounded-md hover:bg-[#F9FAFB] transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

