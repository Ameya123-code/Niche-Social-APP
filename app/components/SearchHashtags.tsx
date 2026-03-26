'use client';

import React from 'react';

export default function SearchHashtags() {
  const [hashtag, setHashtag] = React.useState('');

  return (
    <div className="w-full min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Events & Opinions</h1>
        <p className="text-gray-600 mb-8">Find people discussing your interests</p>
        
        {/* Search bar */}
        <div className="mb-8">
          <input
            type="text"
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
            placeholder="#musicfestival, #climatechange, #techconference..."
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        
        {/* Results section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Events results */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Events</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600">Results will appear here</p>
            </div>
          </div>
          
          {/* Opinions results */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Opinions & Discussions</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600">Results will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
