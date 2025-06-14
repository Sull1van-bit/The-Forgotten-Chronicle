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
    smile: louisePortrait,
    veryHappy: louiseVeryHappy,
    neutral: louisePortrait,
    default: louisePortrait,
  },
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
    smile: eugenePortrait,
    veryHappy: eugeneVeryHappy,
    neutral: eugenePortrait,
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
  
  // Handle both old string format and new object format for dialogue
  const getCurrentDialogData = () => {
    if (!currentDialog?.dialogue?.[dialogIndex]) return { speaker: '', text: '', expression: 'neutral' };
    
    const currentLine = currentDialog.dialogue[dialogIndex];
    
    // If it's the new object format with speaker/text
    if (typeof currentLine === 'object' && currentLine.speaker && currentLine.text) {
      return {
        speaker: currentLine.speaker,
        text: currentLine.text,
        expression: currentLine.expression || 'neutral'
      };
    }
    
    // If it's the old string format, use the main character
    if (typeof currentLine === 'string') {
      return {
        speaker: currentDialog.characterName || 'Character',
        text: currentLine,
        expression: currentDialog.expression || 'neutral'
      };
    }
    
    return { speaker: '', text: '', expression: 'neutral' };
  };
  
  const dialogData = getCurrentDialogData();
  const characterName = dialogData.speaker;
  const expression = dialogData.expression;
  const dialogue = dialogData.text;

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
      const dialogData = getCurrentDialogData();
      const fullText = dialogData.text;
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
      const fullText = dialogue; // Use the parsed dialogue text
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
      advanceDialog();
    }
  };

  // Get the correct portrait based on character and expression
  const getCharacterPortrait = (characterName, expression) => {
    if (!characterName) return null;
    
    const characterKey = String(characterName).toLowerCase();
    
    // Check direct character name matches first
    if (portraits[characterKey]) {
      return portraits[characterKey][expression] || portraits[characterKey].default;
    }
    
    // Handle dynamic character names (Eugene, Alex, Louise)
    if (characterKey === 'eugene' || characterKey.includes('eugene')) {
      return portraits.eugene[expression] || portraits.eugene.default;
    }
    if (characterKey === 'alex' || characterKey.includes('alex')) {
      return portraits.alex[expression] || portraits.alex.default;
    }
    if (characterKey === 'louise' || characterKey.includes('louise')) {
      return portraits.louise[expression] || portraits.louise.default;
    }
    
    // Handle common character/player terms
    if (characterKey === 'character' || characterKey === 'player') {
      // Default to Eugene portrait for generic character
      return portraits.eugene[expression] || portraits.eugene.default;
    }
    
    return null;
  };

  const portraitSrc = getCharacterPortrait(characterName, expression);

  return (
    // Only render the dialog box if a dialog is active and currentDialog is set
    <>
      {isDialogActive && currentDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-auto"
          onClick={handleClick}
          // Remove background overlay from DialogBox component, it will be handled by the parent
          // style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        >
          {/* Skip Button - Top Right of Screen */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering dialog advance
              playExit();
              endDialog();
            }}
            className="absolute top-4 right-4 text-[#F5DEB3] hover:text-white transition-colors z-10"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              border: '2px solid #D2B48C',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Skip
          </button>

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
            onClick={(e) => e.stopPropagation()} // Prevent dialog box clicks from bubbling up
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