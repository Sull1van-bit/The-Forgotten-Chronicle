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
import React from 'react';
  import Game from './assets/pages/Game';
import './styles/App.css';

const App = () => {
  return (
    <div className="app">
      <Game />
    </div>
  );
};

export default App;
