import React, { useRef, useEffect, useState } from 'react';
import { CombatEngine } from '../../services/CombatEngine';
import { Card } from '../../types/card';
import './CombatScreen.css';

interface CombatScreenProps {
  playerCard: Card;
  enemyCard: Card;
  onCombatEnd: (winner: 'player' | 'enemy') => void;
}

export const CombatScreen: React.FC<CombatScreenProps> = ({
  playerCard,
  enemyCard,
  onCombatEnd
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CombatEngine | null>(null);
  const [combatStats, setCombatStats] = useState({
    fps: 0,
    projectiles: 0,
    entities: 0
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || isInitialized) return;

    // Initialize combat engine
    const engine = new CombatEngine(canvasRef.current);
    engineRef.current = engine;

    // Start combat
    engine.startCombat(playerCard, enemyCard);
    setIsInitialized(true);

    // Stats update interval
    const statsInterval = setInterval(() => {
      const stats = engine.getPerformanceStats();
      setCombatStats(stats);

      // Check if combat is over
      const combatResult = engine.isCombatOver();
      if (combatResult.isOver && combatResult.winner) {
        engine.stop();
        clearInterval(statsInterval);
        onCombatEnd(combatResult.winner);
      }
    }, 100); // Update stats every 100ms

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
      clearInterval(statsInterval);
    };
  }, [playerCard, enemyCard, onCombatEnd, isInitialized]);

  return (
    <div className="combat-screen">
      <div className="combat-header">
        <div className="card-info player-card">
          <h3>{playerCard.name}</h3>
          <div className="card-emoji">{playerCard.emoji}</div>
          <div className="card-stats">
            <span>Cost: {playerCard.cost}</span>
            <span>Rarity: {playerCard.rarity}</span>
          </div>
        </div>
        
        <div className="vs-indicator">
          <span>VS</span>
        </div>
        
        <div className="card-info enemy-card">
          <h3>{enemyCard.name}</h3>
          <div className="card-emoji">{enemyCard.emoji}</div>
          <div className="card-stats">
            <span>Cost: {enemyCard.cost}</span>
            <span>Rarity: {enemyCard.rarity}</span>
          </div>
        </div>
      </div>

      <div className="combat-arena">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="combat-canvas"
        />
      </div>

      <div className="combat-stats">
        <div className="stat-item">
          <span className="stat-label">FPS:</span>
          <span className="stat-value">{combatStats.fps}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Projectiles:</span>
          <span className="stat-value">{combatStats.projectiles}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Entities:</span>
          <span className="stat-value">{combatStats.entities}</span>
        </div>
      </div>
    </div>
  );
};