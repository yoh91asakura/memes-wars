import { useState } from 'react';
import { RollScreen } from './components/screens/RollScreen';
import { CombatScreen } from './components/screens/CombatScreen';
import { GameProvider } from './providers/GameProvider';
import './App.css';

type Screen = 'roll' | 'combat';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('roll');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'roll':
        return <RollScreen onNavigateToCombat={() => setCurrentScreen('combat')} />;
      case 'combat':
        return <CombatScreen onNavigateBack={() => setCurrentScreen('roll')} />;
      default:
        return <RollScreen onNavigateToCombat={() => setCurrentScreen('combat')} />;
    }
  };

  return (
    <GameProvider>
      <div className="app">
        <nav className="app-nav">
          <button 
            className={`nav-btn ${currentScreen === 'roll' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('roll')}
          >
            📦 Card Rolls
          </button>
          <button 
            className={`nav-btn ${currentScreen === 'combat' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('combat')}
          >
            ⚔️ Battle Arena
          </button>
        </nav>
        {renderScreen()}
      </div>
    </GameProvider>
  );
}

export default App;
