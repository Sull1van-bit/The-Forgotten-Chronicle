import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../context/SoundContext';

// Import prologue slides
import slide1 from '../assets/prologue/slide1.jpg';
import slide2 from '../assets/prologue/slide2.jpg';
import slide3 from '../assets/prologue/slide3.jpg';
import slide4 from '../assets/prologue/slide4.jpg';
import slide5 from '../assets/prologue/slide5.jpg';

// Debug log to check if images are imported correctly
console.log('Slides loaded:', { slide1, slide2, slide3, slide4, slide5 });

const scenes = [
  {
    text: "Once, your family name held meaning. A lineage of artisans, traders, and dreamers who shaped the land. But time erases all things… Now, only whispers remain.",
    image: slide1,
    duration: 9000
  },
  {
    text: "The cottage is yours now. A humble inheritance. A chance to rebuild, to find purpose, to carve your own path in this world.",
    image: slide2,
    duration: 9000
  },
  {
    text: "The village welcomes you—some with kindness, others with suspicion. Every choice you make will shape your standing among them. Will you thrive, or merely survive?",
    image: slide3,
    duration: 9000
  },
  {
    text: "An old ledger… forgotten records… a connection to the castle itself? Fate beckons. What was lost might yet be reclaimed.",
    image: slide4,
    duration: 9000
  },
  {
    text: "Farmer, merchant, scholar, or something more? The road ahead is yours to walk. Will you honor your ancestors—or forge a new legacy of your own?",
    image: slide5,
    duration: 9000
  }
];

const Cutscene = ({ onComplete }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const { playClick } = useSound();

  useEffect(() => {
    if (currentScene < scenes.length) {
      const timer = setTimeout(() => {
        if (currentScene === scenes.length - 1) {
          setIsExiting(true);
          setTimeout(() => {
            onComplete();
          }, 1000);
        } else {
          setCurrentScene(prev => prev + 1);
        }
      }, scenes[currentScene].duration);

      return () => clearTimeout(timer);
    }
  }, [currentScene, onComplete]);

  const handleSkip = () => {
    playClick();
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const handleImageError = (e) => {
    console.error('Error loading image:', e.target.src);
    e.target.style.display = 'none';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-50 px-4 py-2 text-white bg-black/30 rounded-lg hover:bg-black/50 transition-colors"
      >
        Skip
      </button>

      {/* Scene content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative w-full h-full"
        >
          {/* Background Image */}
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <img
              src={scenes[currentScene].image}
              alt={`Scene ${currentScene + 1}`}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            {/* Subtle dark overlay */}
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>

          {/* Text Content */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-3xl text-center"
            >
              <div className="inline-block px-6 py-4 bg-black/40 backdrop-blur-sm rounded-lg">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-relaxed">
                  {scenes[currentScene].text}
                </h2>
              </div>
            </motion.div>
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {scenes.map((_, index) => (
              <motion.div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentScene ? 'bg-white' : 'bg-white/30'
                }`}
                animate={{
                  scale: index === currentScene ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Cutscene; 