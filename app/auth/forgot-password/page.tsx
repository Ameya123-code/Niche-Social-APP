'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestCode = async () => {
    setError(''); setMessage('');
    const res = await fetch('/api/auth/forgot-password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data?.error || 'Failed to request reset');
    setMessage(data?.devCode ? `Code sent (dev): ${data.devCode}` : data.message || 'Code sent');
    setStep(2);
  };

  const resetPassword = async () => {
    setError(''); setMessage('');
    const res = await fetch('/api/auth/forgot-password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data?.error || 'Failed to reset password');
    setMessage('Password reset successful. Redirecting to login…');
    setTimeout(() => router.push('/auth'), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-black dark:text-white">Forgot Password</h1>
        <p className="text-sm text-gray-500">{step === 1 ? 'Request reset code' : 'Reset your password'}</p>

        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />

        {step === 2 && (
          <>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
          </>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        <button onClick={step === 1 ? requestCode : resetPassword}
          className="w-full py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600">
          {step === 1 ? 'Send Reset Code' : 'Reset Password'}
        </button>

        <button onClick={() => router.push('/auth')} className="text-sm text-red-500">Back to login</button>
      </div>
    </div>
  );
}
