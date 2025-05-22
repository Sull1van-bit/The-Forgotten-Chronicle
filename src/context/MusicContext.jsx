import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import music1 from '../assets/musics/music.wav';
import music2 from '../assets/musics/music2.wav';
import music3 from '../assets/musics/music3.wav';
import music4 from '../assets/musics/music4.wav';
import music5 from '../assets/musics/music5.wav';
import music6 from '../assets/musics/music6.wav';

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [musicVolume, setMusicVolume] = useState(100);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const musicTracks = [music1, music2, music3, music4, music5, music6];
  const audioRef = useRef(new Audio(musicTracks[0]));

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = musicVolume / 100;

    const handleTrackEnd = () => {
      console.log('Track ended. Moving to next track.');
      // Move to next track
      const nextTrackIndex = (currentTrack + 1) % musicTracks.length;
      
      // Update the audio source and attempt to play immediately if music is enabled and playing
      audio.src = musicTracks[nextTrackIndex];
      audio.load(); // Ensure the new source is loaded
      console.log(`Attempting to play track ${nextTrackIndex + 1}`);

      if (musicEnabled && isPlaying) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log(`Successfully playing track ${nextTrackIndex + 1}`);
              setCurrentTrack(nextTrackIndex); // Update state AFTER successful play attempt
            }).catch(error => {
              console.error(`Error playing track ${nextTrackIndex + 1}:`, error);
              // Optionally, try to play the next track again after a short delay or handle the error
            });
          } else {
               console.log(`Play promise undefined for track ${nextTrackIndex + 1}`);
               setCurrentTrack(nextTrackIndex); // Update state even if play promise is undefined
          }
      } else {
           console.log(`Music not enabled or not playing when track ended. musicEnabled: ${musicEnabled}, isPlaying: ${isPlaying}`);
           setCurrentTrack(nextTrackIndex); // Update state even if not playing
      }
    };

    audio.addEventListener('ended', handleTrackEnd);

    return () => {
      console.log('Cleaning up ended event listener.');
      audio.removeEventListener('ended', handleTrackEnd);
      // Do not pause or reset currentTime here, as the next track might be playing
    };
  }, [musicTracks, musicEnabled, isPlaying, currentTrack]); // Added musicTracks to dependencies

  useEffect(() => {
    audioRef.current.volume = musicVolume / 100;
  }, [musicVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    // This effect primarily handles initial play/pause based on user control
    if (musicEnabled && isPlaying) {
       // If music is enabled and playing, ensure the current track is playing
       // Only attempt to play if the audio is not already playing to avoid interruptions
       if (audio.paused) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error('Error playing music (from state effect):', error);
              });
            }
       }
    } else {
      audio.pause();
    }
     // Dependencies only on user-controlled state
  }, [musicEnabled, isPlaying]);

  const startMusicPlayback = () => {
    console.log('startMusicPlayback called');
    setMusicEnabled(true);
    setIsPlaying(true);
    // The useEffect listening to musicEnabled and isPlaying will handle the actual play call
    // Ensure the audio source is the first track and loaded if not already
    const audio = audioRef.current;
    if (audio.src !== musicTracks[0]) {
         audio.src = musicTracks[0];
         audio.load();
    }
    audio.volume = musicVolume / 100;
    audio.currentTime = 0;
    // Play call is now handled by the useEffect
  };

  return (
    <MusicContext.Provider value={{
      musicEnabled,
      setMusicEnabled,
      musicVolume,
      setMusicVolume,
      currentTrack: currentTrack + 1,
      totalTracks: musicTracks.length,
      startMusicPlayback
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
} 