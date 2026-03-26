'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const send = async () => {
    setErr(''); setMsg('');
    const endpoint = tab === 'email' ? '/api/auth/verification/email/send' : '/api/auth/verification/phone/send';
    const payload = tab === 'phone' && phoneNumber.trim()
      ? { countryCode, phoneNumber }
      : undefined;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(payload ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    });
    const data = await res.json();
    if (!res.ok) return setErr(data?.error || 'Failed to send code');
    setMsg(data.message || 'Code sent');
  };

  const confirm = async () => {
    setErr(''); setMsg('');
    const endpoint = tab === 'email' ? '/api/auth/verification/email/confirm' : '/api/auth/verification/phone/confirm';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) return setErr(data?.error || 'Failed to verify');
    if (tab === 'email' && data?.token) {
      localStorage.setItem('auth_token', data.token);
      document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      setMsg('Email verified. Redirecting...');
      setTimeout(() => router.push('/cards'), 600);
      return;
    }
    setMsg(data.message || 'Verified');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-black dark:text-white">Verify Account</h1>

        <div className="flex gap-2">
          <button onClick={() => setTab('email')} className={`flex-1 py-2 rounded-lg ${tab === 'email' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>Email</button>
          <button onClick={() => setTab('phone')} className={`flex-1 py-2 rounded-lg ${tab === 'phone' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>Phone</button>
        </div>

        <button onClick={send} className="w-full py-3 rounded-lg bg-black text-white dark:bg-white dark:text-black">Send Code</button>

        {tab === 'phone' && (
          <div className="grid grid-cols-3 gap-2">
            <input
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              placeholder="+1"
              className="col-span-1 px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            />
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="5550000000"
              className="col-span-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            />
          </div>
        )}

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 6-digit code"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
        />

        <button onClick={confirm} className="w-full py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600">Verify</button>

        {err && <p className="text-sm text-red-500">{err}</p>}
        {msg && <p className="text-sm text-green-600">{msg}</p>}
      </div>
    </div>
  );
}
