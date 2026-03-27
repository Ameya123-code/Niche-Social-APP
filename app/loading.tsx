'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-fuchsia-50 dark:from-gray-950 dark:via-black dark:to-gray-950 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-2xl px-8 py-10 text-center"
      >
        <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-rose-400/20 blur-2xl" />
        <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-fuchsia-400/20 blur-2xl" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2.1, ease: 'linear' }}
          className="relative mx-auto mb-4 h-14 w-14 rounded-full border-2 border-red-500/35 border-t-red-500"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="absolute inset-0 m-auto h-7 w-7 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center"
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </motion.div>
        </motion.div>

        <p className="text-xl font-semibold text-black dark:text-white">Loading Niche</p>
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-red-500"
              animate={{ y: [0, -5, 0], opacity: [0.45, 1, 0.45] }}
              transition={{
                repeat: Infinity,
                duration: 0.9,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
