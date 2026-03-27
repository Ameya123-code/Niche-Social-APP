'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Calendar, Users, Star, Flag } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface EventDetail {
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
  discountPercent?: number;
  isPersonal: boolean;
  creator: { id: string; name: string; age: number };
  _count: { attendees: number; ratings: number };
  ratings: { rating: number; review?: string; userId: string; user: { name: string } }[];
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingDone, setRatingDone] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  useEffect(() => {
    if (!id) return;
    fetch(`/api/events/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((d) => { if (d.event) setEvent(d.event); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleAttend = async () => {
    if (!token) return;
    setAttending(true);
    try {
      const res = await fetch(`/api/events/${id}/attend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEvent((e) => e ? { ...e, _count: { ...e._count, attendees: e._count.attendees + 1 } } : e);
      }
    } catch { /* ignore */ }
    finally { setAttending(false); }
  };

  const submitRating = async () => {
    if (!token || ratingValue === 0) return;
    setSubmittingRating(true);
    try {
      await fetch('/api/ratings/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ eventId: id, rating: ratingValue, review }),
      });
      setRatingDone(true);
    } catch { /* ignore */ }
    finally { setSubmittingRating(false); }
  };

  const parseHashtags = (s: string) => { try { return JSON.parse(s) as string[]; } catch { return []; } };
  const avgRating = event?.ratings.length
    ? (event.ratings.reduce((s, r) => s + r.rating, 0) / event.ratings.length).toFixed(1)
    : null;

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin" /></div>;
  if (!event) return <div className="flex flex-col items-center justify-center h-screen gap-4"><p className="text-gray-500">Event not found</p><Link href="/map" className="text-red-500">← Back to Events</Link></div>;

  const tags = parseHashtags(event.hashtags);
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  return (
    <div className="w-full h-full bg-white dark:bg-black pb-8">
      {/* Cover + back */}
      <div className="relative">
        {event.coverImageUrl ? (
          <img src={event.coverImageUrl} alt={event.title} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-red-100 to-pink-200 dark:from-gray-800 dark:to-gray-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link href="/map" className="absolute top-12 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        {event.discountPercent ? (
          <span className="absolute top-12 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {event.discountPercent}% OFF
          </span>
        ) : null}
        <div className="absolute bottom-0 left-0 p-5">
          <span className="text-[10px] font-bold uppercase text-white/80 bg-white/20 px-2 py-0.5 rounded-full">{event.category}</span>
          <h1 className="text-2xl font-bold text-white mt-1">{event.title}</h1>
        </div>
      </div>

      <div className="px-5 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-3">
            <p className="text-[10px] text-gray-400 mb-0.5 uppercase font-semibold">Location</p>
            <p className="text-sm font-semibold text-black dark:text-white flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" />{event.city}</p>
            <p className="text-xs text-gray-500 truncate">{event.address}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-3">
            <p className="text-[10px] text-gray-400 mb-0.5 uppercase font-semibold">Date & Time</p>
            <p className="text-sm font-semibold text-black dark:text-white flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs text-gray-500">{start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-3">
            <p className="text-[10px] text-gray-400 mb-0.5 uppercase font-semibold">Attendees</p>
            <p className="text-sm font-semibold text-black dark:text-white flex items-center gap-1"><Users className="w-3.5 h-3.5 text-red-500" />{event._count.attendees}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-3">
            <p className="text-[10px] text-gray-400 mb-0.5 uppercase font-semibold">Rating</p>
            {avgRating ? (
              <p className="text-sm font-semibold text-black dark:text-white flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />{avgRating} ({event._count.ratings})
              </p>
            ) : <p className="text-xs text-gray-400">No ratings yet</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-bold text-black dark:text-white mb-2">About</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{event.description}</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map((t) => <span key={t} className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">#{t}</span>)}
            </div>
          )}
        </div>

        {/* Organizer */}
        <div>
          <h3 className="font-bold text-black dark:text-white mb-2">Organizer</h3>
          <Link href={`/profile/${event.creator.id}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-red-300 transition">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-pink-200 flex items-center justify-center">
              <span className="font-bold text-red-400">{event.creator.name[0]}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-black dark:text-white">{event.creator.name}</p>
              <p className="text-xs text-gray-400">View profile →</p>
            </div>
          </Link>
        </div>

        {/* Rate Event */}
        {!ratingDone ? (
          <div>
            <h3 className="font-bold text-black dark:text-white mb-2">Rate this event</h3>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRatingValue(s)} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition ${s <= ratingValue ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                  <Star className={`w-5 h-5 ${s <= ratingValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <input
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Leave a review (optional)"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
            />
            <button
              onClick={submitRating}
              disabled={ratingValue === 0 || submittingRating}
              className="w-full py-3 bg-gray-100 dark:bg-gray-900 text-black dark:text-white text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              {submittingRating ? 'Submitting…' : 'Submit Rating'}
            </button>
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-green-600 font-semibold">✓ Rating submitted</div>
        )}

        {/* Attend CTA */}
        <button
          onClick={handleAttend}
          disabled={attending}
          className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 disabled:opacity-50 transition shadow-lg shadow-red-200 dark:shadow-red-900/30 text-base"
        >
          {attending ? 'Joining…' : "I'm Going →"}
        </button>

        {/* Report */}
        <button className="w-full flex items-center justify-center gap-2 py-2 text-xs text-gray-400 hover:text-red-400 transition">
          <Flag className="w-3.5 h-3.5" />
          Report this event
        </button>
      </div>
    </div>
  );
}
