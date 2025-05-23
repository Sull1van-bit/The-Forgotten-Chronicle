import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SoundProvider } from './context/SoundContext';
import { MusicProvider } from './context/MusicContext';
import { AuthProvider } from './context/AuthContext';
import MainMenu from './pages/mainMenu';
import Game from './pages/Game';
import LoadGame from './components/LoadGame';
import LoginForm from './components/loginForm';
import SignUpForm from './components/SignUpForm';

function App() {
  return (
    <AuthProvider>
      <SoundProvider>
        <MusicProvider>
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/game" element={<Game />} />
            <Route path="/load-game" element={<LoadGame />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MusicProvider>
      </SoundProvider>
    </AuthProvider>
  );
}

export default App;
