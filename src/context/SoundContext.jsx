import React, { createContext, useContext, useState, useRef } from 'react';
import clickSound from '../assets/sfx/click.wav';
import hoverSound from '../assets/sfx/hover.wav';
import exitSound from '../assets/sfx/exit.wav';
import cashSound from '../assets/sfx/cash.wav';
import dialogSound from '../assets/sfx/dialog.wav';
import newQuestSound from '../assets/sfx/newQuest.mp3';
import plantSound from '../assets/sfx/plant.mp3';
import harvestSound from '../assets/sfx/harvest.mp3';
import wateringSound from '../assets/sfx/watering.mp3';

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sfxVolume, setSfxVolume] = useState(100);
    const clickAudioRef = useRef(new Audio(clickSound));  const hoverAudioRef = useRef(new Audio(hoverSound));
  const exitAudioRef = useRef(new Audio(exitSound));
  const cashAudioRef = useRef(new Audio(cashSound));
  const dialogAudioRef = useRef(new Audio(dialogSound));  const newQuestAudioRef = useRef(new Audio(newQuestSound));
  const plantAudioRef = useRef(new Audio(plantSound));
  const harvestAudioRef = useRef(new Audio(harvestSound));
  const wateringAudioRef = useRef(new Audio(wateringSound));

  const playClick = () => {
    if (soundEnabled) {
      const audio = clickAudioRef.current;
      audio.volume = sfxVolume / 100;
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Error playing click sound:', error);
      });
    }
  };

  const playHover = () => {
    if (soundEnabled) {
      const audio = hoverAudioRef.current;
      audio.volume = sfxVolume / 100;
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Error playing hover sound:', error);
      });
    }
  };

  const playExit = () => {
    if (soundEnabled) {
      const audio = exitAudioRef.current;
      audio.volume = sfxVolume / 100;
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Error playing exit sound:', error);
      });
    }
  };

  const playCash = () => {
    if (soundEnabled) {
      const audio = cashAudioRef.current;
      audio.volume = sfxVolume / 100;
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Error playing cash sound:', error);
      });
    }
  };
  const playDialog = () => {
    if (soundEnabled) {
      const audio = dialogAudioRef.current;
      audio.volume = sfxVolume / 100;
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Error playing dialog sound:', error);
      });
    }
  };
  const playNewQuest = () => {
    if (soundEnabled) {
      const audio = newQuestAudioRef.current;
      audio.volume = sfxVolume / 100;
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Error playing new quest sound:', error);
      });
    }
  };
  const playPlant = () => {
    if (soundEnabled) {
      const audio = plantAudioRef.current;
      audio.volume = sfxVolume / 100;
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Error playing plant sound:', error);
      });
    }
  };

  const playHarvest = () => {
    if (soundEnabled) {
      const audio = harvestAudioRef.current;
      audio.volume = sfxVolume / 100;
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Error playing harvest sound:', error);
      });
    }
  };

  const playWatering = () => {
    if (soundEnabled) {
      const audio = wateringAudioRef.current;
      audio.volume = sfxVolume / 100;
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Error playing watering sound:', error);
      });
    }
  };
  return (
    <SoundContext.Provider value={{
      soundEnabled,
      setSoundEnabled,
      sfxVolume,      setSfxVolume,
      playClick,      playHover,
      playExit,
      playCash,
      playDialog,
      playNewQuest,
      playPlant,
      playHarvest,
      playWatering
    }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
} 