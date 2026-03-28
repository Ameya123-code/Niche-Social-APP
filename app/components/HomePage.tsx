'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Heart, MapPin, Users, Sparkles, ShieldCheck, Camera, Wand2, Star, Flame, MessageCircleHeart, Briefcase, Leaf, Rainbow, Layers3, ArrowUpRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import Silk from '@/components/Silk';

/* ─── Framer Motion variants (used on a few static reveals only) ─── */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.28, delayChildren: 0.1 },
  },
};
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};

export default function HomePage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const howItWorksRef = useRef<HTMLElement | null>(null);
  const progressLineRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<HTMLDivElement[]>([]);
  const navLinksRef = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const [typedBrand, setTypedBrand] = useState('');
  const [typedVibe, setTypedVibe] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const inspirationRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, -70]);
  const orbY = useTransform(scrollYProgress, [0, 0.35], [0, 90]);
  const { scrollYProgress: howProgressRaw } = useScroll({
    target: howItWorksRef,
    offset: ['start 90%', 'end 10%'],
  });
  const howProgress = useSpring(howProgressRaw, { stiffness: 120, damping: 28, mass: 0.32 });
  const howDotY = useTransform(howProgress, [0, 1], ['2%', '98%']);
  const { scrollYProgress: inspirationProgress } = useScroll({
    target: inspirationRef,
    offset: ['start end', 'end start'],
  });
  const leftCardY = useTransform(inspirationProgress, [0, 0.5, 1], [44, 0, -40]);
  const rightCardY = useTransform(inspirationProgress, [0, 0.5, 1], [-36, 0, 36]);
  const leftCardRotate = useTransform(inspirationProgress, [0, 0.5, 1], [-8, 0, 8]);
  const rightCardRotate = useTransform(inspirationProgress, [0, 0.5, 1], [8, 0, -8]);

  const inspirations = [
    { name: 'Verified Profiles', tone: 'Trust-first', icon: ShieldCheck },
    { name: 'Smart Matching', tone: 'Compatibility', icon: Sparkles },
    { name: 'Nearby Discovery', tone: 'Location-first', icon: MapPin },
    { name: 'Event Momentum', tone: 'Offline-ready', icon: Flame },
    { name: 'Inclusive Spaces', tone: 'Community', icon: Rainbow },
    { name: 'Creative Identity', tone: 'Expressive', icon: Camera },
    { name: 'Interest Layers', tone: 'Deep profiles', icon: Layers3 },
    { name: 'Realtime Signals', tone: 'Live data', icon: Zap },
    { name: 'Curated Quality', tone: 'Less noise', icon: Star },
    { name: 'Flexible Intent', tone: 'Serious to social', icon: Heart },
    { name: 'Open Discovery', tone: 'Exploration', icon: Wand2 },
    { name: 'Social Proof', tone: 'Reputation', icon: Users },
    { name: 'Lifestyle Filters', tone: 'Niche fit', icon: Leaf },
    { name: 'Growth Loop', tone: 'Invite + engage', icon: Briefcase },
  ];

  const scrollToSection = (id: 'hero' | 'how' | 'features' | 'why') => {
    const section = document.getElementById(id) ?? document.querySelector<HTMLElement>(`[data-section-id="${id}"]`);
    if (!section) return;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };



  useEffect(() => {
    const fullText = 'Niche';
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTypedBrand(fullText.slice(0, index));
      if (index >= fullText.length) clearInterval(timer);
    }, 220);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setIsDarkTheme(root.classList.contains('dark'));

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Homepage render-first mode: keep animations lightweight and avoid
  // scroll-trigger dependencies that can hide content on some clients.

  useEffect(() => {
    const words = ['chemistry', 'energy', 'humor', 'intent', 'vibe'];
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let pauseTicks = 0;

    const tick = setInterval(() => {
      if (pauseTicks > 0) {
        pauseTicks -= 1;
        return;
      }

      const word = words[wordIndex];

      if (!deleting) {
        charIndex += 1;
        setTypedVibe(word.slice(0, charIndex));
        if (charIndex >= word.length) {
          pauseTicks = 6;
          deleting = true;
        }
      } else {
        charIndex -= 1;
        setTypedVibe(word.slice(0, charIndex));
        if (charIndex <= 0) {
          pauseTicks = 2;
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }
    }, 190);

    return () => clearInterval(tick);
  }, []);

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-x-hidden bg-transparent">
      <div className="fixed inset-0 z-0" aria-hidden style={{ pointerEvents: 'none' }}>
        <div className="absolute inset-0 opacity-68 dark:opacity-45" style={{ pointerEvents: 'none' }}>
          <Silk
            speed={3.4}
            scale={0.95}
            color={isDarkTheme ? '#7c3aed' : '#1e3a8a'}
            noiseIntensity={1.1}
            rotation={0.12}
          />
        </div>
        <motion.div
          className="absolute inset-0 niche-animated-gradient bg-[linear-gradient(120deg,rgba(62,45,78,0.9),rgba(86,50,86,0.86),rgba(72,46,84,0.84),rgba(52,40,68,0.9))] dark:bg-[linear-gradient(120deg,rgba(8,8,12,0.95),rgba(34,8,28,0.85),rgba(16,8,26,0.86),rgba(6,6,10,0.95))]"
          animate={{ scale: [1, 1.04, 1], opacity: [0.92, 1, 0.92] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{ pointerEvents: 'none' }}
        />
      </div>
      <div className="relative z-10">
      <motion.div
        className="pointer-events-none fixed top-0 left-0 right-0 h-1.5 z-[70] bg-gradient-to-r from-red-500 via-pink-500 to-fuchsia-500 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Navigation */}
      <nav className="pointer-events-auto fixed top-0 w-full z-[90] border-b border-white/15 dark:border-white/10 bg-[linear-gradient(120deg,rgba(53,38,74,0.72),rgba(72,40,86,0.66),rgba(42,32,64,0.72))] dark:bg-[linear-gradient(120deg,rgba(10,10,16,0.78),rgba(26,10,30,0.72),rgba(10,10,16,0.78))] backdrop-blur-xl animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div 
            className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            {typedBrand}
            <span className="animate-pulse">|</span>
          </motion.div>
          <div className="hidden md:flex items-center gap-6 mr-4">
            {(['how', 'features', 'why'] as const).map((id, i) => (
              <motion.button
                key={id}
                type="button"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.08, duration: 0.35 }}
                whileHover={{ y: -1 }}
                onClick={() => {
                  scrollToSection(id);
                }}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors capitalize"
              >
                {id === 'how' ? 'How it works' : id === 'features' ? 'Features' : 'Why Niche'}
              </motion.button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth')}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth')}
              className="px-6 py-2 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition"
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" data-scroll-section="true" data-section-id="hero" className="relative scroll-mt-28 overflow-hidden pt-32 pb-20 px-4 bg-transparent">
        <motion.div style={{ y: orbY }} data-gsap="v-parallax" className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-rose-300/20 blur-3xl" />
        <motion.div style={{ y: heroY }} data-gsap="v-parallax" className="absolute top-24 -right-20 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl niche-glow-pulse" />
        <div data-gsap="v-reveal" className="relative z-10 max-w-6xl mx-auto grid gap-12 lg:grid-cols-2 items-center">
          <div className="text-center lg:text-left">
            <h1
              data-gsap="hero-title"

              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-6 tracking-tight animate-in fade-in-0 slide-in-from-bottom-5 duration-700"
            >
              Match by <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">{typedVibe || 'vibe'}</span><span className="text-red-500">|</span>, not noise.
            </h1>

            <p
              data-gsap="hero-sub"
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl leading-relaxed animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150"
            >
              Niche blends swipe discovery, interest-first profiles, and event communities so every connection actually feels relevant.
            </p>

            <div data-gsap="hero-cta" className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push('/auth')}
                className="px-8 py-4 niche-animated-gradient bg-gradient-to-r from-red-500 via-pink-500 to-fuchsia-500 text-white font-semibold rounded-full text-lg transition shadow-lg"
              >
                Start Matching
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => scrollToSection('features')}
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-black dark:text-white font-semibold rounded-full text-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                Explore Features
              </motion.button>
            </div>
          </div>

          <motion.div data-gsap="hero-card" className="relative mx-auto w-full max-w-md animate-in fade-in-0 slide-in-from-right-6 duration-700 delay-200 niche-float">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-red-400/25 to-fuchsia-400/25 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 shadow-2xl">
              <div data-gsap="parallax-media" className="rounded-2xl bg-gradient-to-br from-red-100 to-pink-200 dark:from-gray-800 dark:to-gray-700 p-6 mb-4">
                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300 mb-2">Tonight’s top vibe</p>
                <h3 className="text-2xl font-bold text-black dark:text-white">Lo-fi rooftop meetup</h3>
                <p className="text-sm text-gray-700 dark:text-gray-200 mt-2">48 people nearby · 92% compatibility</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700 p-3">
                  <p className="text-gray-500">Swipe quality</p>
                  <p className="text-xl font-bold text-black dark:text-white">+37%</p>
                </div>
                <div className="rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700 p-3">
                  <p className="text-gray-500">New events</p>
                  <p className="text-xl font-bold text-black dark:text-white">12</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/40 px-3 py-2 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                  className="h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent"
                />
                <motion.p
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="text-xs text-gray-600 dark:text-gray-300"
                >
                  Curating your best nearby matches...
                </motion.p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {["A", "R", "K"].map((initial, i) => (
                  <motion.div
                    key={initial}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-rose-50 dark:from-gray-900 dark:to-gray-800 p-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-pink-500 text-white flex items-center justify-center font-bold mb-2">{initial}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Top match</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How Niche Works */}
      <section
        id="how"
        ref={howItWorksRef}
        data-scroll-section="true"
        data-section-id="how"
        className="relative scroll-mt-28 py-28 px-4 bg-transparent text-black dark:text-white overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
      >
        <div data-gsap="v-reveal" className="max-w-4xl mx-auto">

          {/* Section label */}
          <motion.p
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-white/40 mb-16"
          >
            How it works
          </motion.p>

          {/* Steps + vertical progress line */}
          <div className="relative flex gap-10">

            {/* Progress line track */}
            <div className="hidden md:block relative self-stretch flex-shrink-0 w-px mt-2 bg-gray-200 dark:bg-white/10">
              <motion.div
                ref={progressLineRef}
                className="absolute top-0 left-0 w-full bg-gradient-to-b from-rose-500 to-pink-500 origin-top"
                style={{ top: 0, bottom: 0, scaleY: howProgress, transformOrigin: 'top' }}
              />
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]"
                style={{ top: howDotY }}
              />
            </div>

            {/* Steps */}
            <div className="flex-1 divide-y divide-gray-200 dark:divide-white/10">
              {[
                {
                  num: '01',
                  title: 'Build your identity',
                  body: 'Go beyond a headshot. Layer in your values, vibe, interests, and deal-breakers so every profile tells a real story.',
                  icon: Wand2,
                },
                {
                  num: '02',
                  title: 'Find your people',
                  body: 'Our matching weighs what actually matters to you — not just proximity. Discover connections that feel intentional from the first swipe.',
                  icon: Sparkles,
                },
                {
                  num: '03',
                  title: 'Make something real',
                  body: 'Move from in-app spark to real-world moment. Niche surfaces shared events, nearby spots, and the right opener so the conversation never stalls.',
                  icon: Heart,
                },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.num}
                    ref={(el) => { if (el) stepRefs.current[idx] = el; }}
                    className="grid grid-cols-[72px_1fr_48px] items-start gap-6 py-12"
                    style={{ willChange: 'transform, opacity' }}
                    initial={{ opacity: 0.35, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.45, delay: idx * 0.08, ease: 'easeOut' }}
                    viewport={{ once: false, amount: 0.55 }}
                  >
                    <motion.span
                      data-step-num
                      className="text-5xl font-bold leading-none text-gray-300 dark:text-white/20"
                      whileInView={{ scale: [0.96, 1.04, 1] }}
                      transition={{ duration: 0.4, delay: idx * 0.07 }}
                      viewport={{ once: false, amount: 0.6 }}
                    >
                      {step.num}
                    </motion.span>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-semibold mb-3 leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-white/50 leading-relaxed max-w-lg">{step.body}</p>
                    </div>
                    <div className="mt-1 w-10 h-10 rounded-xl border border-gray-300 dark:border-white/12 bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-600 dark:text-white/60" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-200 dark:bg-white/10 rounded-2xl overflow-hidden">
            {[
              { value: '12k+', label: 'Active members' },
              { value: '94%', label: 'Quality match score' },
              { value: '3×', label: 'More real conversations' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                data-gsap="stat-value"
                className="bg-white dark:bg-black px-8 py-8 text-center"
                whileInView={{ opacity: [0.8, 1], y: [16, 0] }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <p className="text-4xl sm:text-5xl font-bold mb-1 bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-white/55 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-white/40 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Inspiration + 3D Models */}
      <section id="features" data-scroll-section="true" data-section-id="features" ref={inspirationRef} data-gsap="feature-zone" className="relative scroll-mt-28 py-20 px-4 bg-transparent overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <div data-gsap="v-reveal" className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 data-gsap="feature-heading" className="text-4xl font-bold text-black dark:text-white mb-4">Built for your niche, designed to feel alive.</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Every element is tuned for quality connections, rich discovery, and expressive profiles in one modern interface.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {inspirations.map((app, idx) => {
                const AppIcon = app.icon;
                return (
                  <motion.div
                    data-gsap="feature-chip"
                    key={app.name}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ y: -4, scale: 1.04 }}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-white/5 px-3 py-1.5 shadow-sm"
                  >
                    <AppIcon className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-sm font-medium text-black dark:text-white">{app.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">· {app.tone}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[420px]"
            style={{ perspective: 1100 }}
          >
            <motion.div
              animate={{ rotateY: [0, 10, 0, -10, 0], rotateX: [0, 3, 0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
              whileHover={{ y: -14, scale: 1.06, rotateX: 8, rotateY: -10 }}
              style={{ y: leftCardY, rotateZ: leftCardRotate, transformStyle: 'preserve-3d' }}
              className="absolute left-8 top-8 h-[320px] w-[220px] rounded-[30px] border border-white/35 dark:border-white/10 bg-gradient-to-br from-white to-rose-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl hover:shadow-[0_28px_70px_-25px_rgba(244,63,94,0.7)] p-4"
              data-gsap="reveal-card"
            >
              <div data-gsap="parallax-media" className="rounded-2xl h-40 bg-[url('https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=700&q=70')] bg-cover bg-center mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-300">Profile vibe</p>
              <p className="font-bold text-black dark:text-white text-lg">Creative, active, kind</p>
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-1 rounded-full text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300">Music</span>
                <span className="px-2 py-1 rounded-full text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300">Art</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ rotateY: [0, -12, 0, 12, 0], rotateX: [0, -4, 0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 16, ease: 'easeInOut' }}
              whileHover={{ y: -14, scale: 1.06, rotateX: 8, rotateY: 10 }}
              style={{ y: rightCardY, rotateZ: rightCardRotate, transformStyle: 'preserve-3d' }}
              className="absolute right-4 bottom-5 h-[280px] w-[200px] rounded-[26px] border border-white/35 dark:border-white/10 bg-gradient-to-br from-rose-100/90 to-fuchsia-100/90 dark:from-gray-900 dark:to-gray-800 shadow-xl hover:shadow-[0_28px_70px_-25px_rgba(236,72,153,0.65)] p-4"
              data-gsap="reveal-card"
            >
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300 mb-2">Tonight</p>
              <div data-gsap="parallax-media" className="rounded-xl h-28 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=70')] bg-cover bg-center mb-3" />
              <p className="font-semibold text-black dark:text-white">Neon rooftop social</p>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">2.4 km away · 63 joining</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -14, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 5.8, ease: 'easeInOut' }}
              data-gsap="float-orb"
              className="absolute left-1/2 -translate-x-1/2 top-1/2 h-28 w-28 rounded-full bg-gradient-to-br from-red-500/40 to-pink-500/40 blur-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section data-scroll-section="true" className="py-20 px-4 bg-transparent animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <div data-gsap="v-reveal" className="max-w-6xl mx-auto">
          <motion.h2 
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center text-black dark:text-white mb-16"
          >
            How it works
          </motion.h2>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
          >
            {[
              {
                icon: Heart,
                title: "Discover People",
                description: "Swipe through real profiles. No bots, no games. Just people like you."
              },
              {
                icon: MapPin,
                title: "Find Events",
                description: "See what's happening near you. Filter by your interests and vibe."
              },
              {
                icon: Users,
                title: "Build Community",
                description: "Rate people, events, and organizers. Keep everyone accountable."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={item}
                whileHover={{ y: -12, scale: 1.03, rotateX: 4, rotateY: idx % 2 === 0 ? -4 : 4 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                style={{ transformStyle: 'preserve-3d' }}
                data-gsap="reveal-card"
                className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-red-500 dark:hover:border-red-500 transition shadow-sm hover:shadow-[0_22px_60px_-24px_rgba(244,63,94,0.6)]"
              >
                <feature.icon className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="why" data-scroll-section="true" data-section-id="why" className="relative scroll-mt-28 py-20 px-4 bg-transparent overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <div data-gsap="v-reveal" className="max-w-6xl mx-auto">
          <motion.h2 
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-black dark:text-white mb-4"
          >
            Why Niche?
          </motion.h2>
          <motion.p
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gray-600 dark:text-gray-300 mb-10 max-w-2xl"
          >
            Designed to feel alive: richer visuals, safer matching, and card experiences that feel like a premium social app.
          </motion.p>

          <motion.div
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative mb-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 overflow-hidden"
          >
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, duration: 32, ease: 'linear' }}
              className="flex gap-3 w-max"
            >
              {Array.from({ length: 2 }).flatMap((_, group) => [
                <div key={`hot-${group}`} className="px-4 py-2 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm font-medium inline-flex items-center gap-2"><Flame className="w-4 h-4" /> Trending Niches</div>,
                <div key={`safe-${group}`} className="px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Verified Community</div>,
                <div key={`pics-${group}`} className="px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium inline-flex items-center gap-2"><Camera className="w-4 h-4" /> Visual-first Profiles</div>,
                <div key={`magic-${group}`} className="px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium inline-flex items-center gap-2"><Wand2 className="w-4 h-4" /> Smart Suggestions</div>,
              ])}
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <motion.div 
              className="space-y-5"
              whileInView="show"
              viewport={{ once: true }}
              variants={container}
            >
              {[
                {
                  title: "Verified & Safe",
                  desc: "Age and account checks reduce fake profiles. Report + moderation tools keep the vibe clean.",
                  icon: ShieldCheck,
                },
                {
                  title: "Real Connections",
                  desc: "Profiles are richer than photos: interests, prompts, and event intent drive better matches.",
                  icon: MessageCircleHeart,
                },
                {
                  title: "Community Driven",
                  desc: "Ratings and social proof make quality visible. Reputation matters, so behavior improves.",
                  icon: Star,
                },
                {
                  title: "Event Discovery",
                  desc: "Find high-fit plans nearby and turn online matches into real-world moments fast.",
                  icon: Sparkles,
                }
              ].map((feature, idx) => (
                <motion.div 
                  key={idx}
                  variants={item}
                  whileHover={{ y: -12, scale: 1.025, rotateX: 3, rotateY: idx % 2 === 0 ? -3 : 3 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  data-gsap="reveal-card"
                  className="group flex gap-4 items-start p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition relative overflow-hidden"
                >
                  <motion.div
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-red-500 to-pink-500"
                    initial={{ scaleY: 0.3, opacity: 0.6 }}
                    whileInView={{ scaleY: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.08 }}
                  />
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black dark:text-white mb-1 text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-10 -right-8 h-36 w-36 rounded-full bg-fuchsia-400/20 blur-2xl" />
              <div className="absolute -bottom-10 -left-8 h-36 w-36 rounded-full bg-rose-400/20 blur-2xl" />

              <div className="relative grid gap-4">
                <motion.div
                  whileHover={{ y: -10, scale: 1.02, rotateX: 3, rotateY: -3 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-rose-50 dark:from-gray-900 dark:to-gray-800 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-black dark:text-white">Tonight in your zone</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300">Live</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=70',
                      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=70',
                      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=70',
                    ].map((src, i) => (
                      <motion.div
                        key={src}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.12, duration: 0.45 }}
                        whileHover={{ y: -6, scale: 1.06, rotateX: 6, rotateY: i % 2 === 0 ? -6 : 6 }}
                        style={{ transformStyle: 'preserve-3d' }}
                        className="relative rounded-xl h-24 overflow-hidden border border-white/40 dark:border-white/10 shadow-md hover:shadow-[0_16px_36px_-18px_rgba(244,63,94,0.75)]"
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${src})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                        <div className="absolute bottom-2 left-2 text-[10px] text-white/95 font-medium tracking-wide">Event vibe</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -10, scale: 1.02, rotateX: 2, rotateY: 3 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm"
                >
                  <p className="font-semibold text-black dark:text-white mb-3">Profile quality cards</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                      <p className="text-emerald-700 dark:text-emerald-300 mb-1">Verified users</p>
                      <p className="text-2xl font-bold text-black dark:text-white">94%</p>
                    </div>
                    <div className="rounded-xl p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                      <p className="text-violet-700 dark:text-violet-300 mb-1">Event join rate</p>
                      <p className="text-2xl font-bold text-black dark:text-white">67%</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section data-scroll-section="true" className="py-20 px-4 bg-transparent animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <motion.div 
          data-gsap="v-reveal"
          className="max-w-2xl mx-auto text-center"
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="text-4xl font-bold text-black dark:text-white mb-6"
            whileInView={{ opacity: [0.6, 1], y: [10, 0] }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
          >
            Ready to find your people?
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400 mb-8"
            whileInView={{ opacity: [0.4, 1], y: [8, 0] }}
            transition={{ duration: 0.45, delay: 0.08 }}
            viewport={{ once: true }}
          >
            Join thousands discovering real events and real connections.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: ['0 8px 20px rgba(239,68,68,0.25)', '0 12px 32px rgba(236,72,153,0.38)', '0 8px 20px rgba(239,68,68,0.25)'] }}
            transition={{ boxShadow: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } }}
              onClick={() => router.push('/auth')}
            className="px-10 py-4 niche-animated-gradient bg-gradient-to-r from-red-500 via-pink-500 to-fuchsia-500 text-white font-semibold rounded-full text-lg transition shadow-lg"
          >
            Create Your Account
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer data-gsap="footer-wrap" className="relative py-16 px-4 bg-transparent border-t border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <div data-gsap="v-parallax" className="pointer-events-none absolute -top-12 right-12 h-40 w-40 rounded-full bg-rose-400/15 blur-3xl" />
        <div data-gsap="v-parallax" className="pointer-events-none absolute -bottom-14 left-10 h-44 w-44 rounded-full bg-fuchsia-400/15 blur-3xl" />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-[1.35fr_1fr] gap-10 mb-10">
            <div data-gsap="footer-brand" className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-rose-50/70 dark:from-gray-950 dark:to-gray-900 p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-3">Niche community</p>
              <h3 className="text-3xl sm:text-4xl font-bold text-black dark:text-white leading-tight mb-3">
                Built for real people, real moments, and better matches.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed mb-6">
                A premium social layer for discovery, compatibility, and local momentum — designed to keep every interaction intentional.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => scrollToSection('how')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-85 transition-opacity"
                >
                  How it works <ArrowUpRight className="w-4 h-4" />
                </button>
                <a href="#" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-red-400 dark:hover:border-red-500 transition-colors">
                  Community guidelines
                </a>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div data-gsap="footer-col" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
                <h4 className="font-semibold text-black dark:text-white mb-3">Product</h4>
                <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <li><a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</a></li>
                  <li><a href="#why" className="hover:text-black dark:hover:text-white transition-colors">Safety</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Roadmap</a></li>
                </ul>
              </div>

              <div data-gsap="footer-col" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
                <h4 className="font-semibold text-black dark:text-white mb-3">Company</h4>
                <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Press kit</a></li>
                </ul>
              </div>

              <div data-gsap="footer-col" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
                <h4 className="font-semibold text-black dark:text-white mb-3">Legal</h4>
                <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Cookie policy</a></li>
                </ul>
              </div>

              <div data-gsap="footer-col" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
                <h4 className="font-semibold text-black dark:text-white mb-3">Connect</h4>
                <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">X / Twitter</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Community</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div data-gsap="footer-bottom" className="pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2026 Niche. Crafted for meaningful connection.</p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified-first</span>
              <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-rose-500" /> Experience-led</span>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
