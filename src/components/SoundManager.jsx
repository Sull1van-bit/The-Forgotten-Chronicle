import { createContext, useContext, useEffect, useRef, useState } from 'react';

// Import all 6 music tracks
import menuTrack1 from '../assets/musics/music.wav';
import menuTrack2 from '../assets/musics/music2.wav';
import menuTrack3 from '../assets/musics/music3.wav';
import menuTrack4 from '../assets/musics/music4.wav';
import menuTrack5 from '../assets/musics/music5.wav';
import menuTrack6 from '../assets/musics/music6.wav';

// SFX imports
import clickSFX from '../assets/sfx/click.wav';
import hoverSFX from '../assets/sfx/hover.wav';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const audioRefs = useRef({
    music: new Audio(),
    sfx: {
      click: new Audio(clickSFX),
      hover: new Audio(hoverSFX)
    }
  });

  const [volume, setVolume] = useState({
    master: 0.8,
    music: 0.7,
    sfx: 0.5
  });
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');

  const musicTracks = [
    menuTrack1, menuTrack2, menuTrack3,
    menuTrack4, menuTrack5, menuTrack6
  ];

  const shuffleTracks = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const playRandomMusic = () => {
    const shuffledTracks = shuffleTracks(musicTracks);
    let currentIndex = 0;

    const playNextTrack = () => {
      if (currentIndex >= shuffledTracks.length) {
        currentIndex = 0;
      }

      const track = shuffledTracks[currentIndex];
      const music = audioRefs.current.music;
      
      music.src = track;
      music.volume = isMuted ? 0 : volume.music * volume.master;
      music.loop = false;

      
      const trackName = track.split('/').pop().replace('.wav', '');
      setCurrentTrack(`Now Playing: ${trackName}`);

      music.play()
        .catch(e => console.debug('Music play blocked:', e));

      music.onended = () => {
        currentIndex++;
        playNextTrack();
      };
    };

    playNextTrack();
  };

  const playSFX = (name, options = {}) => {
    const sfx = audioRefs.current.sfx[name]?.cloneNode() || new Audio();
    sfx.volume = (options.volume || volume.sfx) * volume.master;
    sfx.playbackRate = options.rate || 1.0;
    sfx.play().catch(e => console.debug('SFX blocked:', e));
  };

  useEffect(() => {
    return () => {
      audioRefs.current.music.pause();
      audioRefs.current.music.onended = null;
    };
  }, []);

  return (
    <SoundContext.Provider value={{
      playRandomMusic,
      stopMusic: () => audioRefs.current.music.pause(),
      playSFX,
      currentTrack,
      volume,
      setVolume,
      isMuted,
      toggleMute: () => setIsMuted(!isMuted)
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);