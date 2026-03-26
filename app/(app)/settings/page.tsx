'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PREF_CATEGORIES = [
  { key: 'music', label: '🎵 Music', placeholder: 'e.g. indie, jazz, hip-hop' },
  { key: 'hobbies', label: '🎯 Hobbies', placeholder: 'e.g. hiking, reading, cooking' },
  { key: 'movies', label: '🎬 Movies', placeholder: 'e.g. sci-fi, comedy, thriller' },
  { key: 'books', label: '📚 Books', placeholder: 'e.g. fiction, history, self-help' },
  { key: 'popCulture', label: '🌐 Pop Culture', placeholder: 'e.g. Marvel, anime, Netflix' },
  { key: 'education', label: '🎓 Education', placeholder: 'e.g. CS, design, medicine' },
  { key: 'career', label: '💼 Career', placeholder: 'e.g. startup, tech, arts' },
] as const;

type PrefKey = typeof PREF_CATEGORIES[number]['key'];

interface Profile { name: string; birthDate: string; selfDescription: string; profileImageUrl: string; }
type Prefs = Record<PrefKey, string>;

const DEFAULT_PREFS: Prefs = { music: '', hobbies: '', movies: '', books: '', popCulture: '', education: '', career: '' };

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({ name: '', birthDate: '', selfDescription: '', profileImageUrl: '' });
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'account'>('profile');

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  useEffect(() => {
    if (!token) { router.push('/auth'); return; }
    Promise.all([
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/users/me/preferences', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([userData, prefData]) => {
        if (userData.user) {
          const u = userData.user;
          const birthDate = u.birthDate ? String(u.birthDate).slice(0, 10) : '';
          setProfile({ name: u.name ?? '', birthDate, selfDescription: u.selfDescription ?? '', profileImageUrl: u.profileImageUrl ?? '' });
        }
        if (prefData.preferences) {
          const p = prefData.preferences;
          const parse = (v: string) => { try { return (JSON.parse(v) as string[]).join(', '); } catch { return v ?? ''; } };
          setPrefs({
            music: parse(p.music), hobbies: parse(p.hobbies), movies: parse(p.movies),
            books: parse(p.books), popCulture: parse(p.popCulture), education: parse(p.education), career: parse(p.career),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router, token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    const toArray = (s: string) => JSON.stringify(s.split(',').map((x) => x.trim()).filter(Boolean));
    try {
      await Promise.all([
        fetch('/api/users/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: profile.name,
            birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString() : undefined,
            selfDescription: profile.selfDescription,
            profileImageUrl: profile.profileImageUrl,
          }),
        }),
        fetch('/api/users/me/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(
            Object.fromEntries(PREF_CATEGORIES.map(({ key }) => [key, toArray(prefs[key])]))
          ),
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin" /></div>;
  }

  const SECTIONS = ['profile', 'preferences', 'account'] as const;

  const uploadImage = async (file?: File) => {
    if (!file || !token) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads/image', { method: 'POST', body: fd, headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      setProfile((p) => ({ ...p, profileImageUrl: data.url }));
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3 border-b border-gray-100 dark:border-gray-900">
        <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition">
          <ChevronLeft className="w-5 h-5 text-black dark:text-white" />
        </Link>
        <h1 className="text-xl font-bold text-black dark:text-white flex-1">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 px-4 py-3 border-b border-gray-100 dark:border-gray-900">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl capitalize transition ${
              activeSection === s ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {activeSection === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Your Identity</p>
            {[
              { label: 'Name', key: 'name' as const, type: 'text', placeholder: 'Your name' },
              { label: 'Birthday', key: 'birthDate' as const, type: 'date', placeholder: '' },
              { label: 'Profile Image URL', key: 'profileImageUrl' as const, type: 'url', placeholder: 'https://…' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={profile[key]}
                  onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Upload Profile Image</label>
              <label className="w-full flex items-center justify-center px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-500 cursor-pointer hover:border-red-500 transition">
                {uploadingImage ? 'Uploading…' : 'Choose image file'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0])} />
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">About Me</label>
              <p className="text-[10px] text-gray-400 mb-1.5">This is private — used only by the algorithm to find better matches.</p>
              <textarea
                value={profile.selfDescription}
                onChange={(e) => setProfile((p) => ({ ...p, selfDescription: e.target.value }))}
                placeholder="Describe yourself for the algorithm…"
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
          </motion.div>
        )}

        {activeSection === 'preferences' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Algorithm Preferences</p>
            <p className="text-xs text-gray-400">Enter comma-separated values. These power your match score.</p>
            {PREF_CATEGORIES.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
                <input
                  type="text"
                  value={prefs[key]}
                  onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            ))}
          </motion.div>
        )}

        {activeSection === 'account' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Account</p>
            {[
              { label: 'Privacy Policy', href: '#' },
              { label: 'Terms of Service', href: '#' },
              { label: 'Report a Problem', href: '#' },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl text-sm text-black dark:text-white hover:border-gray-300 transition">
                {label}
                <span className="text-gray-400">→</span>
              </a>
            ))}
            <button
              onClick={() => {
                localStorage.removeItem('auth_token');
                document.cookie = 'auth_token=; path=/; max-age=0';
                window.location.href = '/';
              }}
              className="w-full py-3 text-sm font-semibold text-red-500 border border-red-200 dark:border-red-900/40 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Sign Out
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
