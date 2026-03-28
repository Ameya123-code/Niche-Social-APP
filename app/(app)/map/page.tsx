'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Search, Music, Utensils, Dumbbell, Palette, Plus, X, ChevronRight, ArrowUpDown, Flame } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: MapPin },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'art', label: 'Art', icon: Palette },
];

interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  address: string;
  city: string;
  startDate: string;
  endDate: string;
  coverImageUrl?: string;
  maxAttendees?: number;
  hashtags: string;
  _count?: { attendees: number; ratings: number };
}

export default function MapPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'soonest' | 'popular' | 'newest'>('soonest');
  const [selected, setSelected] = useState<EventItem | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const params = new URLSearchParams();
        if (category !== 'all') params.set('category', category);
        if (search) params.set('q', search);
        const res = await fetch(`/api/events?${params}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events ?? []);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, [category, search]);

  const parseHashtags = (s: string) => { try { return JSON.parse(s) as string[]; } catch { return []; } };

  const filtered = events.filter((e) => {
    if (category !== 'all' && e.category !== category) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'popular') return (b._count?.attendees ?? 0) - (a._count?.attendees ?? 0);
    if (sortBy === 'newest') return +new Date(b.startDate) - +new Date(a.startDate);
    return +new Date(a.startDate) - +new Date(b.startDate);
  });

  const todayCount = filtered.filter((e) => {
    const d = new Date(e.startDate);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-black">
      {/* Header */}
      <div className="px-5 sm:px-6 lg:px-8 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">Events</h1>
            <p className="text-sm text-gray-500">{filtered.length} happening near you</p>
          </div>
          <Link
            href="/events/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition shadow-lg shadow-red-200 dark:shadow-red-900/30"
          >
            <Plus className="w-4 h-4" />
            Create
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-2.5 bg-white dark:bg-zinc-950">
            <p className="text-[10px] uppercase tracking-wide text-gray-500">Today</p>
            <p className="text-sm font-semibold text-black dark:text-white">{todayCount} events</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-2.5 bg-white dark:bg-zinc-950">
            <p className="text-[10px] uppercase tracking-wide text-gray-500">Trending</p>
            <p className="text-sm font-semibold text-black dark:text-white inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" /> Popular now</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events or cities…"
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                category === id
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-gray-500"><ArrowUpDown className="w-3 h-3" /> Sort</span>
          {([
            { id: 'soonest', label: 'Soonest' },
            { id: 'popular', label: 'Popular' },
            { id: 'newest', label: 'Newest' },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`px-2.5 py-1 rounded-full border transition ${sortBy === opt.id ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-6 lg:px-8 pb-4 space-y-3">
        {loading ? (
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 animate-pulse bg-gray-50 dark:bg-zinc-900/40">
                <div className="w-full h-28 rounded-xl bg-gray-200 dark:bg-zinc-800 mb-3" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-zinc-800 rounded mb-2" />
                <div className="h-3 w-full bg-gray-200 dark:bg-zinc-800 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center pt-16">
            <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No events found</p>
          </div>
        ) : (
          filtered.map((event) => {
            const tags = parseHashtags(event.hashtags);
            const start = new Date(event.startDate);
            return (
              <motion.button
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, scale: 1.004 }}
                onClick={() => setSelected(event)}
                className="w-full text-left bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:border-red-300 dark:hover:border-red-800 transition"
              >
                {event.coverImageUrl && (
                  <img src={event.coverImageUrl} alt={event.title} className="w-full h-32 object-cover rounded-xl mb-3" />
                )}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                        {event.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-black dark:text-white text-sm leading-snug line-clamp-1">{event.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{event.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.city}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  {event._count && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event._count.attendees}</span>}
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] text-red-500">#{t}</span>
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })
        )}
      </div>

      {/* Event Detail Sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-950 rounded-t-3xl z-50 p-6 pb-10 max-h-[80vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />
              {selected.coverImageUrl && (
                <img src={selected.coverImageUrl} alt={selected.title} className="w-full h-40 object-cover rounded-2xl mb-4" />
              )}
              <span className="text-xs font-bold uppercase tracking-wide text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                {selected.category}
              </span>
              <h2 className="text-xl font-bold text-black dark:text-white mt-2 mb-1">{selected.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selected.description}</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Location</p>
                  <p className="text-sm font-semibold text-black dark:text-white">{selected.city}</p>
                  <p className="text-xs text-gray-500 truncate">{selected.address}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Date</p>
                  <p className="text-sm font-semibold text-black dark:text-white">
                    {new Date(selected.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <Link
                href={`/events/${selected.id}`}
                className="block w-full py-3.5 bg-red-500 text-white rounded-2xl text-center font-semibold hover:bg-red-600 transition shadow-lg shadow-red-200 dark:shadow-red-900/30"
              >
                View Full Event
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
