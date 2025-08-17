/**
 * Combat Screen - Main UI component for turn-based combat
 * Responsive design with touch/keyboard support and accessibility features
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CombatEngine } from '../core/CombatEngine';
import { CombatEntity } from '../core/CombatEntity';
import { CombatResolver } from '../core/CombatResolver';
import { PerformanceMonitor } from '../infrastructure/PerformanceMonitor';
import { BattleState, CombatAction } from '../types/combat.types';
import { Card } from '../../../models/Card';

import './CombatScreen.css';

interface CombatScreenProps {
  playerCards: Card[];
  opponentCards: Card[];
  onBattleComplete?: (result: any) => void;
  onExit?: () => void;
}

export const CombatScreen: React.FC<CombatScreenProps> = ({
  playerCards,
  opponentCards,
  onBattleComplete,
  onExit
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CombatEngine | null>(null);
  const resolverRef = useRef<CombatResolver | null>(null);
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  
  // State management
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [playerEntities, setPlayerEntities] = useState<CombatEntity[]>([]);
  const [opponentEntities, setOpponentEntities] = useState<CombatEntity[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [isProcessing, setIsProcessing] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  // Initialize combat system
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new CombatEngine({
      targetFPS: 60,
      maxProjectiles: 500,
      enableWebGL: true,
      enableParticleEffects: true,
      performanceBudget: {
        maxMemoryMB: 50,
        maxCPUPercentage: 80,
        targetFrameTime: 16.67
      }
    });

    const resolver = new CombatResolver({
      enableLogging: true,
      maxActionQueue: 10,
      enableEffectChaining: true,
      damageCalculationMode: 'advanced'
    });

    const monitor = new PerformanceMonitor();

    engineRef.current = engine;
    resolverRef.current = resolver;
    monitorRef.current = monitor;

    // Setup performance monitoring
    monitor.addListener((metrics) => {
      setPerformanceMetrics(metrics);
    });

    // Initialize battle
    initializeBattle();

    return () => {
      engine.stop();
      monitor.reset();
    };
  }, [playerCards, opponentCards]);

  /**
   * Initialize battle state and entities
   */
  const initializeBattle = useCallback(() => {
    if (!engineRef.current || !resolverRef.current) return;

    const battleState: BattleState = {
      id: `battle_${Date.now()}`,
      player: {
        id: 'player',
        name: 'Player',
        health: 100,
        maxHealth: 100,
        energy: 10,
        maxEnergy: 10,
        cards: playerCards
      },
      opponent: {
        id: 'opponent',
        name: 'Opponent',
        health: 100,
        maxHealth: 100,
        energy: 10,
        maxEnergy: 10,
        cards: opponentCards
      },
      currentTurn: 'player',
      turnNumber: 1,
      phase: 'DEPLOYMENT',
      startTime: Date.now()
    };

    setBattleState(battleState);

    // Create entities from cards
    const playerEntities = playerCards.slice(0, 3).map((card, index) => 
      new CombatEntity({
        card,
        position: { x: 200 + index * 150, y: 500 },
        isPlayer: true
      })
    );

    const opponentEntities = opponentCards.slice(0, 3).map((card, index) => 
      new CombatEntity({
        card,
        position: { x: 800 + index * 150, y: 200 },
        isPlayer: false
      })
    );

    setPlayerEntities(playerEntities);
    setOpponentEntities(opponentEntities);

    // Start combat engine
    engineRef.current?.start(battleState);
  }, [playerCards, opponentCards]);

  /**
   * Handle card selection
   */
  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
  };

  /**
   * Handle attack action
   */
  const handleAttack = (targetEntity: CombatEntity) => {
    if (!selectedCard || !battleState || isProcessing) return;

    setIsProcessing(true);

    const action: CombatAction = {
      id: `action_${Date.now()}`,
      type: 'ATTACK',
      source: playerEntities.find(e => e.card.id === selectedCard.id),
      target: targetEntity,
      data: { card: selectedCard },
      timestamp: Date.now()
    };

    if (resolverRef.current?.queueAction(action)) {
      const results = resolverRef.current.processQueue();
      processResults(results);
    }

    setIsProcessing(false);
  };

  /**
   * Process combat results
   */
  const processResults = (results: any[]) => {
    results.forEach(result => {
      if (result.success) {
        addToBattleLog(`Action completed: ${result.type}`);
        
        // Update entity states
        updateEntityStates(result);
        
        // Check victory conditions
        checkVictoryConditions();
      } else {
        addToBattleLog(`Action failed: ${result.data?.reason || 'Unknown error'}`);
      }
    });
  };

  /**
   * Update entity states based on results
   */
  const updateEntityStates = (result: any) => {
    // Update player entities
    setPlayerEntities(prev => 
      prev.map(entity => {
        // Find matching entity in results
        if (result.data?.entityId === entity.id) {
          return CombatEntity.deserialize({
            ...entity.serialize(),
            health: result.data.remainingHealth || entity.health
          });
        }
        return entity;
      })
    );

    // Update opponent entities similarly
    setOpponentEntities(prev => 
      prev.map(entity => {
        if (result.data?.entityId === entity.id) {
          return CombatEntity.deserialize({
            ...entity.serialize(),
            health: result.data.remainingHealth || entity.health
          });
        }
        return entity;
      })
    );
  };

  /**
   * Check victory conditions
   */
  const checkVictoryConditions = () => {
    const alivePlayerEntities = playerEntities.filter(e => e.isAlive);
    const aliveOpponentEntities = opponentEntities.filter(e => e.isAlive);

    if (alivePlayerEntities.length === 0) {
      handleBattleComplete('opponent');
    } else if (aliveOpponentEntities.length === 0) {
      handleBattleComplete('player');
    }
  };

  /**
   * Handle battle completion
   */
  const handleBattleComplete = (winner: 'player' | 'opponent') => {
    if (onBattleComplete) {
      onBattleComplete({
        winner,
        playerEntities: playerEntities.map(e => e.serialize()),
        opponentEntities: opponentEntities.map(e => e.serialize()),
        duration: Date.now() - (battleState?.startTime || 0)
      });
    }
  };

  /**
   * Add message to battle log
   */
  const addToBattleLog = (message: string) => {
    setBattleLog(prev => [...prev.slice(-9), message]);
  };

  /**
   * End turn
   */
  const endTurn = () => {
    setCurrentTurn('opponent');
    
    // AI opponent turn (simplified)
    setTimeout(() => {
      if (opponentEntities.length > 0) {
        const randomTarget = playerEntities[Math.floor(Math.random() * playerEntities.length)];
        const randomAttacker = opponentEntities[Math.floor(Math.random() * opponentEntities.length)];
        
        if (randomTarget && randomAttacker) {
          const action: CombatAction = {
            id: `action_${Date.now()}`,
            type: 'ATTACK',
            source: randomAttacker,
            target: randomTarget,
            data: { card: randomAttacker.card },
            timestamp: Date.now()
          };

          resolverRef.current?.queueAction(action);
          const results = resolverRef.current?.processQueue() || [];
          processResults(results);
        }
      }
      
      setCurrentTurn('player');
    }, 1000);
  };

  return (
    <div className="combat-screen">
      <div className="combat-header">
        <div className="battle-info">
          <h2>Battle Arena</h2>
          <div className="turn-indicator">
            Current Turn: <span className={currentTurn}>{currentTurn}</span>
          </div>
        </div>
        
        {performanceMetrics && (
          <div className="performance-metrics">
            <span>FPS: {Math.round(performanceMetrics.fps)}</span>
            <span>Entities: {performanceMetrics.entityCount}</span>
            <span>Memory: {(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
          </div>
        )}
      </div>

      <div className="combat-arena">
        <canvas 
          ref={canvasRef}
          className="combat-canvas"
          width={1200}
          height={600}
        />
        
        <div className="ui-overlay">
          {/* Player entities */}
          <div className="player-zone">
            <h3>Your Cards</h3>
            <div className="entity-list">
              {playerEntities.map(entity => (
                <div 
                  key={entity.id}
                  className={`entity-card ${entity.isAlive ? 'alive' : 'dead'} ${selectedCard?.id === entity.card.id ? 'selected' : ''}`}
                  onClick={() => handleCardSelect(entity.card)}
                >
                  <div className="card-emoji">{entity.card.emoji}</div>
                  <div className="card-stats">
                    <div>HP: {entity.health}/{entity.maxHealth}</div>
                    <div>ATK: {entity.stats.attack}</div>
                    <div>DEF: {entity.stats.defense}</div>
                    <div>Energy: {entity.energy}/{entity.maxEnergy}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opponent entities */}
          <div className="opponent-zone">
            <h3>Opponent Cards</h3>
            <div className="entity-list">
              {opponentEntities.map(entity => (
                <div 
                  key={entity.id}
                  className={`entity-card ${entity.isAlive ? 'alive' : 'dead'}`}
                  onClick={() => selectedCard && handleAttack(entity)}
                >
                  <div className="card-emoji">{entity.card.emoji}</div>
                  <div className="card-stats">
                    <div>HP: {entity.health}/{entity.maxHealth}</div>
                    <div>ATK: {entity.stats.attack}</div>
                    <div>DEF: {entity.stats.defense}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="combat-controls">
        <div className="action-panel">
          <button 
            onClick={endTurn}
            disabled={isProcessing || currentTurn !== 'player'}
            className="end-turn-btn"
          >
            End Turn
          </button>
          
          <button 
            onClick={onExit}
            className="exit-battle-btn"
          >
            Exit Battle
          </button>
        </div>

        <div className="battle-log">
          <h4>Battle Log</h4>
          <div className="log-messages">
            {battleLog.map((message, index) => (
              <div key={index} className="log-message">{message}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatScreen;