'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Star, MessageCircle } from 'lucide-react';

interface CardData {
  id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  image: string;
  location: string;
  compatibility: number;
}

const MOCK_CARDS: CardData[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 26,
    bio: 'Love hiking on weekends, indie movies, and live music. Looking to explore new events.',
    interests: ['Hiking', 'Music', 'Art', 'Coffee'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=600&fit=crop',
    location: 'San Francisco, CA',
    compatibility: 92,
  },
  {
    id: '2',
    name: 'Jessica',
    age: 24,
    bio: 'Foodie exploring the best restaurants in the city. Also into yoga and travel.',
    interests: ['Food', 'Yoga', 'Travel', 'Photography'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop',
    location: 'San Francisco, CA',
    compatibility: 88,
  },
  {
    id: '3',
    name: 'Alex',
    age: 27,
    bio: 'Tech enthusiast, startup founder wannabe. Love meetups and networking events.',
    interests: ['Tech', 'Startups', 'Networking', 'Gaming'],
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=600&fit=crop',
    location: 'San Francisco, CA',
    compatibility: 85,
  },
];

export default function CardStack() {
  const [cards, setCards] = useState(MOCK_CARDS);
  const [likedCards, setLikedCards] = useState<string[]>([]);

  const handleLike = () => {
    setLikedCards([...likedCards, cards[0].id]);
    setCards(cards.slice(1));
  };

  const handlePass = () => {
    setCards(cards.slice(1));
  };

  if (cards.length === 0) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">No more people</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Check back later for more</p>
          <button className="px-8 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition">
            Explore Events
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[0];

  return (
    <div className="w-full min-h-screen bg-white dark:bg-black pt-20">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">Discover</h1>
          <p className="text-gray-600 dark:text-gray-400">Swipe to find people and events you love</p>
        </div>

        {/* Cards Stack */}
        <div className="relative h-[600px] mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Image Container */}
              <div className="relative w-full h-96 overflow-hidden bg-gray-200 dark:bg-gray-800">
                <img
                  src={currentCard.image}
                  alt={currentCard.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-3xl font-bold">{currentCard.name}, {currentCard.age}</h2>
                      <p className="text-sm opacity-90">{currentCard.location}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                      <span className="text-sm font-semibold">{currentCard.compatibility}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">{currentCard.bio}</p>

                {/* Interests */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentCard.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePass}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                  >
                    <X className="w-5 h-5" />
                    Pass
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLike}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                    Like
                  </motion.button>
                </div>

                {/* Message Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="w-full mt-3 py-3 flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-600 dark:text-blue-400 rounded-full font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  Start Conversation
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>{cards.length} more people to discover</p>
        </div>
      </div>
    </div>
  );
}
