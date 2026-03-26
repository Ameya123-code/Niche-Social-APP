'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Search, X, Music, Utensils, Dumbbell, Palette } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  category: string;
  date: string;
  attendees: number;
  location: string;
  distance: string;
  image: string;
}

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    name: 'Live Jazz Night',
    category: 'Music',
    date: 'Mar 28, 7:00 PM',
    attendees: 45,
    location: 'The Blue Note',
    distance: '2.3 km away',
    image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'Farmers Market',
    category: 'Food',
    date: 'Mar 30, 10:00 AM',
    attendees: 120,
    location: 'Central Park',
    distance: '1.2 km away',
    image: 'https://images.unsplash.com/photo-1488459716781-6815f9667ca3?w=500&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'Morning Yoga Session',
    category: 'Fitness',
    date: 'Mar 29, 6:30 AM',
    attendees: 32,
    location: 'Riverside Yoga Studio',
    distance: '0.8 km away',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=300&fit=crop',
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  Music: <Music className="w-4 h-4" />,
  Food: <Utensils className="w-4 h-4" />,
  Fitness: <Dumbbell className="w-4 h-4" />,
  Art: <Palette className="w-4 h-4" />,
};

export default function EventMap() {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState('all');

  const categories = ['All', 'Music', 'Food', 'Fitness', 'Art'];

  return (
    <div className="w-full min-h-screen bg-white dark:bg-black pt-20">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-full lg:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-4">Events</h1>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(cat.toLowerCase())}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    filter === cat.toLowerCase()
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedEvent(event)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedEvent?.id === event.id
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-red-500'
                  }`}
                >
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-black dark:text-white">{event.name}</h3>
                    <span className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                      {categoryIcons[event.category]}
                      {event.category}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {event.distance}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      {event.attendees} going
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="hidden lg:flex flex-1 bg-gray-100 dark:bg-gray-800 items-center justify-center relative overflow-hidden">
          {selectedEvent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full flex items-center justify-center p-8"
            >
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center relative">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.name}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 rounded-lg" />
                <div className="relative text-center text-white">
                  <h2 className="text-4xl font-bold mb-2">{selectedEvent.name}</h2>
                  <p className="text-xl mb-6">{selectedEvent.location}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition"
                  >
                    I'm Going
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select an event to see details</p>
            </div>
          )}
        </div>

        {/* Mobile Event Detail */}
        {selectedEvent && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl p-6 border-t border-gray-200 dark:border-gray-800"
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
            <img
              src={selectedEvent.image}
              alt={selectedEvent.name}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
              {selectedEvent.name}
            </h2>
            <div className="space-y-2 mb-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {selectedEvent.date}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {selectedEvent.location}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {selectedEvent.attendees} going
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
            >
              I'm Going
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
