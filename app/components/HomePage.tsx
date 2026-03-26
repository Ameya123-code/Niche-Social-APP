'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart, MapPin, Users, Sparkles, ShieldCheck, Camera, Wand2, Star, Flame, MessageCircleHeart, Briefcase, Leaf, Rainbow, Layers3, ArrowUpRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  const inspirationRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, -70]);
  const orbY = useTransform(scrollYProgress, [0, 0.35], [0, 90]);
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

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {

      /* ── 1. Hero entrance timeline ─────────────────────────────── */
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .fromTo('[data-gsap="hero-title"]',
          { opacity: 0, y: 48, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.0 })
        .fromTo('[data-gsap="hero-sub"]',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.75 }, '-=0.55')
        .fromTo('[data-gsap="hero-cta"]',
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 0.6 }, '-=0.45')
        .fromTo('[data-gsap="hero-card"]',
          { opacity: 0, y: 36, rotateX: 6 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.85 }, '-=0.5');

      /* ── 2. Float orb idle ─────────────────────────────────────── */
      gsap.to('[data-gsap="float-orb"]', {
        y: -14, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });

      /* ── 3. Parallax media on scroll ───────────────────────────── */
      gsap.utils.toArray<HTMLElement>('[data-gsap="parallax-media"]').forEach((el, i) => {
        gsap.to(el, {
          yPercent: i % 2 === 0 ? -10 : -16,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
        });
      });

      /* ── 4. Card stagger (reveal-card) ─────────────────────────── */
      gsap.utils.toArray<HTMLElement>('[data-gsap="reveal-card"]').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 44, scale: 0.96 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.8, delay: i * 0.06, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
          }
        );
      });

      /* ── 5. Feature zone chips ─────────────────────────────────── */
      const featureTl = gsap.timeline({
        scrollTrigger: { trigger: '[data-gsap="feature-zone"]', start: 'top 74%' },
      });
      featureTl
        .fromTo('[data-gsap="feature-heading"]',
          { opacity: 0, x: -22 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' })
        .fromTo('[data-gsap="feature-chip"]',
          { opacity: 0, y: 14, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.028, duration: 0.38, ease: 'power2.out' },
          '-=0.25');

      /* ── 6. Depth cards ────────────────────────────────────────── */
      gsap.utils.toArray<HTMLElement>('[data-gsap="depth-card"]').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 52, rotateX: 10 },
          {
            opacity: 1, y: 0, rotateX: 0, duration: 0.9, delay: i * 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 86%' },
          }
        );
      });

      /* ── 7. Global section slide-up scrub ──────────────────────── */
      gsap.utils.toArray<HTMLElement>('[data-scroll-section="true"]').forEach((section) => {
        gsap.fromTo(section,
          { y: 42, opacity: 0.85 },
          {
            y: 0, opacity: 1, ease: 'none',
            scrollTrigger: { trigger: section, start: 'top 94%', end: 'top 44%', scrub: 1.2 },
          }
        );
      });

      /* ── 7b. Vertical reveal + subtle parallax for depth ───────── */
      gsap.utils.toArray<HTMLElement>('[data-gsap="v-reveal"]').forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 56, scale: 0.985 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.78,
            delay: i * 0.02,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-gsap="v-parallax"]').forEach((el, i) => {
        gsap.to(el, {
          yPercent: i % 2 === 0 ? -8 : -12,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.4,
          },
        });
      });

      /* ── 8. How It Works — scroll-driven step highlights ───────── */
      const steps = stepRefs.current.filter(Boolean);
      const progressLine = progressLineRef.current;

      if (steps.length && howItWorksRef.current) {
        // Set initial dimmed state for all steps
        gsap.set(steps, { opacity: 0.28, y: 28 });

        steps.forEach((step, idx) => {
          // Each step fades + slides in as it enters
          ScrollTrigger.create({
            trigger: step,
            start: 'top 72%',
            end: 'top 32%',
            onEnter: () => {
              // Activate this step
              gsap.to(step, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' });
              gsap.to(step.querySelector('[data-step-num]'), {
                color: '#f43f5e', scale: 1.05, duration: 0.4, ease: 'power2.out',
              });
              // Dim all others
              steps.forEach((s, i) => {
                if (i !== idx) {
                  gsap.to(s, { opacity: 0.3, duration: 0.4, ease: 'power2.out' });
                  gsap.to(s.querySelector('[data-step-num]'), { clearProps: 'color', scale: 1, duration: 0.4 });
                }
              });
              // Advance progress line
              if (progressLine) {
                gsap.to(progressLine, {
                  scaleY: (idx + 1) / steps.length,
                  duration: 0.55,
                  ease: 'power2.out',
                });
              }
            },
            onLeaveBack: () => {
              if (idx === 0) {
                gsap.to(step, { opacity: 0.28, duration: 0.35 });
                gsap.to(step.querySelector('[data-step-num]'), { clearProps: 'color', scale: 1, duration: 0.35 });
                if (progressLine) gsap.to(progressLine, { scaleY: 0, duration: 0.4 });
              }
            },
          });
        });
      }

      /* ── 9. Stats counter roll-up ──────────────────────────────── */
      gsap.utils.toArray<HTMLElement>('[data-gsap="stat-value"]').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 18, scale: 0.88 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.5)',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        );
      });

      /* ── 10. Footer reveal timeline ────────────────────────────── */
      const footerTl = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-gsap="footer-wrap"]',
          start: 'top 88%',
        },
      });

      footerTl
        .fromTo(
          '[data-gsap="footer-brand"]',
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
        )
        .fromTo(
          '[data-gsap="footer-col"]',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power2.out' },
          '-=0.35'
        )
        .fromTo(
          '[data-gsap="footer-bottom"]',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.15'
        );

    }, pageRef);

    return () => ctx.revert();
  }, []);

  /* ── Active nav highlight on scroll ─────────────────────────────── */
  useEffect(() => {
    const sections = [
      { id: 'hero', el: document.querySelector<HTMLElement>('[data-section-id="hero"]') },
      { id: 'how', el: document.querySelector<HTMLElement>('[data-section-id="how"]') },
      { id: 'features', el: document.querySelector<HTMLElement>('[data-section-id="features"]') },
      { id: 'why', el: document.querySelector<HTMLElement>('[data-section-id="why"]') },
    ];

    const triggers = sections.map(({ id, el }) => {
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: (self) => {
          const link = navLinksRef.current.get(id);
          if (!link) return;
          if (self.isActive) {
            gsap.to(link, { color: '#f43f5e', duration: 0.25 });
          } else {
            gsap.to(link, { color: '', duration: 0.25 });
          }
        },
      });
    });

    return () => triggers.forEach((t) => t?.kill());
  }, []);

  /* ── Cursor glow + 3D card tilt ─────────────────────────────────── */
  useEffect(() => {
    const zone = pageRef.current;
    const glow = pageRef.current?.querySelector('[data-gsap="cursor-glow"]') as HTMLElement | null;
    const cards = pageRef.current?.querySelectorAll<HTMLElement>('[data-mouse-card="true"]');

    if (!zone || !glow || !cards) return;

    const xTo = gsap.quickTo(glow, 'x', { duration: 0.42, ease: 'power3.out' });
    const yTo = gsap.quickTo(glow, 'y', { duration: 0.42, ease: 'power3.out' });

    const onZoneMove = (e: MouseEvent) => {
      xTo(e.clientX - 100);
      yTo(e.clientY - 100);
    };

    const onZoneEnter = () => gsap.to(glow, { opacity: 1, duration: 0.25, ease: 'power2.out' });
    const onZoneLeave = () => gsap.to(glow, { opacity: 0, duration: 0.25, ease: 'power2.out' });

    zone.addEventListener('mousemove', onZoneMove);
    zone.addEventListener('mouseenter', onZoneEnter);
    zone.addEventListener('mouseleave', onZoneLeave);

    const cleanups: Array<() => void> = [];
    cards.forEach((card) => {
      const onMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        gsap.to(card, {
          rotateY: (px - 0.5) * 16,
          rotateX: -(py - 0.5) * 14,
          scale: 1.04,
          duration: 0.35,
          ease: 'power2.out',
          transformPerspective: 1000,
          transformOrigin: 'center center',
        });
      };

      const onLeave = () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.45, ease: 'power3.out' });
      };

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => {
      zone.removeEventListener('mousemove', onZoneMove);
      zone.removeEventListener('mouseenter', onZoneEnter);
      zone.removeEventListener('mouseleave', onZoneLeave);
      cleanups.forEach((fn) => fn());
    };
  }, []);

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
    <div ref={pageRef} className="bg-white dark:bg-black min-h-screen overflow-x-hidden">
      <div data-gsap="cursor-glow" className="pointer-events-none fixed z-[60] h-52 w-52 rounded-full bg-gradient-to-br from-pink-500/25 to-fuchsia-500/25 blur-3xl opacity-0 hidden lg:block" />
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 z-[70] bg-gradient-to-r from-red-500 via-pink-500 to-fuchsia-500 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-lg z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div 
            className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            {typedBrand}
            <span className="animate-pulse">|</span>
          </motion.div>
          <div className="hidden md:flex items-center gap-6 mr-4">
            {(['how', 'features', 'why'] as const).map((id) => (
              <a
                key={id}
                href={`#${id}`}
                ref={(el) => { if (el) navLinksRef.current.set(id, el); }}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(`[data-section-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors capitalize"
              >
                {id === 'how' ? 'How it works' : id === 'features' ? 'Features' : 'Why Niche'}
              </a>
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
      <section id="hero" data-scroll-section="true" data-section-id="hero" className="pt-32 pb-20 px-4 bg-white dark:bg-black relative">
        <motion.div style={{ y: orbY }} data-gsap="v-parallax" className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-rose-300/20 blur-3xl" />
        <motion.div style={{ y: heroY }} data-gsap="v-parallax" className="absolute top-24 -right-20 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div data-gsap="v-reveal" className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-2 items-center">
          <div className="text-center lg:text-left">
            <h1
              data-gsap="hero-title"
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-6 tracking-tight opacity-0"
            >
              Match by <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">{typedVibe || 'vibe'}</span><span className="text-red-500">|</span>, not noise.
            </h1>

            <p
              data-gsap="hero-sub"
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl leading-relaxed opacity-0"
            >
              Niche blends swipe discovery, interest-first profiles, and event communities so every connection actually feels relevant.
            </p>

            <div data-gsap="hero-cta" className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start opacity-0">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push('/auth')}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-full text-lg transition shadow-lg"
              >
                Start Matching
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-black dark:text-white font-semibold rounded-full text-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                Explore Features
              </motion.button>
            </div>
          </div>

          <motion.div data-gsap="hero-card" className="relative mx-auto w-full max-w-md opacity-0">
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
                    initial={{ opacity: 0, y: 10 }}
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
        className="py-28 px-4 bg-white dark:bg-black text-black dark:text-white overflow-hidden"
      >
        <div data-gsap="v-reveal" className="max-w-4xl mx-auto">

          {/* Section label */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-white/40 mb-16"
          >
            How it works
          </motion.p>

          {/* Steps + vertical progress line */}
          <div className="relative flex gap-10">

            {/* Progress line track */}
            <div className="hidden md:block relative flex-shrink-0 w-px bg-gray-200 dark:bg-white/10 mt-2" style={{ minHeight: '100%' }}>
              <div
                ref={progressLineRef}
                className="absolute top-0 left-0 w-full bg-gradient-to-b from-rose-500 to-pink-500 origin-top"
                style={{ height: '100%', transform: 'scaleY(0)', transformOrigin: 'top' }}
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
                  <div
                    key={step.num}
                    ref={(el) => { if (el) stepRefs.current[idx] = el; }}
                    className="grid grid-cols-[72px_1fr_48px] items-start gap-6 py-12"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <span
                      data-step-num
                      className="text-5xl font-bold leading-none text-gray-300 dark:text-white/20"
                    >
                      {step.num}
                    </span>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-semibold mb-3 leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-white/50 leading-relaxed max-w-lg">{step.body}</p>
                    </div>
                    <div className="mt-1 w-10 h-10 rounded-xl border border-gray-300 dark:border-white/12 bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-600 dark:text-white/60" />
                    </div>
                  </div>
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
            ].map((stat) => (
              <div key={stat.label} data-gsap="stat-value" className="bg-white dark:bg-black px-8 py-8 text-center">
                <p className="text-4xl sm:text-5xl font-bold mb-1 bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-white/55 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-white/40 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Inspiration + 3D Models */}
      <section id="features" data-scroll-section="true" data-section-id="features" ref={inspirationRef} data-gsap="feature-zone" className="py-20 px-4 bg-white dark:bg-black overflow-hidden">
        <div data-gsap="v-reveal" className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
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
                    initial={{ opacity: 0, y: 10 }}
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
            initial={{ opacity: 0, x: 24 }}
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
      <section data-scroll-section="true" className="py-20 px-4 bg-white dark:bg-black">
        <div data-gsap="v-reveal" className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center text-black dark:text-white mb-16"
          >
            How it works
          </motion.h2>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
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
      <section id="why" data-scroll-section="true" data-section-id="why" className="py-20 px-4 bg-white dark:bg-black overflow-hidden">
        <div data-gsap="v-reveal" className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-black dark:text-white mb-4"
          >
            Why Niche?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gray-600 dark:text-gray-300 mb-10 max-w-2xl"
          >
            Designed to feel alive: richer visuals, safer matching, and card experiences that feel like a premium social app.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
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
              initial="hidden"
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
              initial={{ opacity: 0, y: 20 }}
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
                        initial={{ opacity: 0, y: 10 }}
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
      <section data-scroll-section="true" className="py-20 px-4 bg-white dark:bg-black">
        <motion.div 
          data-gsap="v-reveal"
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-black dark:text-white mb-6">
            Ready to find your people?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Join thousands discovering real events and real connections.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth')}
            className="px-10 py-4 bg-red-500 text-white font-semibold rounded-full text-lg hover:bg-red-600 transition shadow-lg"
          >
            Create Your Account
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer data-gsap="footer-wrap" className="relative py-16 px-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 overflow-hidden">
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
                <a href="#how" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-85 transition-opacity">
                  How it works <ArrowUpRight className="w-4 h-4" />
                </a>
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
  );
}
