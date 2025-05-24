import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SoundProvider } from './context/SoundContext';
import { MusicProvider } from './context/MusicContext';
import { AuthProvider } from './context/AuthContext';
import MainMenu from './pages/mainMenu';
import Game from './pages/Game';
import LoginForm from './components/loginForm';
import SignUpForm from './components/SignUpForm';
import { DialogProvider } from './context/DialogContext';
import Minimap from './components/Minimap';

function App() {
  return (
    <AuthProvider>
      <SoundProvider>
        <MusicProvider>
          <DialogProvider>
            <div className="relative min-h-screen">
              <Routes>
                <Route path="/" element={<MainMenu />} />
                <Route path="/game" element={<Game />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Minimap />
            </div>
          </DialogProvider>
        </MusicProvider>
      </SoundProvider>
    </AuthProvider>
  );
}

export default App;
