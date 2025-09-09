// Combat Page - Main combat screen container

import React, { useEffect, useState } from 'react';
import { useCombat, useCombatStats } from '../../../hooks/useCombat';
import { useCombatStore } from '../../../stores/combatStore';
import { useGame } from '../../../hooks/useGame';
import { useStageStore, useCurrentStageData, stageActions } from '../../../stores/stageStore';
import { useGold, useTickets } from '../../../stores/currencyStore';
import { getRewardService, RewardDistribution } from '../../../services/RewardService';
import { getAIMatchmakingService } from '../../../services/AIMatchmakingService';
import { CombatArena } from '../../organisms/CombatArena';
import { PlayerHealth } from '../../molecules/PlayerHealth';
import { Button } from '../../atoms/Button';
import { format } from '../../../utils/format';
import './CombatPage.css';

export const CombatPage: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [rewards, setRewards] = useState<RewardDistribution | null>(null);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  
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
  
  // Stage progression
  const { currentStage, currentDeckLimit } = useStageStore();
  const { stage: stageData, deckLimit, isUnlocked } = useCurrentStageData();
  
  // Currency
  const gold = useGold();
  const tickets = useTickets();
  
  // Combat stats
  const { getOverallStats, getLeaderboard } = useCombatStats();

  // Initialize combat when component mounts
  useEffect(() => {
    const initializeMatch = async () => {
      // Check if current stage is unlocked
      if (!isUnlocked) {
        console.error(`Stage ${currentStage} is not unlocked`);
        return;
      }

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

      // Use active deck or create a default one
      let playerDeck = activeDeck;
      if (!playerDeck) {
        playerDeck = await createNewDeck('Default Deck');
        if (!playerDeck) {
          console.error('Failed to create default deck');
          return;
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
    };

    if (!isInitialized && !isActive) {
      initializeMatch();
    }
  }, [isInitialized, isActive, activeDeck, initializeCombat, createNewDeck]);

  // Handle combat phase changes and stage completion
  useEffect(() => {
    if (phase === 'ended' && winner) {
      const handleCombatEnd = async () => {
        // Check if player won
        if (winner.id === 'player') {
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
          // Player lost - record defeat
          stageActions.completeBattle(currentStage, false);
        }
      };
      
      handleCombatEnd();
    }
  }, [phase, winner, currentStage, stageData]);

  // Event handlers
  const handleStartCombat = () => {
    if (isInitialized && phase === 'waiting') {
      startCombat();
    }
  };

  const handlePauseCombat = () => {
    if (phase === 'active') {
      pauseCombat();
    }
  };

  const handleResumeCombat = () => {
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
  };

  const handleExitCombat = () => {
    resetCombat();
    // In a real app with routing, this would navigate back
    // navigate('/');
  };

  // Get current stats
  const overallStats = getOverallStats();
  const leaderboard = getLeaderboard();

  if (!isInitialized) {
    return (
      <div className="combat-page loading">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Initializing Combat Arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="combat-page">
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

        {/* Combat Controls */}
        <div className="combat-controls-header">
          {phase === 'waiting' && (
            <Button onClick={handleStartCombat} variant="primary">
              Start Combat
            </Button>
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
    </div>
  );
};