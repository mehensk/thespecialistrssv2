'use client';

import { useState } from 'react';
import { KeyRound, Copy, Check, X, Eye, EyeOff } from 'lucide-react';

interface ResetPasswordButtonProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export function ResetPasswordButton({ userId, userName, userEmail }: ResetPasswordButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    setError('');
    setTemporaryPassword('');

    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        setLoading(false);
        return;
      }

      setTemporaryPassword(data.temporaryPassword);
      setShowPassword(true);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (temporaryPassword) {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setShowPassword(false);
    setTemporaryPassword('');
    setError('');
    setCopied(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        title="Reset Password"
      >
        <KeyRound size={16} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#111111]">
                Reset Password
              </h3>
              <button
                onClick={handleClose}
                className="p-1 text-[#111111]/50 hover:text-[#111111] hover:bg-[#F9FAFB] rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-[#111111]/70">
                Reset password for <strong>{userName}</strong> ({userEmail})
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {!showPassword ? (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
                  <p className="font-medium mb-1">⚠️ Warning</p>
                  <p>
                    This will generate a new temporary password. The user will need to change it after logging in.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 border border-[#E5E7EB] text-[#111111] rounded-md hover:bg-[#F9FAFB] transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
                  <p className="font-medium mb-2">✅ Password reset successfully!</p>
                  <p className="text-sm">
                    Share this temporary password with the user. They should change it after logging in.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">
                    Temporary Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={temporaryPassword}
                      readOnly
                      className="w-full px-4 py-3 pr-20 border border-[#E5E7EB] rounded-md bg-[#F9FAFB] font-mono text-sm"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 text-[#111111]/50 hover:text-[#111111] hover:bg-white rounded transition-colors"
                        title="Toggle visibility"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 text-[#111111]/50 hover:text-[#111111] hover:bg-white rounded transition-colors"
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

                <button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

