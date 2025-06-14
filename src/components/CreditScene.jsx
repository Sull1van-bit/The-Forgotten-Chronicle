import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Import all photos
import foto1 from '../assets/ending/foto1.jpg';
import foto2 from '../assets/ending/foto2.jpg';
import foto3 from '../assets/ending/foto3.jpg';
import foto4 from '../assets/ending/foto4.jpg';
import foto5 from '../assets/ending/foto5.jpg';
import foto6 from '../assets/ending/foto6.jpg';
import foto7 from '../assets/ending/foto7.jpg';
import foto8 from '../assets/ending/foto8.jpg';
import foto9 from '../assets/ending/foto9.jpg';
import foto10 from '../assets/ending/foto10.jpg';
import foto11 from '../assets/ending/foto11.jpg';
import foto12 from '../assets/ending/foto12.jpg';
import foto13 from '../assets/ending/foto13.jpg';
import foto14 from '../assets/ending/foto14.jpg';
import foto15 from '../assets/ending/foto15.jpg';
import foto16 from '../assets/ending/foto16.jpg';
import foto17 from '../assets/ending/foto17.jpg';
import foto18 from '../assets/ending/foto18.jpg';

// Import videos
import video1 from '../assets/ending/video1.mp4';
import video2 from '../assets/ending/video2.mp4';

// Import music
import endingMusic from '../assets/ending/The Clash - Should I Stay or Should I Go (Official Audio) [BN1WwnEDWAM].mp3';

