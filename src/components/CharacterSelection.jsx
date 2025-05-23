import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import CircularGallery from './CircularGallery';
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
  const { playExit } = useSound();

  // State for character selection confirmation
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [characterToConfirm, setCharacterToConfirm] = useState(null);

  useEffect(() => {
    const characters = [
      {
        id: 1,
        name: "Eugene",
        image: eugeneImage,
        description: "A humble peasant from the northern villages"
      },
      {
        id: 2,
        name: "Alex",
        image: alexImage,
        description: "A hardworking peasant from the eastern farmlands"
      },
      {
        id: 3,
        name: "Louise",
        image: louiseImage,
        description: "A resilient peasant from the southern plains"
      }
    ];

    // Preload images
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
            description: char.description
          };
        })
      );
      // Duplicate items to create a continuous loop
      setGalleryItems([...items, ...items]);
    };

    loadImages().catch(error => {
      console.error('Error loading images:', error);
    });
  }, []);

  const handleClose = () => {
    playExit();
    onClose();
  };

  // Modified handleCharacterSelect to be triggered by card click
  const handleCharacterSelect = (character) => {
    // playClick(); // Sound will be played when confirming
    console.log('Centered card clicked:', character);
    // Set state to show confirmation dialog
    setCharacterToConfirm(character);
    setShowConfirmation(true);
  };

  const handleConfirmSelection = () => {
    console.log('Confirmed character selection:', characterToConfirm);
    // Proceed with character selection
    onSelect(characterToConfirm);
    setShowConfirmation(false);
    setCharacterToConfirm(null);
  };

  const handleCancelConfirmation = () => {
    console.log('Cancelled character selection');
    // Hide confirmation dialog
    setShowConfirmation(false);
    setCharacterToConfirm(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
    >
      {/* Title */}
      <h2 className="text-3xl font-bold mb-8 text-white z-20">CHOOSE YOUR CHARACTER!</h2>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-0"
      >
        ✕
      </button>

      {/* Character Gallery */}
      <div className="h-[90vh] w-full relative z-10 py-20">
        {galleryItems.length > 0 ? (
          <CircularGallery
            items={galleryItems}
            bend={3}
            textColor="#ffffff"
            borderRadius={0.05}
            font="bold 30px 'Press Start 2P'"
            onCenteredCardChange={handleCenteredCardChange}
            onCardClick={handleCharacterSelect}
          />
        ) : (
          <div className="text-white text-center">Loading characters...</div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-white text-sm opacity-75 z-10">
        Click and drag to browse characters
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && characterToConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#8B4513] p-8 rounded-lg border-8 border-[#D2B48C] shadow-lg text-center text-[#F5DEB3]">
            <p className="text-xl mb-4">Are you sure you want to use {characterToConfirm.name}?</p>
            <button
              onClick={handleConfirmSelection}
              className="mr-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Yes
            </button>
            <button
              onClick={handleCancelConfirmation}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              No
            </button>
          </div>
        </div>
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