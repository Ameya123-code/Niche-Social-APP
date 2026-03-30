'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, LogOut, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AccountUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isAgeVerified?: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  useEffect(() => {
    if (!token) { router.push('/auth'); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) setUser(d.user as AccountUser);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router, token]);

  const signOut = () => {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; max-age=0';
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    if (!token) return;

    if (!user?.isEmailVerified) {
      const goVerify = window.confirm('Please verify your email first before deleting your account. Go to verification now?');
      if (goVerify) router.push('/auth/verify');
      return;
    }

    const ok = window.confirm('This will permanently delete your account and all data. Continue?');
    if (!ok) return;

    const typed = window.prompt('Type DELETE to confirm permanent account removal.');
    if (typed !== 'DELETE') return;

    setDeleting(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Delete failed');

      signOut();
    } catch {
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col w-full h-full bg-transparent">
      {/* Header */}
      <div className="px-5 sm:px-6 lg:px-8 pt-4 pb-4 flex items-center gap-3 border-b border-gray-100 dark:border-gray-900">
        <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition">
          <ChevronLeft className="w-5 h-5 text-black dark:text-white" />
        </Link>
        <h1 className="text-xl font-bold text-black dark:text-white flex-1">Account Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-6 lg:px-8 py-5 space-y-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Account</p>

          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4 space-y-2">
            <p className="text-sm font-semibold text-black dark:text-white">{user?.name ?? 'User'}</p>
            <p className="text-xs text-gray-500">{user?.email ?? 'No email'}</p>
            {user?.phone && <p className="text-xs text-gray-500">{user.phone}</p>}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className={`text-[10px] px-2 py-1 rounded-full border ${user?.isEmailVerified ? 'border-emerald-300 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-900/20'}`}>
                Email {user?.isEmailVerified ? 'Verified' : 'Pending'}
              </span>
              <span className={`text-[10px] px-2 py-1 rounded-full border ${user?.isPhoneVerified ? 'border-emerald-300 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-900/20'}`}>
                Phone {user?.isPhoneVerified ? 'Verified' : 'Pending'}
              </span>
              <span className={`text-[10px] px-2 py-1 rounded-full border ${user?.isAgeVerified ? 'border-emerald-300 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-900/20'}`}>
                Age {user?.isAgeVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>

          <button
            onClick={signOut}
            className="w-full py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <button
            onClick={handleDeleteAccount}
            disabled={deleting || !user?.isEmailVerified}
            className="w-full py-3 text-sm font-semibold text-red-500 border border-red-200 dark:border-red-900/40 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting Account…' : 'Delete Account'}
          </button>

          {!user?.isEmailVerified && (
            <button
              onClick={() => router.push('/auth/verify')}
              className="w-full py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-300/70 dark:border-amber-700/50 rounded-xl bg-amber-50/60 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition"
            >
              Verify Email First
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
