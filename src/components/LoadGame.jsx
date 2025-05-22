import React, { useState } from 'react';
import AnimatedList from './SaveFileUI';

export default function LoadGame({ onClose }) {
  const [showSaveFiles, setShowSaveFiles] = useState(false);

  // Mock save files - will be replaced with Firebase data later
  const saveFiles = [
    'Save Game 1 - Level 5 - 1000 Gold',
    'Save Game 2 - Level 3 - 500 Gold',
    'Save Game 3 - Level 7 - 2000 Gold',
  ];

  const handleLoadSave = (saveFile, index) => {
    // TODO: Implement actual save file loading logic
    console.log('Loading save file:', saveFile, 'at index:', index);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="bg-[#8B4513] p-8 rounded-lg max-w-md w-full mx-4 relative border-8 border-[#D2B48C] shadow-lg">
        <div className="space-y-6 text-[#DEB887]">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#F5DEB3]">Load Game</h2>
            <button
              onClick={onClose}
              className="text-[#F5DEB3] hover:text-[#DEB887] transition-colors focus:outline-none focus:ring-0"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <AnimatedList
              items={saveFiles}
              onItemSelect={handleLoadSave}
              showGradients={true}
              enableArrowNavigation={true}
              className="mx-auto"
              itemClassName="bg-[#D2B48C] hover:bg-[#F5DEB3] text-[#8B4513]"
              displayScrollbar={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 