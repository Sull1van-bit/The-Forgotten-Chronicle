import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../context/SoundContext';
import { useDialog } from '../context/DialogContext';

// Import character portraits
import louiseAngry from '../assets/characters/louise/angry.png';
import louiseHappy from '../assets/characters/louise/happy.png';
import louiseSmile from '../assets/characters/louise/smile.png';
import louiseVeryHappy from '../assets/characters/louise/veryHappy.png';

// Commented out imports for other characters (assuming similar file structure)
// import alexAngry from '../assets/characters/alex/angry.png';
// import alexHappy from '../assets/characters/alex/happy.png';
// import alexSmile from '../assets/characters/alex/smile.png';
// import alexVeryHappy from '../assets/characters/alex/veryHappy.png';

import eugeneAngry from '../assets/characters/eugene/angry.png';
import eugeneHappy from '../assets/characters/eugene/happy.png';
import eugeneSmile from '../assets/characters/eugene/smile.png';
import eugeneVeryHappy from '../assets/characters/eugene/veryHappy.png';

// Map character names and expressions to portrait images
const portraits = {
  louise: {
    angry: louiseAngry,
    happy: louiseHappy,
    smile: louiseSmile,
    veryHappy: louiseVeryHappy,
  },
  // Add other characters here when portraits are ready
  // alex: {
  //   angry: alexAngry,
  //   // ... other alex expressions
  // },
  eugene: {
    angry: eugeneAngry,
    happy: eugeneHappy,
    smile: eugeneSmile,
    veryHappy: eugeneVeryHappy,
  },
};

const DialogBox = ({ characterName, expression, dialogue, onAdvance }) => {
  const { playExit } = useSound();
  const { setIsDialogActive } = useDialog();
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const typingSpeed = 20; // Milliseconds per character

  useEffect(() => {
    setIsDialogActive(true);
    return () => setIsDialogActive(false);
  }, [setIsDialogActive]);

  // Typing effect
  useEffect(() => {
    setIsTypingComplete(false);
    setDisplayedText('');
    let index = 0;
    const timer = setInterval(() => {
      if (index < dialogue.length) {
        setDisplayedText(dialogue.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsTypingComplete(true);
      }
    }, typingSpeed);

    return () => clearInterval(timer); // Cleanup timer on unmount or dialogue change
  }, [dialogue, typingSpeed]);

  const handleClick = () => {
    if (isTypingComplete) {
      onAdvance();
    } else {
      // Skip typing animation and show full text immediately
      setDisplayedText(dialogue);
      setIsTypingComplete(true);
    }
  };

  // Get the correct portrait based on character and expression
  const characterKey = characterName ? characterName.toLowerCase() : 'unknown';
  const portraitSrc = portraits[characterKey] ? portraits[characterKey][expression] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }} // Semi-transparent dark overlay
    >
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="relative w-full max-w-4xl bg-[#8B4513] p-6 rounded-lg border-8 border-[#D2B48C] shadow-lg flex items-start space-x-6"
        onClick={handleClick}
      >
        {/* Portrait Area */}
        {portraitSrc && (
          <div className="w-32 h-auto flex-shrink-0">
            <img src={portraitSrc} alt={`${characterName || 'Character'} ${expression}`} className="w-full h-full object-contain pixelated" />
          </div>
        )}

        {/* Text Area */}
        <div className="flex-grow">
          {characterName && (
            <h3 className="text-xl font-bold mb-2 text-[#F5DEB3]">{characterName}</h3>
          )}
          <p className="text-[#DEB887] text-lg leading-relaxed">{displayedText}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DialogBox; 