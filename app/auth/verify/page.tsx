'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import Silk from '@/components/Silk';

export default function VerifyPage() {
  const router = useRouter();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  useEffect(() => {
    if (!token) router.replace('/auth');
  }, [router, token]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setIsDarkTheme(root.classList.contains('dark'));

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const send = async () => {
    if (!token || cooldown > 0) return;
    setErr('');
    setMsg('');
    setSending(true);
    try {
      const res = await fetch('/api/auth/verification/email/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || 'Failed to send code');
        return;
      }
      setMsg(data.message || 'Verification code sent to your email.');
      setCooldown(45);
    } catch {
      setErr('Failed to send code');
    } finally {
      setSending(false);
    }
  };

  const confirm = async () => {
    if (!token) return;
    setErr('');
    setMsg('');

    if (!/^\d{6}$/.test(code.trim())) {
      setErr('Please enter a valid 6-digit code.');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch('/api/auth/verification/email/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || 'Failed to verify');
        return;
      }

      if (data?.token) {
        localStorage.setItem('auth_token', data.token);
        document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }

      setMsg('Email verified successfully. Redirecting…');
      setTimeout(() => router.push('/cards'), 700);
    } catch {
      setErr('Failed to verify');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="fixed inset-0 z-0" aria-hidden style={{ pointerEvents: 'none' }}>
        <div className="absolute inset-0 opacity-68 dark:opacity-45" style={{ pointerEvents: 'none' }}>
          <Silk
            speed={3.4}
            scale={0.95}
            color={isDarkTheme ? '#7c3aed' : '#1e3a8a'}
            noiseIntensity={1.1}
            rotation={0.12}
          />
        </div>
        <div
          className="absolute inset-0 niche-animated-gradient bg-[linear-gradient(120deg,rgba(62,45,78,0.9),rgba(86,50,86,0.86),rgba(72,46,84,0.84),rgba(52,40,68,0.9))] dark:bg-[linear-gradient(120deg,rgba(8,8,12,0.95),rgba(34,8,28,0.85),rgba(16,8,26,0.86),rgba(6,6,10,0.95))]"
          style={{ pointerEvents: 'none' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-black/10 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-black dark:text-white">Verify your email</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Secure your account to continue</p>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-900/15 p-3">
          <p className="text-xs text-rose-700 dark:text-rose-200 flex items-start gap-2">
            <Mail className="w-3.5 h-3.5 mt-0.5" />
            We&apos;ll send a 6-digit code to your registered email address.
          </p>
        </div>

        <button
          onClick={send}
          disabled={sending || cooldown > 0}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-black to-zinc-800 dark:from-white dark:to-zinc-200 dark:text-black disabled:opacity-60"
        >
          {sending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send verification code'}
        </button>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">6-digit code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            inputMode="numeric"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white tracking-[0.2em] text-center"
          />
        </div>

        <button
          onClick={confirm}
          disabled={verifying}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white font-semibold hover:brightness-110 transition disabled:opacity-60"
        >
          {verifying ? 'Verifying…' : 'Verify email'}
        </button>

        {err && <p className="text-sm text-red-500">{err}</p>}
        {msg && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
