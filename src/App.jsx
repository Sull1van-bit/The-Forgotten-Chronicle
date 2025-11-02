import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SoundProvider } from './context/SoundContext';
import { MusicProvider } from './context/MusicContext';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { PlayerStatsProvider } from './context/PlayerStatsContext';
import { InventoryProvider } from './context/InventoryContext';
import { QuestProvider } from './context/QuestContext';
import { FarmingProvider } from './context/FarmingContext';
import MainMenu from './pages/mainMenu';
import Game from './pages/Game';
import LoginForm from './components/loginForm';
import SignUpForm from './components/SignUpForm';
import { DialogProvider } from './context/DialogContext';

function App() {
  return (
    <AuthProvider>
      <SoundProvider>
        <MusicProvider>
          <PlayerStatsProvider>
            <InventoryProvider>
              <QuestProvider>
                <FarmingProvider>
                  <GameProvider>
                    <DialogProvider>
                      <div className="relative min-h-screen">
                        <Routes>
                          <Route path="/" element={<MainMenu />} />
                          <Route path="/game" element={<Game />} />
                          <Route path="/login" element={<LoginForm />} />
                          <Route path="/signup" element={<SignUpForm />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </div>
                    </DialogProvider>
                  </GameProvider>
                </FarmingProvider>
              </QuestProvider>
            </InventoryProvider>
          </PlayerStatsProvider>
        </MusicProvider>
      </SoundProvider>
    </AuthProvider>
  );
}

export default App;
