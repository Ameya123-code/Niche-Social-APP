'use client';

import React from 'react';

export default function AccountPreferences() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Preferences</h1>
        
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Self Description (Hidden)</label>
            <textarea
              placeholder="Describe yourself for our matching algorithm..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
            />
          </div>
        </div>
        
        {/* Preferences Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Algorithm Preferences</h2>
          
          <div className="space-y-4">
            {['Music', 'Hobbies', 'Movies', 'Books', 'Pop Culture', 'Education', 'Career'].map((pref) => (
              <div key={pref}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{pref}</label>
                <input
                  type="text"
                  placeholder={`Add your ${pref.toLowerCase()}, comma separated...`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            ))}
          </div>
          
          <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
