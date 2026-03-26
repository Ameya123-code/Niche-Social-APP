'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Hash, User, Calendar, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  opinions: {
    id: string;
    content: string;
    hashtags: string;
    createdAt: string;
    likes: number;
    user: { id: string; name: string; age: number; profileImageUrl?: string };
  }[];
  events: {
    id: string;
    title: string;
    description: string;
    category: string;
    city: string;
    startDate: string;
    hashtags: string;
  }[];
  hashtag: string;
}

const TRENDING = ['#techtalks', '#rooftopparty', '#indiemusic', '#foodies', '#yoga', '#artshow'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'opinions' | 'events'>('opinions');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 420);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) { setResults(null); return; }
    const q = debouncedQuery.replace(/^#/, '');
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    fetch(`/api/search?q=${encodeURIComponent(q)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => setResults(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const parseHashtags = (s: string) => { try { return JSON.parse(s) as string[]; } catch { return []; } };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-4">Search</h1>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hashtags, events, people…"
            className="w-full pl-9 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {!query ? (
          /* Trending */
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-black dark:text-white">Trending Now</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-400 hover:text-red-500 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center pt-10">
            <div className="w-8 h-8 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
          </div>
        ) : results ? (
          <div>
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-xl p-1 mb-4">
              {(['opinions', 'events'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition ${
                    activeTab === tab ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {tab} ({tab === 'opinions' ? results.opinions.length : results.events.length})
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'opinions' ? (
                <motion.div key="opinions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {results.opinions.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm pt-8">No opinions found for #{results.hashtag}</p>
                  ) : (
                    results.opinions.map((op) => {
                      const tags = parseHashtags(op.hashtags);
                      return (
                        <motion.div key={op.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                          <Link href={`/profile/${op.user.id}`} className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-100 to-pink-200 flex items-center justify-center flex-shrink-0">
                              {op.user.profileImageUrl ? (
                                <img src={op.user.profileImageUrl} alt={op.user.name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <span className="text-sm font-bold text-red-400">{op.user.name[0]}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-black dark:text-white">{op.user.name}, {op.user.age}</p>
                              <p className="text-[10px] text-gray-400">
                                {new Date(op.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </Link>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{op.content}</p>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tags.map((t) => (
                                <button key={t} onClick={() => setQuery('#' + t)}
                                  className="text-xs text-red-500 hover:text-red-600 transition">#{t}</button>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                            <User className="w-3 h-3" />
                            <span>{op.likes} likes</span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              ) : (
                <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {results.events.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm pt-8">No events found for #{results.hashtag}</p>
                  ) : (
                    results.events.map((ev) => {
                      const tags = parseHashtags(ev.hashtags);
                      return (
                        <Link key={ev.id} href={`/events/${ev.id}`}>
                          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:border-red-300 transition">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-[10px] font-bold uppercase text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                                {ev.category}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <h3 className="font-bold text-sm text-black dark:text-white mb-1">{ev.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2">{ev.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{ev.city}</p>
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {tags.map((t) => <span key={t} className="text-[10px] text-red-500">#{t}</span>)}
                              </div>
                            )}
                          </motion.div>
                        </Link>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </div>
  );
}
