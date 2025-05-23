import React from 'react';
import { SoundProvider } from './context/SoundContext';
import MainMenu from './pages/mainMenu';

function App() {
  return (
    <SoundProvider>
      <MainMenu />
    </SoundProvider>
  );
}

export default App;
