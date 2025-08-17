import { EnhancedRollScreen } from './components/screens/EnhancedRollScreen';
import { GameProvider } from './providers/GameProvider';
import './App.css';

function App() {
  return (
    <GameProvider>
      <div className="app">
        <EnhancedRollScreen />
      </div>
    </GameProvider>
  );
}

export default App;
