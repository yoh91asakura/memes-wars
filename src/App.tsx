import { useState, useEffect } from 'react';
import { MainLayout } from './components/templates/MainLayout/MainLayout';
import { RollPage } from './components/pages/RollPage/RollPage';
import { CollectionPage } from './components/pages/CollectionPage/CollectionPage';
import { CraftPage } from './components/pages/CraftPage/CraftPage';
import { CombatPage } from './components/pages/CombatPage/CombatPage';
import { DeckPage } from './components/pages/DeckPage/DeckPage';
import { Text } from './components/atoms/Text';
import { PhaseContainer } from './components/atoms/PhaseContainer';
import { PersistenceService } from './services/PersistenceService';
import { useTransitions } from './hooks/useTransitions';
import { useAudio } from './hooks/useAudio';
import type { GamePhase } from './services/TransitionAnimationService';
import './App.css';

type Page = 'roll' | 'collection' | 'craft' | 'battle' | 'deck';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('roll');
  const [isLoading, setIsLoading] = useState(true);
  
  // Transition management
  const { currentPhase, isTransitioning, transitionTo } = useTransitions();
  
  // Audio management
  const { playSFX, playMusic, isInitialized } = useAudio();

  // Initialize persistence on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing game data persistence...');
        
        // Load game data if available
        const loaded = await PersistenceService.loadGame();
        if (loaded) {
          console.log('Game data loaded successfully');
        } else {
          console.log('No existing save data found, starting fresh');
        }

        // Play startup music when audio is ready
        if (isInitialized) {
          playMusic('menu_theme', { loop: true, fadeIn: 1.0, volume: 0.6 });
        }
      } catch (error) {
        console.error('Failed to initialize game data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [isInitialized, playMusic]);

  const handleNavigate = async (page: string) => {
    if (isTransitioning) return; // Prevent navigation during transitions
    
    const newPage = page as Page;
    
    // Play navigation sound
    playSFX('transition_whoosh');
    
    // Map pages to phases for transitions
    const pageToPhase: Record<Page, GamePhase> = {
      roll: 'roll',
      collection: 'equip', // Collection is part of equip phase
      craft: 'equip', // Craft is part of equip phase  
      deck: 'equip', // Deck is part of equip phase
      battle: 'battle'
    };
    
    const newPhase = pageToPhase[newPage];
    
    // Only transition if phase changes
    if (newPhase !== currentPhase) {
      await transitionTo(newPhase);
    }
    
    setCurrentPage(newPage);
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Loading Memes Wars...</h2>
          <p>Initializing game data...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    const pageToPhase: Record<Page, GamePhase> = {
      roll: 'roll',
      collection: 'equip',
      craft: 'equip',
      deck: 'equip',
      battle: 'battle'
    };
    
    const currentPagePhase = pageToPhase[currentPage];
    
    switch (currentPage) {
      case 'roll':
        return (
          <PhaseContainer 
            phase="roll" 
            isActive={currentPhase === 'roll'}
            enableParticles={true}
            particleType="sparkles"
          >
            <RollPage testId="roll-page" />
          </PhaseContainer>
        );
      case 'collection':
        return (
          <PhaseContainer 
            phase="equip" 
            isActive={currentPhase === 'equip'}
            enableParticles={true}
            particleType="stars"
          >
            <CollectionPage testId="collection-page" />
          </PhaseContainer>
        );
      case 'craft':
        return (
          <PhaseContainer 
            phase="equip" 
            isActive={currentPhase === 'equip'}
            enableParticles={true}
            particleType="coins"
          >
            <CraftPage testId="craft-page" />
          </PhaseContainer>
        );
      case 'deck':
        return (
          <PhaseContainer 
            phase="equip" 
            isActive={currentPhase === 'equip'}
            enableParticles={true}
            particleType="gears"
          >
            <DeckPage testId="deck-page" />
          </PhaseContainer>
        );
      case 'battle':
        return (
          <PhaseContainer 
            phase="battle" 
            isActive={currentPhase === 'battle'}
            enableParticles={true}
            particleType="confetti"
          >
            <CombatPage />
          </PhaseContainer>
        );
      default:
        return (
          <PhaseContainer 
            phase="roll" 
            isActive={currentPhase === 'roll'}
            enableParticles={true}
            particleType="sparkles"
          >
            <RollPage testId="roll-page" />
          </PhaseContainer>
        );
    }
  };

  return (
    <MainLayout 
      currentPage={currentPage}
      onNavigate={handleNavigate}
      testId="main-app"
    >
      {renderPage()}
    </MainLayout>
  );
}

export default App;
