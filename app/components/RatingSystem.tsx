'use client';

import React from 'react';

export default function RatingSystem() {
  const [activeTab, setActiveTab] = React.useState<'event' | 'organizer' | 'user'>('event');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Ratings & Reviews</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('event')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'event'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Rate Events
          </button>
          <button
            onClick={() => setActiveTab('organizer')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'organizer'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Rate Organizers
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Rate Users
          </button>
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-lg shadow p-8">
          {activeTab === 'event' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Rate This Event</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Choose an event...</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="text-4xl hover:text-yellow-400">
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                <textarea
                  placeholder="Share your thoughts about this event..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32"
                />
              </div>
            </div>
          )}
          
          {activeTab === 'organizer' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Rate Event Organizer</h2>
              <p className="text-gray-600 mb-6">Rate the organizers based on event management and communication</p>
              {/* Similar form structure */}
            </div>
          )}
          
          {activeTab === 'user' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Rate User Behavior</h2>
              <p className="text-gray-600 mb-6">Help us maintain a safe community by rating user behavior</p>
              <p className="text-sm text-orange-600 bg-orange-50 p-4 rounded mb-6">
                ⚠️ Inappropriate behavior will be reported to our moderation team
              </p>
              {/* Similar form structure */}
            </div>
          )}
          
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
}
