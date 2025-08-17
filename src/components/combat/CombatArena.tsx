import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../types/card';
import './CombatArena.css';

interface CombatArenaProps {
  playerCards: Card[];
  opponentCards: Card[];
  onBattleComplete?: (winner: 'player' | 'opponent') => void;
}

interface CardPosition {
  id: string;
  x: number;
  y: number;
  card: Card;
  health: number;
  maxHealth: number;
  isPlayer: boolean;
}

export const CombatArena: React.FC<CombatArenaProps> = ({
  playerCards,
  opponentCards,
  onBattleComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [placedCards, setPlacedCards] = useState<CardPosition[]>([]);
  const [activeProjectiles, setActiveProjectiles] = useState<any[]>([]);
  const [battleInProgress, setBattleInProgress] = useState(false);
  const [battleResult, setBattleResult] = useState<'player' | 'opponent' | null>(null);
  
  // Setup initial opponent cards
  useEffect(() => {
    const initialOpponentPositions: CardPosition[] = opponentCards.map((card, index) => {
      // Calculate positions based on opponent area
      const totalWidth = Math.min(opponentCards.length * 120, 600);
      const startX = (window.innerWidth - totalWidth) / 2 + 60;
      const x = startX + index * 120;
      const y = 120; // Top area
      
      return {
        id: `opponent-${card.id}-${index}`,
        x,
        y,
        card,
        health: card.stats?.health || 100,
        maxHealth: card.stats?.health || 100,
        isPlayer: false
      };
    });
    
    setPlacedCards(initialOpponentPositions);
  }, [opponentCards]);

  // Handle card dragging
  const handleDragStart = (card: Card) => {
    setDraggedCard(card);
  };

  const handleDragEnd = (event: any) => {
    if (!draggedCard || !arenaRef.current) return;
    
    const rect = arenaRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if within player placement area (bottom half)
    if (y > rect.height / 2) {
      // Add card to arena at this position
      const newCard: CardPosition = {
        id: `player-${draggedCard.id}-${Date.now()}`,
        x,
        y,
        card: draggedCard,
        health: draggedCard.stats?.health || 100,
        maxHealth: draggedCard.stats?.health || 100,
        isPlayer: true
      };
      
      setPlacedCards(prev => [...prev, newCard]);
    }
    
    setDraggedCard(null);
  };

  // Battle mechanics
  const startBattle = () => {
    if (battleInProgress) return;
    
    // Check if player has placed any cards
    const playerCardsPlaced = placedCards.filter(card => card.isPlayer).length > 0;
    if (!playerCardsPlaced) {
      alert('Please place at least one card in the arena!');
      return;
    }
    
    setBattleInProgress(true);
    setBattleResult(null);
    
    // Start battle loop
    // This would be connected to the CombatEngine
    // For now, we'll just simulate projectiles with a simple interval
    const battleInterval = setInterval(() => {
      // For each card, generate a projectile toward a random enemy
      const playerCards = placedCards.filter(card => card.isPlayer && card.health > 0);
      const opponentCards = placedCards.filter(card => !card.isPlayer && card.health > 0);
      
      // Check win condition
      if (playerCards.length === 0) {
        clearInterval(battleInterval);
        setBattleInProgress(false);
        setBattleResult('opponent');
        if (onBattleComplete) onBattleComplete('opponent');
        return;
      }
      
      if (opponentCards.length === 0) {
        clearInterval(battleInterval);
        setBattleInProgress(false);
        setBattleResult('player');
        if (onBattleComplete) onBattleComplete('player');
        return;
      }
      
      // Generate projectiles
      playerCards.forEach(playerCard => {
        if (Math.random() < 0.3) { // 30% chance to fire per card per tick
          const target = opponentCards[Math.floor(Math.random() * opponentCards.length)];
          generateProjectile(playerCard, target);
        }
      });
      
      opponentCards.forEach(opponentCard => {
        if (Math.random() < 0.3) { // 30% chance to fire per card per tick
          const target = playerCards[Math.floor(Math.random() * playerCards.length)];
          generateProjectile(opponentCard, target);
        }
      });
      
    }, 500); // Tick every 500ms
    
    return () => clearInterval(battleInterval);
  };

  const generateProjectile = (source: CardPosition, target: CardPosition) => {
    // Get emoji from source card to use as projectile
    const emoji = source.card.emoji || source.card.emojis?.[0] || '✨';
    
    // Create new projectile
    const projectile = {
      id: `projectile-${Date.now()}-${Math.random()}`,
      sourceId: source.id,
      targetId: target.id,
      startX: source.x,
      startY: source.y,
      currentX: source.x,
      currentY: source.y,
      targetX: target.x,
      targetY: target.y,
      progress: 0,
      emoji,
      damage: source.card.damage || source.card.attack || 10
    };
    
    setActiveProjectiles(prev => [...prev, projectile]);
  };

  // Animation frame for projectile movement
  useEffect(() => {
    if (!battleInProgress || activeProjectiles.length === 0) return;
    
    let animationFrameId: number;
    
    const animateProjectiles = () => {
      setActiveProjectiles(prevProjectiles => {
        // Move projectiles toward their targets
        const updatedProjectiles = prevProjectiles.map(projectile => {
          const newProgress = projectile.progress + 0.05; // Speed factor
          
          if (newProgress >= 1) {
            // Hit target - deal damage
            setPlacedCards(prevCards => {
              return prevCards.map(card => {
                if (card.id === projectile.targetId) {
                  // Apply damage
                  const newHealth = Math.max(0, card.health - projectile.damage);
                  return { ...card, health: newHealth };
                }
                return card;
              });
            });
            
            // Remove projectile
            return null;
          } else {
            // Update position
            const newX = projectile.startX + (projectile.targetX - projectile.startX) * newProgress;
            const newY = projectile.startY + (projectile.targetY - projectile.startY) * newProgress;
            
            return {
              ...projectile,
              currentX: newX,
              currentY: newY,
              progress: newProgress
            };
          }
        }).filter(Boolean) as any[];
        
        return updatedProjectiles;
      });
      
      animationFrameId = requestAnimationFrame(animateProjectiles);
    };
    
    animationFrameId = requestAnimationFrame(animateProjectiles);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [battleInProgress, activeProjectiles]);

  // Render health bars
  const renderHealthBar = (current: number, max: number) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    let color = '#4caf50'; // Green
    
    if (percentage < 25) color = '#f44336'; // Red
    else if (percentage < 50) color = '#ff9800'; // Orange
    
    return (
      <div className="health-bar-container">
        <div 
          className="health-bar-fill" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color 
          }} 
        />
        <span className="health-text">{Math.ceil(current)}/{max}</span>
      </div>
    );
  };

  return (
    <div className="combat-arena-container">
      {/* Battle controls */}
      <div className="battle-controls">
        <button 
          className={`start-battle-button ${battleInProgress ? 'disabled' : ''}`}
          onClick={startBattle}
          disabled={battleInProgress}
        >
          {battleInProgress ? 'Battle in Progress' : 'Start Battle'}
        </button>
        
        {battleResult && (
          <div className={`battle-result ${battleResult}`}>
            {battleResult === 'player' ? 'You Won!' : 'You Lost!'}
          </div>
        )}
      </div>
      
      {/* Main arena */}
      <div className="arena" ref={arenaRef}>
        {/* Opponent area */}
        <div className="opponent-area">
          {/* Show placed opponent cards */}
        </div>
        
        {/* Battle field */}
        <div className="battle-field">
          <canvas ref={canvasRef} className="battle-canvas" />
          
          {/* Render placed cards */}
          {placedCards.map(cardPos => (
            <div 
              key={cardPos.id} 
              className={`placed-card ${cardPos.isPlayer ? 'player-card' : 'opponent-card'} ${cardPos.health <= 0 ? 'defeated' : ''}`}
              style={{ 
                left: cardPos.x - 40, // Center the card
                top: cardPos.y - 60   // Center the card
              }}
            >
              <div className="card-emoji">{cardPos.card.emoji || cardPos.card.emojis?.[0] || '❓'}</div>
              <div className="card-name">{cardPos.card.name}</div>
              {renderHealthBar(cardPos.health, cardPos.maxHealth)}
            </div>
          ))}
          
          {/* Render projectiles */}
          {activeProjectiles.map(projectile => (
            <div 
              key={projectile.id} 
              className="projectile"
              style={{ 
                left: projectile.currentX, 
                top: projectile.currentY,
                fontSize: '24px'
              }}
            >
              {projectile.emoji}
            </div>
          ))}
        </div>
        
        {/* Player area */}
        <div className="player-area">
          {/* Player's hand - cards that can be dragged to the field */}
          <div className="player-hand">
            {playerCards.map((card, index) => (
              <motion.div 
                key={`hand-${card.id}-${index}`}
                className="player-hand-card"
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.5}
                onDragStart={() => handleDragStart(card)}
                onDragEnd={handleDragEnd}
                whileDrag={{ scale: 1.1, zIndex: 10 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="card-emoji">{card.emoji || card.emojis?.[0] || '❓'}</div>
                <div className="card-name">{card.name}</div>
                <div className="card-stats">
                  {card.attack && <span>⚔️ {card.attack}</span>}
                  {card.defense && <span>🛡️ {card.defense}</span>}
                  {card.stats?.health && <span>❤️ {card.stats.health}</span>}
                </div>
                <div className="card-rarity">{card.rarity}</div>
              </motion.div>
            ))}
          </div>
          
          {/* Placement instructions */}
          <div className="placement-instructions">
            Drag cards to the arena to place them for battle
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatArena;
