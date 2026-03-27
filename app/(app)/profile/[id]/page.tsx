'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, Flag, MessageCircle, Heart } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface PublicProfile {
  id: string;
  name: string;
  age: number;
  profileImageUrl?: string;
  opinions: { id: string; content: string; hashtags: string; createdAt: string; likes: number }[];
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [behaviorRating, setBehaviorRating] = useState(0);
  const [behaviorText, setBehaviorText] = useState('');
  const [reportText, setReportText] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [actionDone, setActionDone] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  useEffect(() => {
    if (!id) return;
    fetch(`/api/users/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((d) => { if (d.user) setProfile(d.user); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, token]);

  const submitBehaviorRating = async () => {
    if (!token || behaviorRating === 0 || !behaviorText.trim()) return;
    await fetch('/api/ratings/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ratedUserId: id, rating: behaviorRating, behavior: behaviorText }),
    }).catch(() => {});
    setActionDone('rating');
  };

  const submitReport = async () => {
    if (!token || !reportText.trim()) return;
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reportedUserId: id, reason: 'inappropriate', description: reportText, severity: 'medium' }),
    }).catch(() => {});
    setActionDone('report');
    setShowReport(false);
  };

  const parseHashtags = (s: string) => { try { return JSON.parse(s) as string[]; } catch { return []; } };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin" /></div>;
  if (!profile) return <div className="flex flex-col items-center justify-center h-screen gap-4"><p className="text-gray-500">User not found</p><Link href="/cards" className="text-red-500">← Back</Link></div>;

  return (
    <div className="w-full h-full bg-white dark:bg-black pb-10">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-br from-red-100 to-pink-200 dark:from-gray-800 dark:to-gray-700">
        <Link href="/cards" className="absolute top-12 left-4 w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-3xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-950 shadow-xl flex items-center justify-center overflow-hidden">
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-red-300">{profile.name[0]}</span>
          )}
        </div>
      </div>

      <div className="px-5 sm:px-6 lg:px-8 pt-16 pb-5 text-center">
        <h1 className="text-2xl font-bold text-black dark:text-white">{profile.name}, {profile.age}</h1>
        <p className="text-sm text-gray-500 mt-1">{(profile.opinions ?? []).length} opinions shared</p>
      </div>

      {/* Opinions */}
      <div className="px-5 sm:px-6 lg:px-8 space-y-3 mb-6">
        <h2 className="font-bold text-black dark:text-white">Opinions</h2>
        {(profile.opinions ?? []).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No opinions yet</p>
          </div>
        ) : (
          (profile.opinions ?? []).map((op) => {
            const tags = parseHashtags(op.hashtags);
            return (
              <div key={op.id} className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
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
              </div>
            );
          })
        )}
      </div>

      {/* Rate Behavior */}
      <div className="px-5 sm:px-6 lg:px-8 mb-5">
        <h2 className="font-bold text-black dark:text-white mb-3">Rate Behavior</h2>
        {actionDone === 'rating' ? (
          <p className="text-center text-green-600 text-sm font-semibold py-2">✓ Rating submitted</p>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-3">
            <p className="text-xs text-gray-500">Rate this person&apos;s behavior in the community</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setBehaviorRating(s)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${s <= behaviorRating ? 'bg-yellow-400 text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-500'}`}>
                  {s}★
                </button>
              ))}
            </div>
            <input
              value={behaviorText}
              onChange={(e) => setBehaviorText(e.target.value)}
              placeholder="Describe their behavior…"
              className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={submitBehaviorRating}
              disabled={behaviorRating === 0 || !behaviorText.trim()}
              className="w-full py-2.5 bg-gray-800 dark:bg-white text-white dark:text-black text-sm font-semibold rounded-xl disabled:opacity-40 transition"
            >
              Submit Rating
            </button>
          </div>
        )}
      </div>

      {/* Report */}
      <div className="px-5">
        {actionDone === 'report' ? (
          <p className="text-center text-red-500 text-sm font-semibold py-2">Report submitted</p>
        ) : !showReport ? (
          <button onClick={() => setShowReport(true)} className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 dark:border-red-900/40 text-red-500 text-sm rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition">
            <Flag className="w-4 h-4" />
            Report this user
          </button>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-red-600">Report User</p>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe the issue…"
              rows={3}
              className="w-full bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowReport(false)} className="flex-1 py-2 text-sm text-gray-500 hover:text-gray-700 transition">Cancel</button>
              <button onClick={submitReport} disabled={!reportText.trim()} className="flex-1 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl disabled:opacity-40 transition">Submit Report</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