const CreditScene = ({ onComplete }) => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState('blackout'); // blackout, toContinue, studio, credits
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [mediaPosition, setMediaPosition] = useState({ top: '8%', right: '8%' });
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // All media assets (photos and videos)
  const mediaAssets = [
    { type: 'image', src: foto1 },
    { type: 'image', src: foto2 },
    { type: 'image', src: foto3 },
    { type: 'image', src: foto4 },
    { type: 'image', src: foto5 },
    { type: 'image', src: foto6 },
    { type: 'image', src: foto7 },
    { type: 'image', src: foto8 },
    { type: 'image', src: foto9 },
    { type: 'image', src: foto10 },
    { type: 'image', src: foto11 },
    { type: 'image', src: foto12 },
    { type: 'image', src: foto13 },
    { type: 'image', src: foto14 },
    { type: 'image', src: foto15 },
    { type: 'image', src: foto16 },
    { type: 'image', src: foto17 },
    { type: 'image', src: foto18 },
    { type: 'video', src: video1 },
    { type: 'video', src: video2 },
  ];  useEffect(() => {
    // Start the music immediately
    if (audioRef.current) {
      setTimeout(() => {
        audioRef.current.play().catch(error => {
          console.log('Auto-play prevented:', error);
        });
      }, 100);
    }    // Start the sequence with smoother timing
    const timer1 = setTimeout(() => setCurrentPhase('toContinue'), 2000);
    const timer2 = setTimeout(() => setCurrentPhase('studio'), 6000); // Extended time for smoother transition
    const timer3 = setTimeout(() => {
      setCurrentPhase('credits');
    }, 10000); // Extended total time    // Backup timer to complete credits after music duration (3:09 = 189 seconds)
    const redirectTimer = setTimeout(() => {
      onComplete();
    }, 189000); // 189 seconds = 3 minutes 9 seconds

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(redirectTimer);
    };}, []);

  // Cleanup music on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);
  // Handle media cycling during credits
  useEffect(() => {
    if (currentPhase === 'credits') {
      const mediaTimer = setInterval(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % mediaAssets.length);
        // Randomize position for each new media
        const positions = [
          { top: '8%', right: '8%' },
          { top: '8%', left: '8%' },
          { top: '50%', right: '8%' },
          { top: '50%', left: '8%' },
          { bottom: '20%', right: '8%' },
          { bottom: '20%', left: '8%' },
          { top: '25%', right: '15%' },
          { top: '25%', left: '15%' },
        ];        const randomPosition = positions[Math.floor(Math.random() * positions.length)];
        setMediaPosition(randomPosition);
      }, 5000); // Change media every 5 seconds - longer duration

      return () => clearInterval(mediaTimer);
    }
  }, [currentPhase, mediaAssets.length]);  // Handle audio end - complete credits
  const handleAudioEnd = () => {
    // Call onComplete when music ends
    onComplete();
  };

  const renderMedia = () => {
    const currentMedia = mediaAssets[currentMediaIndex];
    
    if (currentMedia.type === 'image') {
      return (        <motion.div
          key={`image-${currentMediaIndex}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="w-80 h-60 bg-white p-4 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300"
        >          <img
            src={currentMedia.src}
            alt={`Memory ${currentMediaIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </motion.div>
      );
    } else {
      return (        <motion.div
          key={`video-${currentMediaIndex}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="w-80 h-60 bg-white p-4 shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-300"
        >          <video
            ref={videoRef}
            src={currentMedia.src}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover object-top"
          />
        </motion.div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
      {/* Background music */}
      <audio
        ref={audioRef}
        src={endingMusic}
        onEnded={handleAudioEnd}
        preload="auto"
      />

      {/* Black screen phase */}
      <AnimatePresence mode="wait">
        {currentPhase === 'blackout' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="w-full h-full flex items-center justify-center"
          >
            <div className="w-full h-full bg-black"></div>
          </motion.div>
        )}        {/* "To be continued..." phase */}
        {currentPhase === 'toContinue' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full h-full flex items-center justify-center"
          >
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ 
                duration: 1.5, 
                ease: "easeInOut",
                exit: { duration: 1.5, ease: "easeInOut" }
              }}
              className="text-6xl font-bold text-white text-center"
              style={{ fontFamily: 'serif' }}
            >
              TO BE CONTINUED...
            </motion.h1>
          </motion.div>
        )}

        {/* Studio name phase */}
        {currentPhase === 'studio' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full h-full flex items-center justify-center"
          >
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ 
                duration: 1.5, 
                ease: "easeInOut",
                exit: { duration: 1.5, ease: "easeInOut" }
              }}
              className="text-7xl font-bold text-white text-center tracking-wider"
              style={{ fontFamily: 'serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              P.U.N.K STUDIOS
            </motion.h1>
          </motion.div>
        )}

        {/* Credits phase */}
        {currentPhase === 'credits' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full relative"
          >
            {/* Background with subtle pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
              {/* Media showcase */}
            <div 
              className="absolute z-10"
              style={mediaPosition}
            >
              <AnimatePresence mode="wait">
                {renderMedia()}
              </AnimatePresence>
            </div>            {/* Rolling credits */}            <motion.div
              initial={{ y: '100vh' }}
              animate={{ y: '-100vh' }}              transition={{
                duration: 180, // 3 minutes - slower roll to match content
                ease: 'linear',
              }}
              className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-8"
            >
              <div className="text-center space-y-20 py-20">
                <h2 className="text-6xl font-bold text-center text-[#F5DEB3]">
                  CREDITS
                </h2>
                
                <div className="space-y-16 text-[#DEB887]">
                  <div className="text-center">
                    <h3 className="text-3xl font-semibold mb-6 text-[#F5DEB3]">Game Development</h3>
                    <p className="text-2xl leading-relaxed">P.U.N.K Team</p>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-3xl font-semibold mb-6 text-[#F5DEB3]">Art & Design</h3>
                    <p className="text-2xl leading-relaxed">Gading Kelana Putra - 00000111323</p>
                    <p className="text-2xl leading-relaxed">Chat GPT - xxxxxxxx</p>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-3xl font-semibold mb-6 text-[#F5DEB3]">Programming</h3>
                    <div className="space-y-2">
                      <p className="text-2xl leading-relaxed">Naufal Rabbani - 00000108931</p>
                      <p className="text-2xl leading-relaxed">Abid Irsyad Dinejad - 00000111284</p>
                      <p className="text-2xl leading-relaxed">Rafael Romelo Gibran - 00000111248</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-3xl font-semibold mb-6 text-[#F5DEB3]">Special Thanks To:</h3>
                    <div className="space-y-2">
                      <p className="text-2xl leading-relaxed">Allah SWT & Jesus Christ</p>
                      <p className="text-2xl leading-relaxed">Pak Wawo</p>
                      <p className="text-2xl leading-relaxed">Dian Fajrina Rahmatunisa (choji)</p>
                      <p className="text-2xl leading-relaxed">Nadine Putri</p>
                      <p className="text-2xl leading-relaxed">Melisa Chiufin</p>
                      <p className="text-2xl leading-relaxed">Nabila Yunita</p>
                    </div>                  </div>

                  <div className="text-center">
                    <h3 className="text-3xl font-semibold mb-6 text-[#F5DEB3]">Built With</h3>
                    <div className="space-y-2">
                      <p className="text-2xl leading-relaxed">React</p>
                      <p className="text-2xl leading-relaxed">Tailwind CSS</p>
                      <p className="text-2xl leading-relaxed">Claude Sonnet 4</p>
                      <p className="text-2xl leading-relaxed">Visual Studio Code</p>
                      <p className="text-2xl leading-relaxed">Tiled</p>
                      <p className="text-2xl leading-relaxed">Aseprite</p>
                      <p className="text-2xl leading-relaxed">HTML</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-3xl font-semibold mb-6 text-[#F5DEB3]">And Thanks To</h3>
                    <p className="text-2xl leading-relaxed">All of Class C ❤️</p>
                  </div>
                </div>
                
                <div className="mt-20 text-center text-xl text-[#DEB887]">
                  <p className="mb-4">Thank you for playing</p>
                  <p className="text-2xl font-bold text-[#F5DEB3]">THE FORGOTTEN CHRONICLE</p>
                  <p className="mt-8">© P.U.N.K 2025 - All Rights Reserved</p>
                </div>

                {/* Add some extra spacing at the end */}
                <div className="h-screen"></div>
              </div>
            </motion.div>

            {/* Skip button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={onComplete}
              className="absolute bottom-8 right-8 bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg hover:bg-opacity-70 transition-colors text-lg"
            >
              Skip Credits
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreditScene;
