import React from 'react';

export default function MusicPrompt({ onAccept, onDecline }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#8B4513] p-8 rounded-lg max-w-md w-full mx-4 relative border-8 border-[#D2B48C] shadow-lg">
        <div className="space-y-6 text-[#DEB887]">
          <p className="text-center text-xl text-[#F5DEB3]">
            Do you want to enable music?
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={onAccept}
              className="px-6 py-3 bg-[#D2B48C] hover:bg-[#F5DEB3] text-[#8B4513] font-semibold rounded-lg transition-colors focus:outline-none focus:ring-0"
            >
              Yes
            </button>
            <button
              onClick={onDecline}
              className="px-6 py-3 bg-[#D2B48C] hover:bg-[#F5DEB3] text-[#8B4513] font-semibold rounded-lg transition-colors focus:outline-none focus:ring-0"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 