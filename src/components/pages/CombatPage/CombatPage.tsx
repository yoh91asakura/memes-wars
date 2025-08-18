// Combat Page - Main combat screen container

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCombat, useCombatStats } from '../../../hooks/useCombat';
import { useGame } from '../../../hooks/useGame';
import { CombatArena } from '../../organisms/CombatArena';
import { PlayerHealth } from '../../molecules/PlayerHealth';
import { Button } from '../../atoms/Button';
import { format } from '../../../utils/format';
import './CombatPage.css';

export const CombatPage: React.FC = () => {
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  
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
  
  // Combat stats
  const { getOverallStats, getLeaderboard } = useCombatStats();

  // Initialize combat when component mounts
  useEffect(() => {
    const initializeMatch = async () => {
      // Create default arena
      const arena = {
        id: 'default_arena',
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
          roundDuration: 120000, // 2 minutes
          suddenDeathTime: 90000 // 1.5 minutes
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

      // Create opponent deck (in a real game, this would be another player's deck)
      const opponentDeck = await createNewDeck('AI Opponent');
      if (!opponentDeck) {
        console.error('Failed to create opponent deck');
        return;
      }

      // Initialize combat
      initializeCombat(arena, playerDeck, opponentDeck);
      setIsInitialized(true);
    };

    if (!isInitialized && !isActive) {
      initializeMatch();
    }
  }, [isInitialized, isActive, activeDeck, initializeCombat, createNewDeck]);

  // Handle combat phase changes
  useEffect(() => {
    if (phase === 'ended' && winner) {
      // Show results for 3 seconds before allowing navigation
      setTimeout(() => {
        // In a real game, you might save match results here
      }, 3000);
    }
  }, [phase, winner]);

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
    navigate('/');
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
          <h1 className="combat-title">Combat Arena</h1>
          <div className="combat-phase">
            Phase: <span className={`phase-badge ${phase}`}>{phase.toUpperCase()}</span>
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
    </div>
  );
};