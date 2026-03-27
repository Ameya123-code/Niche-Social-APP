'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, Heart, MessageCircle, Pencil, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Stores
import { useProfileStore, type GlobalProfile } from '@/store/profile';
import { useThemeStore } from '@/store/theme';
import { useUIStore } from '@/store/ui';

// Components
import { ThemeProvider } from '@/app/components/profile/ThemeProvider';
import { ProfileCard } from '@/app/components/profile/ProfileCard';
import { ProfileEditor } from '@/app/components/profile/ProfileEditor';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  name: string;
  age: number;
  email: string;
  profileImageUrl?: string;
  selfDescription?: string;
  isAgeVerified: boolean;
  opinions: { id: string; content: string; hashtags: string; createdAt: string; likes: number }[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();

  // Auth user data
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cardDesign, setCardDesign] = useState<Record<string, unknown> | undefined>(undefined);

  // Opinion form
  const [showOpinionForm, setShowOpinionForm] = useState(false);
  const [newOpinion, setNewOpinion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Stores
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const effectiveProfile = useProfileStore((s) => s.effectiveProfile);
  const isProfileLoaded = useProfileStore((s) => s.isLoaded);
  const setIsSaving = useProfileStore((s) => s.setIsSaving);
  const setTheme = useThemeStore((s) => s.setTheme);
  const openEditor = useUIStore((s) => s.openEditor);

  // ─── Load auth user ───────────────────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { router.push('/auth'); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (d.user) setAuthUser(d.user as AuthUser); })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, [router]);

  // ─── Load profile customization ──────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token || !authUser) return;

    fetch('/api/users/me/profile', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to load profile');
        return r.json();
      })
      .then((d) => {
        const p = d?.profile;
        const g = p?.global;
        loadProfile({
          userId: authUser.id,
          global: {
            avatar: g?.avatar ?? authUser.profileImageUrl ?? '',
            banner: g?.banner ?? '',
            avatarType: g?.avatarType ?? 'static',
            bannerType: g?.bannerType ?? 'gradient',
            theme: g?.theme ?? { primary: '#ef4444', accent: '#f97316' },
            bio: g?.bio ?? authUser.selfDescription ?? '',
            decorations: g?.decorations ?? [],
            badges: g?.badges ?? [],
            status: g?.status ?? 'online',
          },
          contexts: p?.contexts ?? {},
        });
        if (g?.theme?.primary && g?.theme?.accent) {
          setTheme({ primary: g.theme.primary, accent: g.theme.accent });
        }
      })
      .catch(() => {
        if (authUser) {
          loadProfile({
            userId: authUser.id,
            global: {
              avatar: authUser.profileImageUrl ?? '',
              banner: '',
              avatarType: 'static',
              bannerType: 'gradient',
              theme: { primary: '#ef4444', accent: '#f97316' },
              bio: authUser.selfDescription ?? '',
              decorations: [],
              badges: [],
              status: 'online',
            },
            contexts: {},
          });
        }
      });
  }, [authUser, loadProfile, setTheme]);

  const loadCardDesign = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const res = await fetch('/api/users/me/card-design', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) return;
      const d = await res.json() as { cardDesign?: Record<string, unknown> };
      if (d?.cardDesign) setCardDesign(d.cardDesign);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!authUser) return;
    loadCardDesign();
  }, [authUser, loadCardDesign]);

  useEffect(() => {
    const onUpdated = () => { loadCardDesign(); };
    window.addEventListener('card-design-updated', onUpdated);
    return () => window.removeEventListener('card-design-updated', onUpdated);
  }, [loadCardDesign]);

  // ─── Save handler ─────────────────────────────────────────────────────────

  const handleSave = useCallback(
    async (patch: { global?: Partial<GlobalProfile> }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      setIsSaving(true);
      try {
        const res = await fetch('/api/users/me/profile', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error('Failed to save profile');
      } catch { /* ignore */ }
      finally { setIsSaving(false); }
    },
    [setIsSaving]
  );

  // ─── Opinion submit ───────────────────────────────────────────────────────

  const submitOpinion = async () => {
    if (!newOpinion.trim()) return;
    const hashtags = (newOpinion.match(/#\w+/g) ?? []).map((h) => h.slice(1));
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/opinions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ content: newOpinion, hashtags }),
      });
      if (res.ok) {
        const d = await res.json() as { opinion: AuthUser['opinions'][number] };
        setAuthUser((prev) => prev ? { ...prev, opinions: [d.opinion, ...(prev.opinions ?? [])] } : prev);
        setNewOpinion('');
        setShowOpinionForm(false);
      }
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const parseHashtags = (s: string) => { try { return JSON.parse(s) as string[]; } catch { return [] as string[]; } };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; max-age=0';
    router.push('/');
  };

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--primary,#ef4444)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-8 text-center">
        <p className="text-gray-500">Failed to load profile</p>
        <button onClick={() => router.push('/auth')} className="px-6 py-3 bg-red-500 text-white rounded-full font-semibold">Sign In</button>
      </div>
    );
  }

  const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') ?? '') : '';
  const totalLikes = (authUser.opinions ?? []).reduce((s, o) => s + o.likes, 0);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <ThemeProvider primary={effectiveProfile.theme.primary} accent={effectiveProfile.theme.accent}>
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">

        {/* Top bar */}
        <div className="px-5 pt-12 pb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-white">Profile</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditor('avatar')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-white"
              style={{ background: `linear-gradient(135deg, var(--primary), var(--accent))` }}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Profile
            </button>
            <Link href="/settings" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition">
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="px-5 mb-5 flex justify-center">
          {isProfileLoaded ? (
            <ProfileCard
              avatarUrl={effectiveProfile.avatar || authUser.profileImageUrl || ''}
              name={authUser.name}
              title={authUser.selfDescription || ''}
              handle={authUser.email.split('@')[0]}
              status={
                effectiveProfile.status === 'dnd' ? 'Do Not Disturb' :
                effectiveProfile.status === 'idle' ? 'Away' :
                effectiveProfile.status === 'offline' ? 'Offline' : 'Online'
              }
              enableTilt={true}
              enableMobileTilt={false}
              showUserInfo={true}
              contactText="Message"
              behindGlowEnabled={true}
              behindGlowColor={`${effectiveProfile.theme.primary}aa`}
              innerGradient={`linear-gradient(145deg, ${effectiveProfile.theme.primary}55 0%, ${effectiveProfile.theme.accent}33 100%)`}
              opinionCount={authUser.opinions?.length ?? 0}
              likeCount={totalLikes}
              onContactClick={() => {}}
            />
          ) : (
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
              <div className="h-28 bg-gray-100 dark:bg-gray-800" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-3 w-60 bg-gray-100 dark:bg-gray-800 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Opinions */}
        <div className="flex-1 px-5 pb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-black dark:text-white">Your Opinions</h3>
            <button
              onClick={() => setShowOpinionForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-full text-xs font-semibold"
              style={{ background: `linear-gradient(135deg, var(--primary), var(--accent))` }}
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
                    placeholder="Share your opinion… Use #hashtags to tag it"
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
                        className="text-xs font-semibold text-white px-4 py-1.5 rounded-full disabled:opacity-50"
                        style={{ background: 'var(--primary)' }}
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
            {(authUser.opinions ?? []).length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No opinions yet. Add your first one!</p>
              </div>
            ) : (
              (authUser.opinions ?? []).map((op) => {
                const tags = parseHashtags(op.hashtags);
                return (
                  <motion.div key={op.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{op.content}</p>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tags.map((t) => (
                          <span key={t} className="text-xs" style={{ color: 'var(--primary)' }}>#{t}</span>
                        ))}
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

        {/* Profile Editor (full-screen side panel, portal-rendered) */}
        <ProfileEditor name={authUser.name} token={token} onSave={handleSave} />
      </div>
    </ThemeProvider>  );
}