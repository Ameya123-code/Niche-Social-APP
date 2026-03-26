'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Star, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

interface CardUser {
  id: string;
  name: string;
  age: number;
  selfDescription: string;
  profileImageUrl?: string;
  preferences?: { music: string; hobbies: string; [k: string]: string };
  mutualInterests?: string[];
  compatibilityScore?: number;
  opinions?: { id: string; content: string; hashtags: string; createdAt: string }[];
}

export default function CardsPage() {
  const [cards, setCards] = useState<CardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [swiping, setSwiping] = useState<null | 'like' | 'pass'>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/cards', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards ?? []);
      }
    } catch {
      /* ignore – mock data fills the gap */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleAction = async (userId: string, action: 'like' | 'pass') => {
    setSwiping(action);
    const token = localStorage.getItem('auth_token');
    try {
      await fetch(`/api/cards/${userId}/${action}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch { /* ignore */ }
    setTimeout(() => {
      setCards((prev) => prev.slice(1));
      setSwiping(null);
      setExpanded(false);
    }, 320);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 text-sm">Finding people for you…</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-8 text-center">
        <Heart className="w-16 h-16 text-red-200" />
        <h2 className="text-2xl font-bold text-black dark:text-white">You're all caught up</h2>
        <p className="text-gray-500 text-sm">Check back later for new people near you.</p>
        <button
          onClick={fetchCards}
          className="mt-2 px-8 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition"
        >
          Refresh
        </button>
      </div>
    );
  }

  const card = cards[0];
  const parseList = (s?: string) => {
    try { return s ? JSON.parse(s) : []; } catch { return []; }
  };
  const hobbies: string[] = parseList(card.preferences?.hobbies);
  const music: string[] = parseList(card.preferences?.music);
  const interests = [...hobbies, ...music].slice(0, 6);
  const opinions = card.opinions ?? [];

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black select-none">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-black dark:text-white">Discover</h1>
        <p className="text-sm text-gray-500">{cards.length} {cards.length === 1 ? 'person' : 'people'} near you</p>
      </div>

      {/* Card */}
      <div className="flex-1 px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{
              opacity: 1, scale: 1, y: 0,
              x: swiping === 'like' ? 400 : swiping === 'pass' ? -400 : 0,
              rotate: swiping === 'like' ? 15 : swiping === 'pass' ? -15 : 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className="h-full bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col"
          >
            {/* Photo */}
            <div className="relative flex-shrink-0" style={{ height: expanded ? '40%' : '55%' }}>
              {card.profileImageUrl ? (
                <img src={card.profileImageUrl} alt={card.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-100 to-pink-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                  <span className="text-7xl font-bold text-red-300 dark:text-gray-600 select-none">
                    {card.name[0]}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <div className="flex items-end gap-3">
                  <div>
                    <h2 className="text-3xl font-bold leading-tight">{card.name}, {card.age}</h2>
                  </div>
                  {card.compatibilityScore !== undefined && (
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full mb-0.5">
                      <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                      <span className="text-xs font-bold">{card.compatibilityScore}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {card.selfDescription && (
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{card.selfDescription}</p>
              )}

              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((i) => (
                    <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
                      {i}
                    </span>
                  ))}
                </div>
              )}

              {opinions.length > 0 && (
                <div className="space-y-2">
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {opinions.length} opinion{opinions.length !== 1 ? 's' : ''}
                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        {opinions.slice(0, 3).map((op) => {
                          const tags = (() => { try { return JSON.parse(op.hashtags) as string[]; } catch { return []; } })();
                          return (
                            <div key={op.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                              <p className="text-xs text-gray-700 dark:text-gray-300">{op.content}</p>
                              {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {tags.map((t) => (
                                    <span key={t} className="text-[10px] text-red-500">#{t}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 pt-2 flex gap-3 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => handleAction(card.id, 'pass')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold hover:border-gray-400 transition"
              >
                <X className="w-5 h-5" />
                Pass
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => handleAction(card.id, 'like')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition shadow-lg shadow-red-200 dark:shadow-red-900/30"
              >
                <Heart className="w-5 h-5 fill-white" />
                Like
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
