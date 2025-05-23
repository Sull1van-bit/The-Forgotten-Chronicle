import React, { useState, useEffect, useRef } from 'react';
import { useSound } from '../context/SoundContext';
import { MusicProvider, useMusic } from '../context/MusicContext';
import backgroundVideo from '../assets/menu/background.mp4';
import gameTitleImage from '../assets/menu/title.png';
import buttonImage from '../assets/menu/button.png';
import LoginForm from '../components/loginForm';
import Credits from '../components/Credits';
import Settings from '../components/Settings';
import MusicPrompt from '../components/MusicPrompt';
import CharacterSelection from '../components/CharacterSelection';

// TODO: Import Firebase auth hooks and context if using a provider
// import { useAuth } from '../context/AuthContext';

// Wrapper component that uses the music context
function MainMenuContent() {
  const { soundEnabled, setSoundEnabled, sfxVolume, setSfxVolume, playClick, playHover } = useSound();
  const { setMusicEnabled, startMusicPlayback, musicEnabled, musicVolume, setMusicVolume } = useMusic();
  const videoRef = useRef(null);
  const [user, setUser] = useState(null);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMusicPrompt, setShowMusicPrompt] = useState(false);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);

  useEffect(() => {
    console.log('MainMenu useEffect running');
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
    
    const demoLoginTimer = setTimeout(() => {
       setUser({ uid: 'placeholder-uid' });
       setHasSavedGame(true);
       setShowMusicPrompt(true);
    }, 3000);

    return () => clearTimeout(demoLoginTimer);
  }, []);

  // Remove local login handler
  // const handleLogin = (isNew) => {
  //   setIsNewPlayer(isNew);
  //   setIsLoggedIn(true);
  //   setShowLogin(false);
  // };

  const handleMusicAccept = () => {
    startMusicPlayback();
    setShowMusicPrompt(false);
  };

  const handleMusicDecline = () => {
    setMusicEnabled(false);
    setShowMusicPrompt(false);
  };

  const handleNewGame = () => {
    playClick();
    setTimeout(() => {
      setShowCharacterSelection(true);
    }, 100);
  };

  const handleCharacterSelect = (character) => {
    playClick();
    console.log('Selected character:', character);
    setTimeout(() => {
      setShowCharacterSelection(false);
    }, 100);
    // TODO: Start the game with the selected character
  };

  const handleLoadGame = () => {
    playClick();
    console.log('Loading saved game');
    // TODO: Implement load game logic
  };

  const handleSettings = () => {
    playClick();
    console.log('Opening settings');
    setShowSettings(true);
  };

  const handleCredits = () => {
    playClick();
    console.log('Showing credits');
    setShowCredits(true);
  };
  
  const handleLogout = () => {
    playClick();
    console.log('Logging out');
    setUser(null);
    // TODO: Implement Firebase logout
    // signOut(auth);
  };

  const buttonClass = "relative w-full h-16 bg-transparent border-none cursor-pointer transition-transform hover:scale-105 active:scale-95 overflow-hidden focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0 focus:shadow-none select-none hover:border-transparent hover:border-none";
  const buttonImageClass = "absolute inset-0 w-full h-full object-fill pointer-events-none";
  const buttonTextClass = "absolute inset-0 flex items-center justify-center text-base font-semibold text-white z-10 pointer-events-none";

  return (
    <div className="relative min-h-screen bg-black font-['Press_Start_2P'] text-white overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={true}
          className="absolute top-0 left-0 w-full h-full object-cover"
          playsInline
        >
          <source src={backgroundVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Login/Signup UI */}
      {!user && (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-center bg-black bg-opacity-50 px-6 text-center animate-slide-down">
          <LoginForm />
        </div>
      )}

      {/* Music Prompt */}
      {user && showMusicPrompt && (
        <MusicPrompt
          onAccept={handleMusicAccept}
          onDecline={handleMusicDecline}
        />
      )}

      {/* Character Selection */}
      {showCharacterSelection && (
        <div className="fixed inset-0 z-30 transition-opacity duration-200">
          <CharacterSelection
            onSelect={handleCharacterSelect}
            onClose={() => setShowCharacterSelection(false)}
          />
        </div>
      )}

      {/* Main Menu */}
      {user && !showMusicPrompt && !showCharacterSelection && (
        <div className="fixed top-0 left-0 bottom-0 z-20 flex flex-col items-start justify-start p-8 w-72" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <img src={gameTitleImage} alt="Game Title" className="mb-8 w-full h-auto object-contain" />
          
          <nav className="flex flex-col space-y-6 w-full">
            <button
              onClick={handleNewGame}
              onMouseEnter={playHover}
              className={buttonClass}
              type="button"
              style={{ outline: 'none' }}
            >
              <img src={buttonImage} alt="Button Background" className={buttonImageClass} />
              <span className={buttonTextClass}>NEW GAME</span>
            </button>

            {user && hasSavedGame && (
              <button
                onClick={handleLoadGame}
                onMouseEnter={playHover}
                className={buttonClass}
                type="button"
                style={{ outline: 'none' }}
              >
                <img src={buttonImage} alt="Button Background" className={buttonImageClass} />
                <span className={buttonTextClass}>LOAD GAME</span>
              </button>
            )}

            <button
              onClick={handleSettings}
              onMouseEnter={playHover}
              className={buttonClass}
              type="button"
              style={{ outline: 'none' }}
            >
              <img src={buttonImage} alt="Button Background" className={buttonImageClass} />
              <span className={buttonTextClass}>SETTINGS</span>
            </button>

            <button
              onClick={handleCredits}
              onMouseEnter={playHover}
              className={buttonClass}
              type="button"
              style={{ outline: 'none' }}
            >
              <img src={buttonImage} alt="Button Background" className={buttonImageClass} />
              <span className={buttonTextClass}>CREDITS</span>
            </button>

            <button
              onClick={handleLogout}
              onMouseEnter={playHover}
              className={buttonClass}
              type="button"
              style={{ outline: 'none' }}
            >
              <img src={buttonImage} alt="Button Background" className={buttonImageClass} />
              <span className={`${buttonTextClass} !text-red-600`}>LOGOUT</span>
            </button>
          </nav>
          <footer className="mt-auto text-gray-400 text-xs">
            © P.U.N.K 2025
          </footer>
        </div>
      )}

      {/* Credits Popup */}
      {showCredits && <Credits onClose={() => {
        playClick();
        setShowCredits(false);
      }} />}

      {/* Settings Popup */}
      {showSettings && (
        <Settings
          onClose={() => {
            playClick();
            setShowSettings(false);
          }}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          sfxVolume={sfxVolume}
          setSfxVolume={setSfxVolume}
          musicEnabled={musicEnabled}
          setMusicEnabled={setMusicEnabled}
          musicVolume={musicVolume}
          setMusicVolume={setMusicVolume}
        />
      )}
    </div>
  );
}

// Main component that provides the music context
export default function MainMenu() {
  return (
    <MusicProvider>
      <MainMenuContent />
    </MusicProvider>
  );
}
