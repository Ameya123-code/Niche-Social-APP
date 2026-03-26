'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Users, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const router = useRouter();
  const [typedBrand, setTypedBrand] = useState('');

  useEffect(() => {
    const fullText = 'Niche';
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTypedBrand(fullText.slice(0, index));
      if (index >= fullText.length) clearInterval(timer);
    }, 120);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white dark:bg-black min-h-screen">
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
          <div className="flex items-center gap-3">
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
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={container}
        >
          <motion.h1 
            variants={item}
            className="text-6xl sm:text-7xl font-bold text-black dark:text-white mb-6 tracking-tight"
          >
            Find your <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">people</span>
          </motion.h1>
          
          <motion.p 
            variants={item}
            className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Discover events and connect with people who actually share your interests. Real conversations. Real connections.
          </motion.p>

          <motion.div 
            variants={item}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/auth')}
              className="px-8 py-4 bg-red-500 text-white font-semibold rounded-full text-lg hover:bg-red-600 transition shadow-lg"
            >
              Get Started
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-black dark:text-white font-semibold rounded-full text-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              Watch Demo
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto">
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
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-red-500 dark:hover:border-red-500 transition"
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
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-black dark:text-white mb-12"
          >
            Why Niche?
          </motion.h2>

          <motion.div 
            className="space-y-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
          >
            {[
              {
                title: "Verified & Safe",
                desc: "Age verification required. Strict safety policies. Report bad actors instantly."
              },
              {
                title: "Real Connections",
                desc: "No swiping on photos alone. See interests, read bios, find genuine matches."
              },
              {
                title: "Community Driven",
                desc: "Ratings keep everyone honest. Your reputation matters."
              },
              {
                title: "Event Discovery",
                desc: "Find events near you filtered by interest. Create your own and invite people."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={item}
                className="flex gap-4 items-start p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-black dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white dark:bg-black">
        <motion.div 
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
      <footer className="py-12 px-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-black dark:text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-black dark:hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-black dark:text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-black dark:hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-black dark:text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-black dark:hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-black dark:text-white mb-3">Social</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-black dark:hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2026 Niche. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
