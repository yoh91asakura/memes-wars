// Combat Page - Main combat screen container

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useCombat, useCombatStats } from '../../../hooks/useCombat';
import { useCombatStore } from '../../../stores/combatStore';
import { useGame } from '../../../hooks/useGame';
import { useStageStore, useCurrentStageData, stageActions } from '../../../stores/stageStore';
import { useCardsStore } from '../../../stores/cardsStore';
import { useGold, useTickets } from '../../../stores/currencyStore';
import { getRewardService, RewardDistribution } from '../../../services/RewardService';
import { getAIMatchmakingService } from '../../../services/AIMatchmakingService';
import { useAudio } from '../../../hooks/useAudio';
import { CombatArena } from '../../organisms/CombatArena';
import { PlayerHealth } from '../../molecules/PlayerHealth';
import { DeckSelector } from '../../organisms/DeckSelector';
import { Button } from '../../atoms/Button';
import { format } from '../../../utils/format';
import './CombatPage.css';

export const CombatPage: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [rewards, setRewards] = useState<RewardDistribution | null>(null);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showDeckSelector, setShowDeckSelector] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<any[] | null>(null);
  const [autoCreatedDeck, setAutoCreatedDeck] = useState(false);
  const [isAutoStarting, setIsAutoStarting] = useState(false);
  
  // Prevent multiple initialization attempts
  const initializingRef = useRef(false);
  
  // Combat state
  const {
    isActive,
    phase,
    players,
    timeRemaining,
    winner,
    statistics,
    initializeCombat,
    startCombat,
    pauseCombat,
    resumeCombat,
    endCombat,
    resetCombat
  } = useCombat();

  // Game state  
  const { activeDeck, createNewDeck } = useGame();
  const { collection } = useCardsStore();
  
  // Stage progression
  const { currentStage, currentDeckLimit } = useStageStore();
  const { stage: stageData, deckLimit, isUnlocked } = useCurrentStageData();
  
  // Currency
  const gold = useGold();
  const tickets = useTickets();
  
  // Combat stats
  const { getOverallStats, getLeaderboard } = useCombatStats();
  
  // Audio
  const { playSFX, playMusic, stopMusic } = useAudio();

  // Auto-create deck from available cards
  const createDefaultDeckFromCards = useCallback(async () => {
    if (collection.length === 0) {
      console.warn('No cards available to create deck');
      return null;
    }
    
    // Use the first available cards (up to deck limit)
    const availableCards = collection.slice(0, Math.min(deckLimit, 5)); // Max 5 cards for combat
    const defaultDeck = {
      id: 'auto-combat-deck',
      name: 'Auto Combat Deck',
      cards: availableCards,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log(`Auto-created combat deck with ${availableCards.length} cards:`, availableCards.map(c => c.name));
    setAutoCreatedDeck(true);
    return defaultDeck;
  }, [collection, deckLimit]);

  // Handle deck selection
  const handleDeckConfirmed = (deck: any[]) => {
    setSelectedDeck(deck);
    setShowDeckSelector(false);
  };

  const handleCancelDeckSelection = () => {
    setShowDeckSelector(false);
    // Use active deck as fallback if selection is cancelled
    if (activeDeck?.cards) {
      setSelectedDeck(activeDeck.cards);
    }
  };

  const handleOpenDeckSelector = () => {
    setShowDeckSelector(true);
  };

  // Initialize combat when component mounts
  useEffect(() => {
    const initializeMatch = async () => {
      // Prevent multiple concurrent initialization attempts
      if (initializingRef.current) {
        return;
      }
      initializingRef.current = true;

      try {
        // Check if current stage is unlocked
        if (!isUnlocked) {
          console.error(`Stage ${currentStage} is not unlocked`);
          return;
        }

        console.log('Initializing combat match...');

        // Create arena based on current stage
        const arena = {
          id: `stage_${currentStage}_arena`,
          width: 1200,
          height: 800,
          boundaries: [
            { x: 0, y: 0, width: 1200, height: 20 }, // Top
            { x: 0, y: 780, width: 1200, height: 20 }, // Bottom
            { x: 0, y: 0, width: 20, height: 800 }, // Left
            { x: 1180, y: 0, width: 20, height: 800 } // Right
          ],
          obstacles: [
            {
              id: 'center_obstacle',
              position: { x: 550, y: 350 },
              size: { width: 100, height: 100 },
              type: 'bouncy' as const,
              health: 100,
              maxHealth: 100
            }
          ],
          playerSpawns: [
            { x: 200, y: 400 },
            { x: 1000, y: 400 }
          ],
          powerupSpawns: [],
          settings: {
            gravity: 200,
            friction: 0.98,
            bounceMultiplier: 0.8,
            maxProjectiles: 100,
            tickRate: 60,
            roundDuration: stageData?.isBoss ? 180000 : 120000, // Longer for boss fights
            suddenDeathTime: stageData?.isBoss ? 150000 : 90000
          }
        };

        // Use selected deck, active deck, or auto-create from cards
        let playerDeck = selectedDeck ? { cards: selectedDeck, name: 'Combat Deck', id: 'combat' } : activeDeck;
        if (!playerDeck) {
          // Try to auto-create from available cards
          playerDeck = await createDefaultDeckFromCards();
          if (!playerDeck) {
            // Last resort - create empty deck (will be filled later)
            playerDeck = await createNewDeck('Default Deck');
            if (!playerDeck) {
              console.error('Failed to create default deck');
              return;
            }
          }
        }

        // Generate AI opponent based on current stage
        const aiMatchmaking = getAIMatchmakingService();
        const aiOpponent = aiMatchmaking.generateOpponent(stageData, 1); // TODO: Get actual player level
        
        console.log(`Generated AI opponent: ${aiOpponent.name} with ${aiOpponent.deck.cards.length} cards`);
        console.log(`AI Health: ${aiOpponent.health}, Difficulty: ${aiOpponent.difficulty}`);

        // Initialize combat with AI opponent
        initializeCombat(arena, playerDeck, aiOpponent.deck);
        setIsInitialized(true);
        console.log('Combat initialization complete');
      } catch (error) {
        console.error('Combat initialization failed:', error);
      } finally {
        initializingRef.current = false;
      }
    };

    // Initialize combat if conditions are met
    const shouldInitialize = !isInitialized && 
                           !isActive && 
                           !showDeckSelector && 
                           !initializingRef.current &&
                           (selectedDeck || activeDeck || collection.length > 0);

    if (shouldInitialize) {
      initializeMatch();
    }
  }, [isInitialized, isActive, showDeckSelector, selectedDeck, activeDeck, collection.length]);

  // Cleanup initialization flag on unmount
  useEffect(() => {
    return () => {
      initializingRef.current = false;
    };
  }, []);

  // Auto-start combat after initialization
  useEffect(() => {
    if (isInitialized && phase === 'waiting') {
      setIsAutoStarting(true);
      
      // Play combat start music and sound
      playMusic('combat_theme', { loop: true, fadeIn: 2.0, volume: 0.5 });
      playSFX('combat_start');
      
      // Small delay to ensure UI is ready and let user see the setup
      const autoStartTimeout = setTimeout(() => {
        console.log('Auto-starting combat after deck selection...');
        startCombat();
        setIsAutoStarting(false);
      }, 3000); // 3 second delay for user to see the setup and auto-start indicator

      return () => {
        clearTimeout(autoStartTimeout);
        setIsAutoStarting(false);
      };
    }
  }, [isInitialized, phase, startCombat, playMusic, playSFX]);

  // Handle combat phase changes and stage completion
  useEffect(() => {
    if (phase === 'ended' && winner) {
      const handleCombatEnd = async () => {
        // Check if player won
        if (winner.id === 'player') {
          // Play victory sound and music
          stopMusic(1.0);
          playSFX('combat_victory');
          playMusic('victory_fanfare', { loop: false, fadeIn: 0.5, volume: 0.7 });
          
          // Complete the stage and calculate rewards
          if (stageData) {
            const rewardService = getRewardService();
            
            // Create combat result
            const combatResult = {
              victory: true,
              stageId: currentStage,
              playerDamage: winner.damage || 0,
              enemyDamage: 0, // TODO: Get actual enemy damage
              combatDuration: Date.now() - (useCombatStore.getState().startTime || Date.now()),
              perfectVictory: winner.health === winner.maxHealth,
              speedBonus: (Date.now() - (useCombatStore.getState().startTime || Date.now())) < 60000 // Less than 1 minute
            };
            
            // Calculate and distribute rewards
            const baseRewards = {
              gold: stageData.goldReward,
              tickets: stageData.ticketsReward,
              bonusRewards: stageData.bonusRewards || []
            };
            
            const calculation = rewardService.calculateRewards(combatResult, baseRewards);
            const distribution = await rewardService.distributeRewards(calculation, 1); // TODO: Get actual player level
            
            setRewards(distribution);
            setShowRewardsModal(true);
            
            // Play reward sounds based on what was earned
            if (distribution.goldEarned > 0) {
              playSFX('reward_coins', { delay: 0.5 });
            }
            if (distribution.ticketsEarned > 0) {
              playSFX('reward_tickets', { delay: 1.0 });
            }
            if (distribution.bonusRewards && distribution.bonusRewards.length > 0) {
              playSFX('reward_level_up', { delay: 1.5 });
            }
            
            // Complete stage in store
            stageActions.completeBattle(currentStage, true, calculation.finalRewards);
            
            // Auto-advance to next stage after showing rewards
            setTimeout(() => {
              const nextStage = currentStage + 1;
              const nextStageData = useStageStore.getState().getStageById(nextStage);
              if (nextStageData && useStageStore.getState().isStageUnlocked(nextStage)) {
                stageActions.goToStage(nextStage);
              }
            }, 5000);
          }
        } else {
          // Player lost - play defeat sound and record defeat
          stopMusic(1.0);
          playSFX('combat_defeat');
          stageActions.completeBattle(currentStage, false);
        }
      };
      
      handleCombatEnd();
    }
  }, [phase, winner, currentStage, stageData]);

  // Event handlers
  const handleStartCombat = () => {
    playSFX('ui_click');
    if (isInitialized && phase === 'waiting') {
      startCombat();
    }
  };

  const handlePauseCombat = () => {
    playSFX('ui_click');
    if (phase === 'active') {
      pauseCombat();
    }
  };

  const handleResumeCombat = () => {
    playSFX('ui_click');
    if (phase === 'paused') {
      resumeCombat();
    }
  };

  const handleEndCombat = () => {
    endCombat();
  };

  const handleResetCombat = () => {
    resetCombat();
    setIsInitialized(false);
    initializingRef.current = false; // Reset initialization flag
  };

  const handleExitCombat = () => {
    resetCombat();
    // In a real app with routing, this would navigate back
    // navigate('/');
  };

  // Get current stats
  const overallStats = getOverallStats();
  const leaderboard = getLeaderboard();

  // Show no cards message (not loading state) if we truly can't proceed
  if (!isInitialized && collection.length === 0 && !activeDeck) {
    return (
      <div className="combat-page no-cards" data-testid="combat-page">
        <div className="no-cards-container">
          <p>No cards available for combat. Please go to Roll page to get cards.</p>
          <Button 
            onClick={() => window.location.hash = '#roll'}
            variant="primary"
          >
            Go to Roll Page
          </Button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="combat-page loading" data-testid="combat-page">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Initializing Combat Arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="combat-page" data-testid="combat-page">
      {/* Show deck selector if needed */}
      {showDeckSelector && (
        <div className="deck-selection-overlay">
          <div className="deck-selection-container">
            <DeckSelector
              currentDeck={activeDeck?.cards || []}
              maxDeckSize={deckLimit}
              onDeckConfirmed={handleDeckConfirmed}
              onCancel={handleCancelDeckSelection}
              requiredSynergies={stageData?.requiredSynergies || []}
              stageHints={{
                enemyType: stageData?.enemyType,
                recommendedStrategy: stageData?.isBoss ? 'power' : 'balance',
                difficulty: stageData?.enemyDifficulty
              }}
            />
          </div>
        </div>
      )}

      {/* Combat interface - only shown when deck is selected */}
      {!showDeckSelector && (
        <>
          {/* Combat Header */}
          <header className="combat-header">
            <div className="combat-info">
              <h1 className="combat-title">
                {stageData ? `Stage ${currentStage}: ${stageData.name}` : 'Combat Arena'}
              </h1>
              <div className="stage-info">
                {stageData && (
                  <>
                <span className={`difficulty-badge ${stageData.enemyDifficulty}`}>
                  {stageData.enemyDifficulty.toUpperCase()}
                </span>
                {stageData.isBoss && <span className="boss-badge">👑 BOSS</span>}
                <span className="deck-limit">Deck Limit: {deckLimit}</span>
              </>
            )}
          </div>
          <div className="combat-phase">
            Phase: <span className={`phase-badge ${phase}`}>{phase.toUpperCase()}</span>
          </div>
        </div>

        {/* Currency Display */}
        <div className="currency-display">
          <div className="currency-item">
            <span className="currency-icon">🪙</span>
            <span className="currency-value">{format.number.compact(gold)}</span>
          </div>
          <div className="currency-item">
            <span className="currency-icon">🎫</span>
            <span className="currency-value">{tickets}</span>
          </div>
        </div>

        {/* Combat Timer */}
        {(phase === 'active' || phase === 'paused') && (
          <div className="combat-timer">
            <div className="timer-label">Time Remaining</div>
            <div className="timer-value">
              {format.number.duration(Math.max(0, timeRemaining / 1000))}
            </div>
          </div>
        )}

        {/* Deck Management Button */}
        <div className="deck-management">
          <Button 
            onClick={handleOpenDeckSelector}
            variant="secondary"
            size="sm"
          >
            🃏 Manage Deck
          </Button>
          {autoCreatedDeck && (
            <div className="auto-deck-notice">
              <span className="notice-icon">ℹ️</span>
              <span className="notice-text">Using auto-created deck from your cards</span>
            </div>
          )}
        </div>

        {/* Combat Controls */}
        <div className="combat-controls-header">
          {phase === 'waiting' && !isAutoStarting && (
            <Button onClick={handleStartCombat} variant="primary">
              Start Combat
            </Button>
          )}
          
          {phase === 'waiting' && isAutoStarting && (
            <div className="auto-start-indicator">
              <div className="auto-start-spinner" />
              <span>Combat starting automatically in 3 seconds...</span>
              <Button onClick={() => {
                setIsAutoStarting(false);
                handleStartCombat();
              }} variant="primary" size="small">
                Start Now
              </Button>
            </div>
          )}
          
          {phase === 'active' && (
            <Button onClick={handlePauseCombat} variant="secondary">
              Pause
            </Button>
          )}
          
          {phase === 'paused' && (
            <>
              <Button onClick={handleResumeCombat} variant="primary">
                Resume
              </Button>
              <Button onClick={handleEndCombat} variant="danger">
                End Combat
              </Button>
            </>
          )}
          
          {phase === 'ended' && (
            <>
              <Button onClick={handleResetCombat} variant="primary">
                Play Again
              </Button>
              <Button onClick={handleExitCombat} variant="secondary">
                Exit
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main Combat Area */}
      <main className="combat-main">
        {/* Player Health Bars */}
        <div className="players-container">
          {players.map(player => (
            <PlayerHealth
              key={player.id}
              player={player}
              showEffects={true}
              className={player.id === 'player' ? 'player-health-left' : 'player-health-right'}
            />
          ))}
        </div>

        {/* Combat Arena */}
        <div className="arena-container">
          <CombatArena
            width={1200}
            height={800}
            className="main-arena"
          />
        </div>

        {/* Combat Statistics */}
        <div className="combat-stats">
          <div className="stats-section">
            <h3>Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Projectiles Fired</span>
                <span className="stat-value">{overallStats.totalProjectilesFired}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Damage</span>
                <span className="stat-value">{format.number.compact(overallStats.totalDamageDealt)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Collisions</span>
                <span className="stat-value">{overallStats.totalCollisions}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">FPS</span>
                <span className="stat-value">{overallStats.currentFPS}</span>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="leaderboard-section">
            <h3>Leaderboard</h3>
            <div className="leaderboard">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className={`leaderboard-entry ${!entry.isAlive ? 'eliminated' : ''}`}>
                  <span className="position">{index + 1}</span>
                  <span className="username">{entry.username}</span>
                  <span className="score">{entry.score}</span>
                  <span className="status">{entry.isAlive ? '🟢' : '💀'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Winner Overlay */}
      {winner && (
        <div className="winner-overlay">
          <div className="winner-content">
            <div className="winner-crown">👑</div>
            <h2 className="winner-title">{winner.username} Wins!</h2>
            <div className="winner-stats">
              <div className="winner-stat">
                <span className="label">Kills</span>
                <span className="value">{winner.kills}</span>
              </div>
              <div className="winner-stat">
                <span className="label">Damage</span>
                <span className="value">{format.number.compact(winner.damage)}</span>
              </div>
              <div className="winner-stat">
                <span className="label">Accuracy</span>
                <span className="value">{format.number.percent(winner.accuracy)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {phase === 'paused' && (
        <div className="pause-overlay">
          <div className="pause-content">
            <h2>Game Paused</h2>
            <p>Combat is temporarily paused</p>
          </div>
        </div>
      )}

      {/* Rewards Modal */}
      {showRewardsModal && rewards && (
        <div className="rewards-overlay">
          <div className="rewards-content">
            <div className="rewards-header">
              <h2>🎉 Victory Rewards!</h2>
              <Button 
                onClick={() => setShowRewardsModal(false)} 
                variant="secondary"
                size="small"
              >
                ✕
              </Button>
            </div>
            
            <div className="rewards-grid">
              <div className="reward-item">
                <span className="reward-icon">🪙</span>
                <span className="reward-label">Gold</span>
                <span className="reward-value">+{format.number.compact(rewards.gold)}</span>
              </div>
              
              <div className="reward-item">
                <span className="reward-icon">🎫</span>
                <span className="reward-label">Tickets</span>
                <span className="reward-value">+{rewards.tickets}</span>
              </div>
              
              <div className="reward-item">
                <span className="reward-icon">⭐</span>
                <span className="reward-label">Experience</span>
                <span className="reward-value">+{rewards.experience}</span>
              </div>
            </div>

            {rewards.bonusCards && rewards.bonusCards.length > 0 && (
              <div className="bonus-cards">
                <h3>Bonus Cards!</h3>
                <div className="bonus-cards-grid">
                  {rewards.bonusCards.map((card, index) => (
                    <div key={index} className="bonus-card">
                      <span className="card-rarity">{card.rarity}</span>
                      <span className="card-name">{card.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rewards.achievements && rewards.achievements.length > 0 && (
              <div className="achievements">
                <h3>🏆 Achievements Unlocked!</h3>
                <div className="achievements-list">
                  {rewards.achievements.map((achievement, index) => (
                    <div key={index} className="achievement-item">
                      {achievement}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rewards.unlocks && rewards.unlocks.length > 0 && (
              <div className="unlocks">
                <h3>🔓 New Features Unlocked!</h3>
                <div className="unlocks-list">
                  {rewards.unlocks.map((unlock, index) => (
                    <div key={index} className="unlock-item">
                      {unlock}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rewards-actions">
              <Button 
                onClick={() => setShowRewardsModal(false)} 
                variant="primary"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};