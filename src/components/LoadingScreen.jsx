import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const medievalJokes = [
  "Why did the knight go to the doctor? Because he had a jousting injury!",
  "What do you call a medieval knight who's afraid to fight? Sir Render!",
  "Why did the dragon go to the tavern? To get a knight cap!",
  "What did the medieval farmer say when he lost his horse? 'I've got a stable problem!'",
  "Why did the castle guard get fired? He kept falling asleep on the job!",
  "What do you call a medieval knight who's always late? Sir Cumference!",
  "Why did the wizard go to the bakery? To get a spell of bread!",
  "What did the medieval blacksmith say to his apprentice? 'You're really hammering it home!'",
  "Why did the knight take a bath? Because he was feeling a bit rusty!",
  "What do you call a medieval knight who's good at math? Sir Cumference!",
  "Why did the dragon go to the dentist? To get his teeth sharpened!",
  "What did the medieval baker say when his bread was stolen? 'That's the yeast of my problems!'",
  "Why did the knight go to the library? To check out some knight reading!",
  "What do you call a medieval knight who's always cold? Sir Chills-a-lot!",
  "Why did the wizard's spell fail? He forgot to dot his i's and cross his t's!"
];

const LoadingScreen = () => {
  const [currentJoke, setCurrentJoke] = useState('');

  useEffect(() => {
    // Set initial joke
    setCurrentJoke(medievalJokes[Math.floor(Math.random() * medievalJokes.length)]);

    // Change joke every 5 seconds
    const interval = setInterval(() => {
      setCurrentJoke(medievalJokes[Math.floor(Math.random() * medievalJokes.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
    >
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 mb-4 mx-auto border-4 border-white border-t-transparent rounded-full"
        />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Loading...
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mb-4"
        >
          Please wait while we prepare your adventure
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-md mx-auto p-4 bg-gray-800 rounded-lg"
        >
          <p className="text-[#F5DEB3] italic">
            "{currentJoke}"
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen; 