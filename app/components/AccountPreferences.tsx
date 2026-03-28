'use client';

import React, { useState, useEffect, useCallback } from 'react';

const PREF_CATEGORIES = [
  { key: 'music', label: 'Music' },
  { key: 'hobbies', label: 'Hobbies' },
  { key: 'movies', label: 'Movies & TV' },
  { key: 'books', label: 'Books' },
  { key: 'popCulture', label: 'Pop Culture' },
  { key: 'education', label: 'Education' },
  { key: 'career', label: 'Career' },
] as const;

type PrefKey = (typeof PREF_CATEGORIES)[number]['key'];
type Preferences = Record<PrefKey, string[]>;

type ProfileData = {
  name: string;
  selfDescription: string;
  city: string;
  country: string;
  ageMin: number;
  ageMax: number;
  latitude: number | null;
  longitude: number | null;
};

export default function AccountPreferences() {
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    selfDescription: '',
    city: '',
    country: '',
    ageMin: 18,
    ageMax: 35,
    latitude: null,
    longitude: null,
  });

  const [prefInputs, setPrefInputs] = useState<Record<PrefKey, string>>({
    music: '',
    hobbies: '',
    movies: '',
    books: '',
    popCulture: '',
    education: '',
    career: '',
  });

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');

  // Load existing data
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    Promise.all([
      fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/users/me/preferences', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([userData, prefsData]) => {
      const u = userData?.user;
      if (u) {
        setProfile({
          name: u.name ?? '',
          selfDescription: u.selfDescription ?? '',
          city: u.city ?? '',
          country: u.country ?? '',
          ageMin: u.ageMin ?? 18,
          ageMax: u.ageMax ?? 35,
          latitude: u.latitude ?? null,
          longitude: u.longitude ?? null,
        });
      }
      const p = prefsData?.preferences;
      if (p) {
        const inputs: Partial<Record<PrefKey, string>> = {};
        for (const { key } of PREF_CATEGORIES) {
          try {
            const arr: string[] = JSON.parse(p[key] ?? '[]');
            inputs[key] = arr.join(', ');
          } catch {
            inputs[key] = '';
          }
        }
        setPrefInputs(inputs as Record<PrefKey, string>);
      }
    });
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const geo = await resp.json();
          const city = geo?.address?.city ?? geo?.address?.town ?? geo?.address?.village ?? '';
          const country = geo?.address?.country ?? '';
          setProfile((p) => ({ ...p, latitude, longitude, city, country }));
        } catch {
          setProfile((p) => ({ ...p, latitude, longitude }));
        }
        setLocating(false);
      },
      (err) => {
        setLocError(`Location error: ${err.message}`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, []);

  const parseTagInput = (val: string): string[] =>
    val.split(',').map((s) => s.trim()).filter(Boolean);

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg('');
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const prefsPayload: Record<string, string[]> = {};
      for (const { key } of PREF_CATEGORIES) prefsPayload[key] = parseTagInput(prefInputs[key]);

      await Promise.all([
        fetch('/api/users/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: profile.name,
            selfDescription: profile.selfDescription,
            latitude: profile.latitude,
            longitude: profile.longitude,
            city: profile.city,
            country: profile.country,
            ageMin: profile.ageMin,
            ageMax: profile.ageMax,
          }),
        }),
        fetch('/api/users/me/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(prefsPayload),
        }),
      ]);
      setSavedMsg('Saved!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch {
      setSavedMsg('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Preferences</h1>

        {/* Profile Info */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Profile Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              About You{' '}
              <span className="text-xs text-gray-400">(used by the matching algorithm, hidden from others)</span>
            </label>
            <textarea
              value={profile.selfDescription}
              onChange={(e) => setProfile((p) => ({ ...p, selfDescription: e.target.value }))}
              placeholder="Describe your personality, values, what you're looking for..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-400 outline-none resize-none"
            />
          </div>
        </section>

        {/* Location */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Location</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Used for nearby matching and event suggestions. Your exact coordinates are never shown publicly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                placeholder="e.g. Mumbai"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Country</label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}
                placeholder="e.g. India"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>
          </div>
          {profile.latitude && (
            <p className="text-xs text-green-600 dark:text-green-400">
              📍 Detected: {profile.latitude.toFixed(4)}, {profile.longitude?.toFixed(4)}
            </p>
          )}
          {locError && <p className="text-xs text-red-500">{locError}</p>}
          <button
            onClick={detectLocation}
            disabled={locating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 text-sm font-medium hover:bg-rose-100 dark:hover:bg-rose-900/50 disabled:opacity-50 transition"
          >
            {locating ? '📡 Detecting...' : '📍 Auto-detect my location'}
          </button>
        </section>

        {/* Age Preference */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Matching Age Range</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Only users whose age falls within your range (and whose range includes yours) will be shown as matches.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Min Age</label>
              <input
                type="number"
                min={18}
                max={profile.ageMax - 1}
                value={profile.ageMin}
                onChange={(e) => setProfile((p) => ({ ...p, ageMin: parseInt(e.target.value, 10) }))}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>
            <span className="text-gray-400 mt-5">–</span>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Max Age</label>
              <input
                type="number"
                min={profile.ageMin + 1}
                max={99}
                value={profile.ageMax}
                onChange={(e) => setProfile((p) => ({ ...p, ageMax: parseInt(e.target.value, 10) }))}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            ⚠️ All users must be 18+. Event suggestions only unlock for 18+ verified users at chat level 40.
          </p>
        </section>

        {/* Interest Preferences */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 space-y-5">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Your Interests</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add comma-separated tags. The more specific, the better your matches.
          </p>
          {PREF_CATEGORIES.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
              <input
                type="text"
                value={prefInputs[key]}
                onChange={(e) => setPrefInputs((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={`Your ${label.toLowerCase()}, comma separated`}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-400 outline-none"
              />
              {prefInputs[key] && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {parseTagInput(prefInputs[key]).map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Save */}
        <div className="flex items-center justify-between pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl shadow-md disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
          {savedMsg && (
            <span className={`text-sm font-medium ${savedMsg === 'Saved!' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {savedMsg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
