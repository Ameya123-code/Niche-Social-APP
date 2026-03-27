'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, Heart, MessageCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  name: string;
  age: number;
  email: string;
  profileImageUrl?: string;
  selfDescription?: string;
  isAgeVerified: boolean;
  opinions: { id: string; content: string; hashtags: string; createdAt: string; likes: number }[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOpinionForm, setShowOpinionForm] = useState(false);
  const [newOpinion, setNewOpinion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { router.push('/auth'); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setProfile(d.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; max-age=0';
    router.push('/');
  };

  const submitOpinion = async () => {
    if (!newOpinion.trim()) return;
    const hashtags = (newOpinion.match(/#\w+/g) || []).map((h) => h.slice(1));
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/opinions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ content: newOpinion, hashtags }),
      });
      if (res.ok) {
        const d = await res.json();
        setProfile((prev) => prev ? { ...prev, opinions: [d.opinion, ...(prev.opinions ?? [])] } : prev);
        setNewOpinion('');
        setShowOpinionForm(false);
      }
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const parseHashtags = (s: string) => { try { return JSON.parse(s) as string[]; } catch { return []; } };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin" /></div>;
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-8 text-center">
        <p className="text-gray-500">Failed to load profile</p>
        <button onClick={() => router.push('/auth')} className="px-6 py-3 bg-red-500 text-white rounded-full font-semibold">Sign In</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Profile</h1>
        <div className="flex items-center gap-2">
          <Link href="/settings" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition">
            <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-5 mb-5">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-950 rounded-3xl p-5 border border-red-100 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-200 to-pink-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-red-400 dark:text-gray-400">{profile.name[0]}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-black dark:text-white">{profile.name}, {profile.age}</h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
              {profile.isAgeVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full mt-1">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
          {profile.selfDescription && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">&ldquo;{profile.selfDescription}&rdquo;</p>
          )}
          <Link href="/settings" className="mt-3 block text-center text-xs font-semibold text-red-500 hover:text-red-600 transition">
            Edit Profile →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-5 mb-5">
        {[
          { label: 'Opinions', value: profile.opinions?.length ?? 0 },
          { label: 'Likes', value: profile.opinions?.reduce((s, o) => s + o.likes, 0) ?? 0 },
          { label: 'Status', value: profile.isAgeVerified ? '18+' : 'Unverified' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-black dark:text-white">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Opinions */}
      <div className="flex-1 px-5 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-black dark:text-white">Your Opinions</h3>
          <button
            onClick={() => setShowOpinionForm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-semibold hover:bg-red-600 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        <AnimatePresence>
          {showOpinionForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                <textarea
                  value={newOpinion}
                  onChange={(e) => setNewOpinion(e.target.value)}
                  placeholder="Share your opinion on any topic… Use #hashtags to tag it"
                  rows={3}
                  className="w-full bg-transparent text-sm text-black dark:text-white placeholder-gray-400 resize-none focus:outline-none"
                />
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-400">{newOpinion.length}/500</span>
                  <div className="flex gap-2">
                    <button onClick={() => setShowOpinionForm(false)} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">Cancel</button>
                    <button
                      onClick={submitOpinion}
                      disabled={submitting || !newOpinion.trim()}
                      className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 px-4 py-1.5 rounded-full transition"
                    >
                      {submitting ? 'Posting…' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {(profile.opinions ?? []).length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No opinions yet. Add your first one!</p>
            </div>
          ) : (
            (profile.opinions ?? []).map((op) => {
              const tags = parseHashtags(op.hashtags);
              return (
                <motion.div key={op.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{op.content}</p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.map((t) => <span key={t} className="text-xs text-red-500">#{t}</span>)}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{op.likes}</span>
                    <span>{new Date(op.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
