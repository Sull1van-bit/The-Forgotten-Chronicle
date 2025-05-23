import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SoundProvider } from './context/SoundContext';
import { MusicProvider } from './context/MusicContext';
import MainMenu from './pages/mainMenu';
import Game from './pages/Game';

function App() {
  return (
    <SoundProvider>
      <MusicProvider>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/game" element={<Game />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MusicProvider>
    </SoundProvider>
  );
}

export default App;
