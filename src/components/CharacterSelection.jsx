import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../context/SoundContext';
import { MusicProvider } from '../context/MusicContext';

// Import character images
import eugeneBackground from '../assets/characters/eugene/background.png';
import eugeneCharacter from '../assets/characters/eugene/character.png';
import alexBackground from '../assets/characters/alex/background.png';
import alexCharacter from '../assets/characters/alex/character.png';
import louiseBackground from '../assets/characters/louise/background.png';
import louiseCharacter from '../assets/characters/louise/character.png';

// TODO: Import Firebase auth hooks and context if using a provider
// import { useAuth } from '../context/AuthContext';

export default function CharacterSelection({ onSelect, onClose }) {
  const { playExit, playHover, playClick } = useSound();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [characterToConfirm, setCharacterToConfirm] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const [carouselRadius, setCarouselRadius] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      const computedStyle = getComputedStyle(carouselRef.current);
      const radius = parseFloat(computedStyle.getPropertyValue('--radius')) || 250; // Default to 250 if not found
      setCarouselRadius(radius);
    }
  }, [carouselRef]);

  const characters = [
    { 
      id: 1, 
      name: "Eugene", 
      background: eugeneBackground,
      character: eugeneCharacter,
      description: "A sharp-minded farmer, ensuring survival through careful planning",
      bend: "fire"
    },
    { 
      id: 2, 
      name: "Alex", 
      background: alexBackground,
      character: alexCharacter,
      description: "This character is created as a tribute for pak wawo himself",
      bend: "water"
    },
    { 
      id: 3, 
      name: "Louise", 
      background: louiseBackground,
      character: louiseCharacter,
      description: "A spirited problem-solver, keeping the community thriving.",
      bend: "air"
    }
  ];

  const handlePrev = () => {
    playHover();
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? characters.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    playHover();
    setCurrentIndex((prevIndex) => 
      prevIndex === characters.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleCharacterSelect = (character) => {
    if (!character) return;
    playClick();
    setCharacterToConfirm(character);
    setShowConfirmation(true);
  };

  const handleClose = () => {
    playExit();
    onClose();
  };

  const handleConfirmSelection = () => {
    playClick();
    onSelect(characterToConfirm);
    setShowConfirmation(false);
    setCharacterToConfirm(null);
  };

  const handleCancelConfirmation = () => {
    playClick();
    setShowConfirmation(false);
    setCharacterToConfirm(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
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

      {/* Character Cards */}
      <div className="relative w-full h-[70vh] flex items-center justify-center">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-4 z-20 p-4 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all hover:scale-110"
        >
          ←
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 z-20 p-4 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all hover:scale-110"
        >
          →
        </button>

        {/* Cards Container */}
        <div className="carousel-container">
          <div className="carousel">
            {characters.map((character, index) => {
              const isActive = index === currentIndex;
              const totalCards = characters.length;
              const isPrev = index === (currentIndex - 1 + totalCards) % totalCards;
              const isNext = index === (currentIndex + 1) % totalCards;

              let translateXValue = 0;
              let translateYValue = 0;
              let scaleValue = 1; // Start with 1 for active, adjust others
              let opacityValue = 1; // Start with 1 for active, adjust others
              let zIndexValue = 1;

              if (isActive) {
                translateXValue = '-50%';
                translateYValue = '-50%';
                scaleValue = 1.6; // Make active card even larger and more dominant
                opacityValue = 1;
                zIndexValue = 10;
              } else if (isPrev) {
                // Position previous card much further left and down for a very strong curve and significant overlap
                translateXValue = '-125%'; // Increased horizontal displacement and overlap
                translateYValue = '-10%'; // Significantly lower position for a pronounced curve
                scaleValue = 0.6; // Much smaller than active
                opacityValue = 0.4; // Reduced opacity
                zIndexValue = 5;
              } else if (isNext) {
                // Position next card much further right and down for a very strong curve and significant overlap
                translateXValue = '25%'; // Increased horizontal displacement and overlap (relative to the card's own width)
                translateYValue = '-10%'; // Significantly lower position for a pronounced curve
                scaleValue = 0.6; // Much smaller than active
                opacityValue = 0.4; // Reduced opacity
                zIndexValue = 5;
              } else {
                // Hide other cards completely off-screen
                const positionDiff = index - currentIndex;
                translateXValue = `${(index - currentIndex) * 200}vw`; // Position extremely far horizontally
                translateYValue = '-50%'; // Keep vertically centered off-screen
                scaleValue = 0.3; // Very small scale
                opacityValue = 0;
                zIndexValue = 0;
              }

              return (
                <motion.div
                  key={character.id}
                  className="card"
                  data-character={character.name.toLowerCase()}
                  initial={false}
                  animate={{
                    translateX: translateXValue,
                    translateY: translateYValue,
                    scale: scaleValue,
                    opacity: opacityValue,
                    zIndex: zIndexValue,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 80, // Further adjusted stiffness
                    damping: 12, // Further adjusted damping
                    mass: 1,
                  }}
                  onClick={() => handleCharacterSelect(character)}
                >
                  <div className="wrapper">
                    <img src={character.background} alt={character.name} className="cover-image" />
                  </div>
                  <img src={character.character} alt={character.name} className="character" />
                  <div className="title">
                    <h3>{character.name}</h3>
                    <p>{character.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && characterToConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
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
              <p className="text-xl">Are you sure you want to use {characterToConfirm.name}?</p>
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

      <style jsx>{`
        :root {
          --card-height: 250px; /* Adjusted card height */
          --card-width: calc(var(--card-height) * 1.5);
          --radius: 250px;
        }
        * {
          box-sizing: border-box;
        }
        .carousel-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          perspective: none; /* Remove perspective for 2D */
        }
        .carousel {
          position: relative;
          /* Adjust width/height as needed for containing the curved layout */
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: flat; /* Use flat transform style for 2D */
        }
        .card {
          width: var(--card-width);
          height: var(--card-height);
          position: absolute;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          padding: 0 36px;
          /* Perspective might not be needed now */
          /* perspective: 2500px; */
          border-radius: 5px;
          /* z-index is handled by Framer Motion animate */
          /* z-index: 1; */
          /* Initial positioning at the center of the carousel container */
          left: 50%;
          top: 50%;
          cursor: pointer;
          transition: none; /* Framer Motion handles transitions */
        }
        .card.active {
          /* z-index is handled by Framer Motion animate */
          /* z-index: 10; */
        }
        .card:hover {
          /* Hover transform handled by Framer Motion */
          /* transform: scale(1.05) !important; */
        }
        .cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 5px;
        }
        .wrapper {
          transition: all 0.5s;
          position: absolute;
          width: 100%;
          z-index: -1;
          border-radius: 5px;
        }
        .card:hover .wrapper {
          transform: perspective(900px) translateY(-5%) rotateX(25deg) translateZ(0);
          box-shadow: 2px 35px 32px -8px rgba(0, 0, 0, 0.75);
          -webkit-box-shadow: 2px 35px 32px -8px rgba(0, 0, 0, 0.75);
          -moz-box-shadow: 2px 35px 32px -8px rgba(0, 0, 0, 0.75);
          border-radius: 5px;
        }
        .wrapper::before,
        .wrapper::after {
          content: "";
          opacity: 0;
          width: 100%;
          height: 80px;
          transition: all 0.5s;
          position: absolute;
          left: 0;
          border-radius: 5px;
        }
        .wrapper::before {
          top: 0;
          height: 100%;
          background-image: linear-gradient(
            to top,
            transparent 46%,
            rgba(12, 13, 19, 0.5) 68%,
            rgba(12, 13, 19) 97%
          );
          border-radius: 5px;
        }
        .wrapper::after {
          bottom: 0;
          opacity: 1;
          background-image: linear-gradient(
            to bottom,
            transparent 46%,
            rgba(12, 13, 19, 0.5) 68%,
            rgba(12, 13, 19) 97%,
          );
          border-radius: 5px;
        }
        .card:hover .wrapper::before,
        .wrapper::after {
          opacity: 1;
        }
        .card:hover .wrapper::after {
          height: 100px;
        }
        .title {
          width: 100%;
          transition: transform 0.5s;
        }
        .card:hover .title {
          transform: translate3d(0%, -40px, 100px);
        }
        .character {
          width: 60%; /* Set a consistent width for all characters */
          opacity: 0;
          transition: all 0.5s;
          position: absolute;
          left: 50%; /* Center horizontally */
          transform: translateX(-50%) translateY(0%); /* Keep centered horizontally regardless of size, base vertical position */
          z-index: -1;
        }
        .card:hover .character {
          opacity: 1;
          transform: translate3d(-50%, -30%, 100px); /* Corrected hover transform */
        }
        /* Removed specific character image adjustments for Eugene and Louise to ensure consistent sizing */
        /* Text styling */
        .title h3 {
          color: #ffffff;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5),
                       -1px -1px 0 rgba(0, 0, 0, 0.3),
                       1px -1px 0 rgba(0, 0, 0, 0.3),
                       -1px 1px 0 rgba(0, 0, 0, 0.3),
                       1px 1px 0 rgba(0, 0, 0, 0.3);
          font-weight: 800;
          letter-spacing: 0.5px;
          font-size: 1.5rem;
        }
        .title p {
          color: #f8f9fa;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          font-weight: 500;
          letter-spacing: 0.3px;
          font-size: 1.1rem;
        }
      `}</style>
    </motion.div>
  );
}

// Wrapper component that uses the music context
function MainMenuContent({ onCharacterSelect }) {
  return (
    <CharacterSelection
      onSelect={onCharacterSelect}
      onClose={() => console.log('Character selection closed')}
    />
  );
}

// Main component that provides the music context
export function MainMenu({ onCharacterSelect }) {
  return (
    <MusicProvider>
      <MainMenuContent onCharacterSelect={onCharacterSelect} />
    </MusicProvider>
  );
} 