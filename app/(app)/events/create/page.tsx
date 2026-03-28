'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock3, MapPin, Tag, Users, Sparkles, Image as ImageIcon, X, LocateFixed, Percent, Lock } from 'lucide-react';

const CATEGORIES = ['Music', 'Food', 'Fitness', 'Art', 'Tech', 'Sports', 'Social', 'Other'];
const DURATION_PRESETS = [60, 120, 180, 240];

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    date: '',
    endDate: '',
    category: '',
    maxAttendees: '',
    isPersonal: false,
    discountPercent: 0,
    coverImageUrl: '',
    latitude: '',
    longitude: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setDuration = (minutes: number) => {
    if (!form.date) return;
    const start = new Date(form.date);
    const end = new Date(start.getTime() + minutes * 60_000);
    const yyyy = end.getFullYear();
    const mm = String(end.getMonth() + 1).padStart(2, '0');
    const dd = String(end.getDate()).padStart(2, '0');
    const hh = String(end.getHours()).padStart(2, '0');
    const min = String(end.getMinutes()).padStart(2, '0');
    setForm((prev) => ({ ...prev, endDate: `${yyyy}-${mm}-${dd}T${hh}:${min}` }));
  };

  const addTag = () => {
    const next = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (!next) return;
    setTags((prev) => [...new Set([...prev, next])].slice(0, 20));
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const uploadCover = async (file: File) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) throw new Error(data?.error || 'Failed to upload cover image');
      setForm((prev) => ({ ...prev, coverImageUrl: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const useCurrentLocation = async () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    try {
      const coords = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
      });

      const lat = coords.coords.latitude;
      const lon = coords.coords.longitude;

      setForm((prev) => ({
        ...prev,
        latitude: String(lat),
        longitude: String(lon),
      }));
    } catch {
      setError('Could not fetch your location');
    } finally {
      setLocating(false);
    }
  };

  const canSubmit = useMemo(
    () => Boolean(form.title && form.location && form.date && form.category),
    [form.title, form.location, form.date, form.category]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          location: form.location,
          city: form.city,
          date: form.date,
          endDate: form.endDate || undefined,
          category: form.category,
          maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : null,
          hashtags: tags,
          isPersonal: form.isPersonal,
          discountPercent: Number(form.discountPercent) || 0,
          coverImageUrl: form.coverImageUrl || undefined,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create event');
      router.push(`/events/${data.event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-white to-rose-50/40 dark:from-black dark:to-zinc-950">
      {/* Header */}
      <div className="bg-white/90 dark:bg-black/50 backdrop-blur border-b border-gray-100 dark:border-gray-900 px-5 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Event</h1>
          <p className="text-xs text-gray-500">Build richer events with tags, cover, capacity and timing.</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-5 pb-20"
        >
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-zinc-950/70 p-3">
            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Event Cover</p>
            {form.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.coverImageUrl} alt="cover preview" className="w-full h-40 object-cover rounded-xl mb-2" />
            ) : (
              <div className="w-full h-40 rounded-xl bg-gradient-to-br from-rose-100 to-fuchsia-100 dark:from-zinc-800 dark:to-zinc-900 mb-2" />
            )}
            <label className="block">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadCover(file);
                  e.currentTarget.value = '';
                }}
              />
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-rose-400 transition">
                {uploadingCover ? 'Uploading…' : 'Upload cover image'}
              </span>
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Event Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Give your event a great name"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-zinc-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Tell people what to expect..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-zinc-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Location *</span>
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="Address or venue name"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-zinc-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City (optional)"
                className="flex-1 min-w-[180px] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white bg-white dark:bg-zinc-900"
              />
              <button
                type="button"
                onClick={() => void useCurrentLocation()}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                {locating ? 'Locating…' : 'Use current location'}
              </button>
            </div>
          </div>

          {/* Date + duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date & Time *</span>
            </label>
            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
                <span className="flex items-center gap-1.5"><Clock3 className="w-4 h-4" /> End Time</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          {form.date ? (
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setDuration(minutes)}
                  className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs"
                >
                  +{minutes / 60}h
                </button>
              ))}
            </div>
          ) : null}

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
              <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" /> Category *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const value = cat.toLowerCase();
                const active = form.category === value;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, category: value }))}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition ${active ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max attendees */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Max Attendees (optional)</span>
            </label>
            <input
              type="number"
              name="maxAttendees"
              value={form.maxAttendees}
              onChange={handleChange}
              min="1"
              placeholder="Leave blank for unlimited"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-zinc-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Hashtags</span>
            </label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add hashtag"
                className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-900"
              />
              <button type="button" onClick={addTag} className="px-4 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black text-sm font-semibold">Add</button>
            </div>
            {tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-50 dark:bg-red-900/20 text-red-600">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Extra controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-3">
              <p className="text-xs font-semibold text-gray-500 mb-2 inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Event visibility</p>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, isPersonal: !prev.isPersonal }))}
                className={`w-full py-2 rounded-xl text-xs font-semibold border transition ${form.isPersonal ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                {form.isPersonal ? 'Personal / invite-style' : 'Public event'}
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-3">
              <p className="text-xs font-semibold text-gray-500 mb-2 inline-flex items-center gap-1.5"><Percent className="w-3.5 h-3.5" /> Discount ({form.discountPercent}%)</p>
              <input
                type="range"
                min={0}
                max={70}
                step={5}
                value={form.discountPercent}
                onChange={(e) => setForm((prev) => ({ ...prev, discountPercent: Number(e.target.value) }))}
                className="w-full accent-red-500"
              />
            </div>
          </div>

          {/* Hidden coordinate fields for backend functionality */}
          <div className="hidden">
            <input
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
            />
            <input name="longitude" value={form.longitude} onChange={handleChange} />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
