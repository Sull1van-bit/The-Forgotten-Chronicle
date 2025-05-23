import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import CircularGallery, { App } from './CircularGallery';
import { useSound } from '../context/SoundContext';
import { MusicProvider } from '../context/MusicContext';

// Import character images
import eugeneImage from '../assets/characters/eugene/character.png';
import alexImage from '../assets/characters/alex/character.png';
import louiseImage from '../assets/characters/louise/character.png';

// TODO: Import Firebase auth hooks and context if using a provider
// import { useAuth } from '../context/AuthContext';

export default function CharacterSelection({ onSelect, onClose }) {
  const [galleryItems, setGalleryItems] = useState([]);
  const { playExit, playHover } = useSound();
  const BEND_VALUE = 5;
  const TEXT_COLOR = "#ffffff";
  const BORDER_RADIUS = 0.05;
  const FONT = "bold 30px 'Press Start 2P'";

  // State for character selection confirmation
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [characterToConfirm, setCharacterToConfirm] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const containerRef = useRef(null);
  const appInstanceRef = useRef(null);

  const handleCenteredCardChange = (character, position) => {
    if (!character) return;
    setSelectedCharacter(prevCharacter => {
      if (prevCharacter?.id !== character.id) {
        return character;
      }
      return prevCharacter;
    });
  };

  const handleCharacterSelect = (character) => {
    if (!character) return;
    setCharacterToConfirm(character);
    setShowConfirmation(true);
  };

  // Effect to load character images and set gallery items
  useEffect(() => {
    const characters = [
      { 
        id: 1, 
        name: "Eugene", 
        image: eugeneImage, 
        description: "A humble peasant from the northern villages",
        bend: "fire"
      },
      { 
        id: 2, 
        name: "Alex", 
        image: alexImage, 
        description: "A hardworking peasant from the eastern farmlands",
        bend: "water"
      },
      { 
        id: 3, 
        name: "Louise", 
        image: louiseImage, 
        description: "A resilient peasant from the southern plains",
        bend: "air"
      }
    ];

    const loadImages = async () => {
      const items = await Promise.all(
        characters.map(async (char) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = char.image;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = (e) => {
              console.error(`Failed to load image: ${char.image}`, e);
              reject(e);
            };
          });
          return {
            image: char.image,
            text: char.name,
            description: char.description,
            id: char.id
          };
        })
      );
      setGalleryItems([...items, ...items]);
    };

    loadImages().catch(error => {
      console.error('Error loading images:', error);
    });
  }, []);

  // Effect to initialize and clean up the CircularGallery (OGL App instance)
  useEffect(() => {
    console.log('CircularGallery initialization effect triggered');
    if (!containerRef.current || galleryItems.length === 0) {
      console.log('CircularGallery initialization effect: Container or items not ready. Skipping App initialization.');
      return;
    }

    if (appInstanceRef.current) {
      console.log('CircularGallery initialization effect: Destroying existing App instance.');
      appInstanceRef.current.destroy();
      appInstanceRef.current = null;
    }

    console.log('CircularGallery initialization effect: Initializing new App instance.');
    const itemsWithOverlay = galleryItems.map(item => ({
      ...item,
      overlayImage: item.overlayImage || '',
    }));

    const app = new App(containerRef.current, {
      items: itemsWithOverlay,
      bend: BEND_VALUE,
      textColor: TEXT_COLOR,
      borderRadius: BORDER_RADIUS,
      font: FONT,
      onCenteredCardChange: handleCenteredCardChange,
      onCardClick: handleCharacterSelect
    });

    appInstanceRef.current = app;

    const selectInitialCharacter = setTimeout(() => {
      if (itemsWithOverlay.length > 0 && handleCenteredCardChange) {
        console.log('Manually triggering handleCenteredCardChange for initial item');
        handleCenteredCardChange(itemsWithOverlay[0], null);
      }
    }, 100);

    return () => {
      console.log('CircularGallery initialization effect cleanup: Destroying App instance.');
      clearTimeout(selectInitialCharacter);
      if (appInstanceRef.current) {
        appInstanceRef.current.destroy();
        appInstanceRef.current = null;
      }
    };
  }, [galleryItems, BEND_VALUE, TEXT_COLOR, BORDER_RADIUS, FONT, handleCenteredCardChange, handleCharacterSelect, playHover]);

  const handleClose = () => {
    playExit();
    onClose();
  };

  const handleConfirmSelection = () => {
    onSelect(characterToConfirm);
    setShowConfirmation(false);
    setCharacterToConfirm(null);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setCharacterToConfirm(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
    >
      {/* Title */}
      <h2 className="text-3xl font-bold mb-8 text-white z-20 mt-16">CHOOSE YOUR CHARACTER!</h2>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-0"
      >
        ✕
      </button>

      {/* Character Gallery */}
      <div ref={containerRef} className="h-[90vh] w-full relative z-30 py-8">
        {galleryItems.length > 0 ? (
          <CircularGallery
            items={galleryItems}
            bend={5}
            textColor="#ffffff"
            borderRadius={0.05}
            font="bold 30px 'Press Start 2P'"
            onCenteredCardChange={handleCenteredCardChange}
            onCardClick={handleCharacterSelect}
            // Card size is handled internally by CircularGallery's onResize, not via these props
            // cardWidth={100}
            // cardHeight={180}
            // scale={0.5}
          />
        ) : (
          <div className="text-white text-center">Loading characters...</div>
        )}
         {/* Center Marker */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '0',
            bottom: '0',
            width: '2px',
            backgroundColor: 'red',
            zIndex: 9999,
            transform: 'translateX(-50%)'
          }}
        ></div>
      </div>

      {/* Character Description and Choose Button */}
      {selectedCharacter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-32 left-0 right-0 text-center text-white z-40"
        >
          {/* Removed character description */}
          {/* <p className="mb-4 opacity-75">{selectedCharacter.description}</p> */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCharacterSelect(selectedCharacter)}
            className="px-8 py-3 bg-[#8B4513] text-[#F5DEB3] rounded-lg border-4 border-[#D2B48C] hover:bg-[#A0522D] transition-colors font-bold text-lg"
          >
            Choose This Character
          </motion.button>
          <p className="mt-4 text-sm opacity-75">Click and drag to browse characters</p>
        </motion.div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && characterToConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-05"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="bg-[#8B4513] p-8 rounded-lg border-8 border-[#D2B48C] shadow-lg text-center text-[#F5DEB3] max-w-md w-full mx-4"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Confirm Selection</h3>
              <p className="text-xl">Are you sure you want to use {characterToConfirm.text}?</p>
            </div>

            <div className="flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmSelection}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
              >
                Yes, Select
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelConfirmation}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Wrapper component that uses the music context
function MainMenuContent() {
  // ... existing code ...
}

// Main component that provides the music context
export function MainMenu() {
  return (
    <MusicProvider>
      <MainMenuContent />
    </MusicProvider>
  );
} 