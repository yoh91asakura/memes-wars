// Combat Page - Main combat screen container

import React, { useEffect, useState } from 'react';
import { useGame } from '../../../hooks/useGame';
import { useCombatStore } from '../../../stores/combatStore';
import { CombatArena } from '../../organisms/CombatArena';
import { PlayerHealth } from '../../molecules/PlayerHealth';
import { Button } from '../../atoms/Button';
import { format } from '../../../utils/format';
import './CombatPage.css';

export const CombatPage: React.FC = () => {
  const { activeDeck } = useGame();
  const { 
    isActive, 
    phase, 
    players, 
    timeRemaining, 
    winner,
    startCombat,
    pauseCombat,
    resumeCombat,
    resetCombat
  } = useCombatStore();
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize combat when component mounts
  useEffect(() => {
    if (!isInitialized && activeDeck) {
      startCombat();
      setIsInitialized(true);
    }
  }, [isInitialized, activeDeck, startCombat]);

  // Handle combat controls
  const handleStartCombat = () => {
    if (activeDeck) {
      resetCombat();
      setIsInitialized(false);
    }
  };

  const handleEndCombat = () => {
    resetCombat();
    // Navigate back to collection
    window.location.href = '/collection';
  };

  // Calculate combat statistics
  const player = players.find(p => p.id === 'player');
  const opponent = players.find(p => p.id === 'opponent');

  return (
    <div className="combat-page">
      {/* Combat Header */}
      <header className="combat-header">
        <div className="combat-info">
          <h1>Combat Arena</h1>
          <div className="combat-timer">
            {phase === 'active' && (
              <span className="timer">
                {format.number.duration(timeRemaining / 1000)}
              </span>
            )}
          </div>
        </div>

        <div className="combat-controls">
          {!isActive && (
            <Button onClick={handleStartCombat} variant="primary">
              Start Combat
            </Button>
          )}
          {isActive && phase === 'active' && (
            <Button onClick={pauseCombat} variant="secondary">
              Pause
            </Button>
          )}
          {isActive && phase === 'paused' && (
            <Button onClick={resumeCombat} variant="secondary">
              Resume
            </Button>
          )}
          <Button onClick={handleEndCombat} variant="danger">
            End Combat
          </Button>
        </div>
      </header>

      {/* Player Status */}
      <div className="player-status">
        {player && (
          <PlayerHealth
            player={player}
          />
        )}
        {opponent && (
          <PlayerHealth
            player={opponent}
          />
        )}
      </div>

      {/* Combat Arena */}
      <div className="combat-arena-container">
        <CombatArena width={1200} height={800} />
      </div>

      {/* Combat Results */}
      {winner && (
        <div className="combat-results">
          <div className="results-overlay">
            <h2>Combat Complete!</h2>
            <p>Winner: {winner.username}</p>
            <Button onClick={handleEndCombat} variant="primary">
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};