import React from 'react';
import { RollScreen } from './components/screens/RollScreen';
import { GameProvider } from './providers/GameProvider';
import './App.css';

function App() {
  return (
    <GameProvider>
      <div className="app">
        <RollScreen />
      </div>
    </GameProvider>
  );
}

export default App;
