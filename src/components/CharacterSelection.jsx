import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CircularGallery from './CircularGallery';
import { useSound } from '../context/SoundContext';

// Import character images
import eugeneImage from '../assets/characters/eugene/character.png';
import alexImage from '../assets/characters/alex/character.png';
import louiseImage from '../assets/characters/louise/character.png';

export default function CharacterSelection({ onSelect, onClose }) {
  const [galleryItems, setGalleryItems] = useState([]);
  const { playExit } = useSound();

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
    >
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
          />
        ) : (
          <div className="text-white text-center">Loading characters...</div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-white text-sm opacity-75 z-10">
        Click and drag to browse characters
      </div>
    </motion.div>
  );
} 