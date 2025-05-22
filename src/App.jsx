import React from 'react';
import { SoundProvider } from './context/SoundContext';
import MainMenu from './pages/MainMenu';

function App() {
  return (
    <SoundProvider>
      <MainMenu />
    </SoundProvider>
  );
}

export default App;
