import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from './components/templates/MainLayout/MainLayout';
import { RollPage } from './components/pages/RollPage/RollPage';
import { CollectionPage } from './components/pages/CollectionPage/CollectionPage';
import { CraftPage } from './components/pages/CraftPage/CraftPage';
import { CombatPage } from './components/pages/CombatPage/CombatPage';
import { DeckPage } from './components/pages/DeckPage/DeckPage';
import { PhaseContainer } from './components/atoms/PhaseContainer';
import { PersistenceService } from './services/PersistenceService';
import { useTransitions } from './hooks/useTransitions';
import { useAudio } from './hooks/useAudio';
import type { GamePhase } from './services/TransitionAnimationService';
import './App.css';

type Page = 'roll' | 'collection' | 'craft' | 'battle' | 'deck';

// Map routes to pages and phases
const ROUTE_CONFIG = {
  '/': { page: 'roll' as Page, phase: 'roll' as GamePhase },
  '/roll': { page: 'roll' as Page, phase: 'roll' as GamePhase },
  '/collection': { page: 'collection' as Page, phase: 'equip' as GamePhase },
  '/craft': { page: 'craft' as Page, phase: 'equip' as GamePhase },
  '/deck': { page: 'deck' as Page, phase: 'equip' as GamePhase },
  '/battle': { page: 'battle' as Page, phase: 'battle' as GamePhase }
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current page from route
  const currentRoute = ROUTE_CONFIG[location.pathname as keyof typeof ROUTE_CONFIG] || ROUTE_CONFIG['/'];
  const currentPage = currentRoute.page;
  const currentPagePhase = currentRoute.phase;
  
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
          
          // Give starter cards to new players
          const { useCardsStore } = await import('./stores/cardsStore');
          const cardsStore = useCardsStore.getState();
          await cardsStore.giveStarterCards();
          console.log('Starter cards provided for new player');
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

  // Handle phase transitions when route changes
  useEffect(() => {
    const handlePhaseTransition = async () => {
      if (currentPagePhase !== currentPhase && !isTransitioning) {
        await transitionTo(currentPagePhase);
      }
    };

    handlePhaseTransition();
  }, [currentPagePhase, currentPhase, isTransitioning, transitionTo]);

  const handleNavigate = async (page: string) => {
    if (isTransitioning) return; // Prevent navigation during transitions
    
    // Play navigation sound
    playSFX('transition_whoosh');
    
    // Navigate using React Router
    const routeMap = {
      'roll': '/',
      'collection': '/collection', 
      'craft': '/craft',
      'deck': '/deck',
      'battle': '/battle'
    };
    
    navigate(routeMap[page as keyof typeof routeMap] || '/');
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

  const renderPageWithPhase = (page: React.ReactNode, particleType: 'coins' | 'confetti' | 'sparkles' | 'stars' = 'sparkles') => (
    <PhaseContainer 
      phase={currentPagePhase}
      isActive={currentPhase === currentPagePhase}
      enableParticles={true}
      particleType={particleType}
    >
      {page}
    </PhaseContainer>
  );

  return (
    <MainLayout 
      currentPage={currentPage}
      onNavigate={handleNavigate}
      testId="main-app"
    >
      <Routes>
        <Route path="/" element={renderPageWithPhase(<RollPage testId="roll-page" />, 'sparkles')} />
        <Route path="/roll" element={renderPageWithPhase(<RollPage testId="roll-page" />, 'sparkles')} />
        <Route path="/collection" element={renderPageWithPhase(<CollectionPage testId="collection-page" />, 'stars')} />
        <Route path="/craft" element={renderPageWithPhase(<CraftPage testId="craft-page" />, 'coins')} />
        <Route path="/deck" element={renderPageWithPhase(<DeckPage testId="deck-page" />, 'stars')} />
        <Route path="/battle" element={renderPageWithPhase(<CombatPage />, 'confetti')} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;