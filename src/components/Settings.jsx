import React from 'react';
import { useMusic } from '../context/MusicContext';
import ElasticSlider from './ElasticSlider';
import { motion } from 'framer-motion';
import { useSound } from '../context/SoundContext';

export default function Settings({ 
  onClose, 
  soundEnabled, 
  setSoundEnabled,
  sfxVolume,
  setSfxVolume
}) {
  const { 
    musicEnabled, 
    setMusicEnabled, 
    musicVolume, 
    setMusicVolume,
    currentTrack,
    totalTracks 
  } = useMusic();

  const { playExit } = useSound();

  const handleClose = () => {
    playExit();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.3 }}
        className="bg-[#8B4513] p-8 rounded-lg max-w-2xl w-full mx-4 relative border-8 border-[#D2B48C] shadow-lg"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#F5DEB3] text-2xl focus:outline-none hover:text-white transition-colors"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-[#F5DEB3]">SETTINGS</h2>
        
        <div className="space-y-6 text-[#DEB887]">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-lg">Sound Effects</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={soundEnabled}
                onChange={() => setSoundEnabled(!soundEnabled)}
              />
              <div className="w-6 h-6 border-2 border-[#D2B48C] rounded-full peer-checked:bg-[#8B4513] peer-checked:border-[#8B4513]"></div>
              <svg className="absolute top-0 left-0 w-6 h-6 text-[#F5DEB3] opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </label>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-lg">Background Music</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={musicEnabled}
                onChange={() => setMusicEnabled(!musicEnabled)}
              />
              <div className="w-6 h-6 border-2 border-[#D2B48C] rounded-full peer-checked:bg-[#8B4513] peer-checked:border-[#8B4513]"></div>
              <svg className="absolute top-0 left-0 w-6 h-6 text-[#F5DEB3] opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </label>
          </div>

          {/* Current Track Info */}
          <div className="text-center text-sm text-[#F5DEB3]">
            Now Playing: Track {currentTrack} of {totalTracks}
          </div>

          {/* Music Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg">Music Volume</span>
              <span className="text-sm">{Math.round(musicVolume)}%</span>
            </div>
            <ElasticSlider 
              defaultValue={musicVolume} 
              maxValue={100}
              onChange={setMusicVolume}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-[#DEB887]">
          Settings will be saved automatically
        </div>
      </motion.div>
    </motion.div>
  );
} 