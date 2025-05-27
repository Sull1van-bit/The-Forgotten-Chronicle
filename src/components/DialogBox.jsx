import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../context/SoundContext';
import { useDialog } from '../context/DialogContext';

// Import character portraits (keep expression portraits for non-neutral expressions)
import louiseAngry from '../assets/characters/louise/angry.png';
import louiseHappy from '../assets/characters/louise/happy.png';
// import louiseSmile from '../assets/characters/louise/smile.png'; // We will use character.png for smile
import louiseVeryHappy from '../assets/characters/louise/veryHappy.png';

import eugeneAngry from '../assets/characters/eugene/angry.png';
import eugeneHappy from '../assets/characters/eugene/happy.png';
// import eugeneSmile from '../assets/characters/eugene/smile.png'; // We will use character.png for smile
import eugeneVeryHappy from '../assets/characters/eugene/veryHappy.png';

// Import general character portraits for neutral expression
import louisePortrait from '../assets/characters/louise/character.png';
import eugenePortrait from '../assets/characters/eugene/character.png';
import alexPortrait from '../assets/characters/alex/character.png';
import elderPortrait from '../assets/npc/elder/character.png';
import merchantPortrait from '../assets/npc/merchant/character.png';
import blacksmithPortrait from '../assets/npc/blacksmith/character.png';

// Map character names and expressions to portrait images
const portraits = {
  louise: {
    angry: louiseAngry,
    happy: louiseHappy,
    // Use general portrait for 'smile'
    smile: louisePortrait,
    veryHappy: louiseVeryHappy,
    // Default portrait if expression is not found
    default: louisePortrait,
  },
  // Alex uses only character.png for all expressions
  alex: {
    angry: alexPortrait,
    happy: alexPortrait,
    smile: alexPortrait,
    veryHappy: alexPortrait,
    neutral: alexPortrait,
    default: alexPortrait,
  },
  eugene: {
    angry: eugeneAngry,
    happy: eugeneHappy,
    // Use general portrait for 'smile'
    smile: eugenePortrait,
    veryHappy: eugeneVeryHappy,
     // Default portrait if expression is not found
    default: eugenePortrait,
  },
  'village elder': {
    neutral: elderPortrait,
    default: elderPortrait,
  },
  'merchant': {
    neutral: merchantPortrait,
    default: merchantPortrait,
  },
  'blacksmith': {
    neutral: blacksmithPortrait,
    default: blacksmithPortrait,
  },
  'village blacksmith': {
    neutral: blacksmithPortrait,
    default: blacksmithPortrait,
  },
};

const DialogBox = ({ onAdvance }) => {
  const { playExit, playDialog } = useSound();
  const { currentDialog, dialogIndex, advanceDialog, endDialog, isDialogActive } = useDialog();
  const characterName = currentDialog?.characterName; // Get from context
  const expression = currentDialog?.expression; // Get from context
  // Get current line from context with robust checks
  const dialogue = (currentDialog && currentDialog.dialogue && Array.isArray(currentDialog.dialogue) && currentDialog.dialogue.length > dialogIndex)
    ? currentDialog.dialogue[dialogIndex]
    : '';

  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAdvanceButton, setShowAdvanceButton] = useState(false);
  const typingSpeed = 20; // Milliseconds per character
  const typingTimeoutRef = useRef(null);
  const typingIntervalRef = useRef(null); // Ref for the typing interval

  // Effect for typing animation and dialog progression
  useEffect(() => {
    console.log('DialogBox useEffect triggered.', { currentDialog, dialogIndex, isDialogActive }); // Debug log
    
    // Reset states when dialog changes
    setDisplayText('');
    setIsTyping(false);
    setShowAdvanceButton(false);
    
    // Clear any existing intervals/timeouts
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Only start typing if we have valid dialog content
    if (isDialogActive && currentDialog?.dialogue?.[dialogIndex]) {
      const fullText = currentDialog.dialogue[dialogIndex];
      console.log('Starting typing for line:', dialogIndex, 'Text:', fullText); // Debug log
      
      // Play dialog sound when dialog appears
      playDialog();
      
      let index = 0;
      const timer = setInterval(() => {
        if (index < fullText.length) {
          setDisplayText(prev => fullText.substring(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          typingIntervalRef.current = null;
          setIsTyping(false);
          setShowAdvanceButton(true);
        }
      }, typingSpeed);
      
      typingIntervalRef.current = timer;
    }

    // Cleanup function
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [currentDialog, dialogIndex, isDialogActive, typingSpeed, playDialog]);

  const handleClick = () => {
    console.log('DialogBox clicked.', { isTyping, showAdvanceButton, dialogIndex }); // Debug log
    // If currently typing, skip to the end.
    if (isTyping) {
      console.log('Clicking while typing, skipping to end.'); // Debug log
      const fullText = currentDialog.dialogue[dialogIndex];
      setDisplayText(fullText);
      setIsTyping(false);
      setShowAdvanceButton(true);
      // Clear the typing interval and timeout when skipping
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    } else {
      // If not typing, advance the dialog.
      console.log('Clicking while not typing, attempting to advance.'); // Debug log
      onAdvance();
    }
  };

  // Get the correct portrait based on character and expression
  const characterKey = characterName ? String(characterName).toLowerCase() : 'unknown';
  // Get portrait based on character and expression, default to general if expression not found
  const portraitSrc = portraits[characterKey] ? (portraits[characterKey][expression] || portraits[characterKey].default) : null;

  return (
    // Only render the dialog box if a dialog is active and currentDialog is set
    <>
      {isDialogActive && currentDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-auto"
          // Remove background overlay from DialogBox component, it will be handled by the parent
          // style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        >
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            className="relative w-full max-w-4xl bg-[#8B4513] p-6 rounded-lg border-8 border-[#D2B48C] shadow-lg flex items-start space-x-6"
            style={{
              // Keep portrait on the right and text on the left layout
              alignItems: 'center', // Vertically align items in the flex container
              flexDirection: 'row-reverse', // Arrange items in reverse order (portrait on right)
              justifyContent: 'flex-end', // Align content to the end (right)
              padding: '10px 20px', // Adjust padding to fit the new layout
            }}
            onClick={handleClick}
          >
            {/* Text Area */}
            <div className="flex-grow flex flex-col justify-center ml-4">
              {characterName && (
                <h3 className="text-xl font-bold mb-2 text-[#F5DEB3]">{characterName}</h3>
              )}
              <p className="text-[#DEB887] text-lg leading-relaxed">{displayText}</p>
            </div>

            {/* Portrait Area (Moved to the right and styled as before) */}
            {portraitSrc && (
              <div className="w-20 h-auto flex-shrink-0 border border-[#CCA43B] p-1 bg-[#0D0D0D] flex items-center justify-center">
                <img src={portraitSrc} alt={`${characterName || 'Character'} ${expression}`} className="w-full h-full object-contain pixelated" />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default DialogBox; 