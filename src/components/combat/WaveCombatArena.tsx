import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../types/card';
import './WaveCombatArena.css';

interface WaveCombatArenaProps {
  playerCards: Card[];
  opponentCards: Card[];
  onBattleComplete?: (winner: 'player' | 'opponent') => void;
}

interface PlayerAvatar {
  id: string;
  name: string;
  image: string;
  health: number;
  maxHealth: number;
  emojiInventory: string[]; // All emojis from player cards
  attackCooldown: number;
  position: { x: number; y: number };
}

interface EmojiProjectile {
  id: string;
  emoji: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  progress: number;
  damage: number;
  fromPlayer: boolean;
  trajectory: 'straight' | 'arc' | 'wave' | 'spiral' | 'random';
  rotation: number;
  scale: number;
  velocity: { x: number; y: number };
}

export const WaveCombatArena: React.FC<WaveCombatArenaProps> = ({
  playerCards,
  opponentCards,
  onBattleComplete
}) => {
  const arenaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  
  // Game state
  const [battleInProgress, setBattleInProgress] = useState(false);
  const [battleResult, setBattleResult] = useState<'player' | 'opponent' | null>(null);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [turnTimer, setTurnTimer] = useState(0);
  
  // Avatars
  const [playerAvatar, setPlayerAvatar] = useState<PlayerAvatar>({
    id: 'player',
    name: 'Joueur',
    image: '🧙‍♂️', // Avatar du joueur - sera remplacé par une vraie image à terme
    health: 100,
    maxHealth: 100,
    emojiInventory: [],
    attackCooldown: 0,
    position: { x: 200, y: 300 } // Position à gauche, centré verticalement
  });
  
  const [opponentAvatar, setOpponentAvatar] = useState<PlayerAvatar>({
    id: 'opponent',
    name: 'Adversaire IA',
    image: '🤖', // Avatar de l'adversaire - sera remplacé par une vraie image à terme
    health: 100,
    maxHealth: 100,
    emojiInventory: [],
    attackCooldown: 0,
    position: { x: window.innerWidth - 200, y: 300 } // Position à droite, centré verticalement
  });
  
  const [activeProjectiles, setActiveProjectiles] = useState<EmojiProjectile[]>([]);
  
  // Initialize emoji inventories from cards
  useEffect(() => {
    // Collecter tous les émojis des cartes du joueur
    const playerEmojis: string[] = [];
    playerCards.forEach(card => {
      if (card.emoji) {
        playerEmojis.push(card.emoji);
      }
      if (card.emojis) {
        playerEmojis.push(...card.emojis);
      }
    });
    
    // Collecter tous les émojis des cartes adverses
    const opponentEmojis: string[] = [];
    opponentCards.forEach(card => {
      if (card.emoji) {
        opponentEmojis.push(card.emoji);
      }
      if (card.emojis) {
        opponentEmojis.push(...card.emojis);
      }
    });
    
    setPlayerAvatar(prev => ({ ...prev, emojiInventory: playerEmojis }));
    setOpponentAvatar(prev => ({ ...prev, emojiInventory: opponentEmojis }));
  }, [playerCards, opponentCards]);
  
  // Fonction pour lancer une vague d'émojis
  const launchEmojiWave = useCallback((fromPlayer: boolean) => {
    const attacker = fromPlayer ? playerAvatar : opponentAvatar;
    const target = fromPlayer ? opponentAvatar : playerAvatar;
    
    if (attacker.emojiInventory.length === 0) return;
    
    // Créer un projectile pour chaque emoji dans l'inventaire
    const newProjectiles: EmojiProjectile[] = attacker.emojiInventory.map((emoji, index) => {
      const trajectories: Array<'straight' | 'arc' | 'wave' | 'spiral' | 'random'> = 
        ['straight', 'arc', 'wave', 'spiral', 'random'];
      
      // Légère dispersion pour que les émojis ne se chevauchent pas
      const spreadAngle = (Math.PI / 4) * (index / attacker.emojiInventory.length - 0.5);
      const baseDistance = 100;
      const spreadX = Math.cos(spreadAngle) * baseDistance * 0.3;
      const spreadY = Math.sin(spreadAngle) * baseDistance * 0.3;
      
      return {
        id: `projectile-${Date.now()}-${index}`,
        emoji,
        startX: attacker.position.x + spreadX,
        startY: attacker.position.y + spreadY,
        currentX: attacker.position.x + spreadX,
        currentY: attacker.position.y + spreadY,
        targetX: target.position.x,
        targetY: target.position.y,
        progress: 0,
        damage: Math.floor(Math.random() * 15) + 5, // Dégâts aléatoires 5-20
        fromPlayer,
        trajectory: trajectories[Math.floor(Math.random() * trajectories.length)],
        rotation: 0,
        scale: 1,
        velocity: { x: 0, y: 0 }
      };
    });
    
    setActiveProjectiles(prev => [...prev, ...newProjectiles]);
    
    // Animation d'attaque pour l'avatar
    if (fromPlayer) {
      setPlayerAvatar(prev => ({ ...prev, attackCooldown: 60 })); // 1 seconde de cooldown
    } else {
      setOpponentAvatar(prev => ({ ...prev, attackCooldown: 60 }));
    }
  }, [playerAvatar, opponentAvatar]);
  
  // Démarrer la bataille
  const startBattle = () => {
    if (battleInProgress) return;
    
    if (playerAvatar.emojiInventory.length === 0) {
      alert('Vous avez besoin de cartes pour combattre !');
      return;
    }
    
    setBattleInProgress(true);
    setBattleResult(null);
    setCurrentTurn('player');
    setTurnTimer(0);
  };
  
  
  // Animation loop
  useEffect(() => {
    if (!battleInProgress) return;
    
    const animate = () => {
      // Décompter les cooldowns
      setPlayerAvatar(prev => ({ 
        ...prev, 
        attackCooldown: Math.max(0, prev.attackCooldown - 1) 
      }));
      setOpponentAvatar(prev => ({ 
        ...prev, 
        attackCooldown: Math.max(0, prev.attackCooldown - 1) 
      }));
      
      // Timer de tour
      setTurnTimer(prev => prev + 1);
      
      // Autobattle - tours automatiques pour les deux joueurs
      if (turnTimer > 120 && playerAvatar.attackCooldown === 0 && opponentAvatar.attackCooldown === 0) {
        if (currentTurn === 'player') {
          launchEmojiWave(true);
          setCurrentTurn('opponent');
          setTurnTimer(0);
        } else if (currentTurn === 'opponent') {
          launchEmojiWave(false);
          setCurrentTurn('player');
          setTurnTimer(0);
        }
      }
      
      // Animer les projectiles
      setActiveProjectiles(prevProjectiles => {
        return prevProjectiles.map(projectile => {
          const newProgress = projectile.progress + 0.02; // Vitesse
          
          if (newProgress >= 1) {
            // Impact - appliquer les dégâts
            if (projectile.fromPlayer) {
              setOpponentAvatar(prev => ({
                ...prev,
                health: Math.max(0, prev.health - projectile.damage)
              }));
            } else {
              setPlayerAvatar(prev => ({
                ...prev,
                health: Math.max(0, prev.health - projectile.damage)
              }));
            }
            return null; // Supprimer le projectile
          }
          
          // Calculer la nouvelle position selon la trajectoire
          let newX = projectile.startX + (projectile.targetX - projectile.startX) * newProgress;
          let newY = projectile.startY + (projectile.targetY - projectile.startY) * newProgress;
          
          // Appliquer les effets de trajectoire
          switch (projectile.trajectory) {
            case 'arc':
              newY -= Math.sin(Math.PI * newProgress) * 50;
              break;
            case 'wave':
              newX += Math.sin(newProgress * Math.PI * 3) * 30;
              break;
            case 'spiral': {
              const spiral = newProgress * Math.PI * 4;
              newX += Math.cos(spiral) * (1 - newProgress) * 40;
              newY += Math.sin(spiral) * (1 - newProgress) * 40;
              break;
            }
            case 'random':
              newX += (Math.random() - 0.5) * 20;
              newY += (Math.random() - 0.5) * 20;
              break;
          }
          
          return {
            ...projectile,
            currentX: newX,
            currentY: newY,
            progress: newProgress,
            rotation: projectile.rotation + 5,
            scale: 1 + Math.sin(newProgress * Math.PI * 2) * 0.2
          };
        }).filter(Boolean) as EmojiProjectile[];
      });
      
      // Vérifier les conditions de victoire
      if (playerAvatar.health <= 0 && battleResult === null) {
        setBattleResult('opponent');
        setBattleInProgress(false);
        if (onBattleComplete) onBattleComplete('opponent');
      } else if (opponentAvatar.health <= 0 && battleResult === null) {
        setBattleResult('player');
        setBattleInProgress(false);
        if (onBattleComplete) onBattleComplete('player');
      }
      
      if (battleInProgress) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [battleInProgress, currentTurn, turnTimer, playerAvatar.health, opponentAvatar.health, battleResult, launchEmojiWave, onBattleComplete, playerAvatar.attackCooldown, opponentAvatar.attackCooldown]);
  
  // Render health bar
  const renderHealthBar = (current: number, max: number, isPlayer: boolean) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    let color = '#4caf50'; // Green
    
    if (percentage < 25) color = '#f44336'; // Red
    else if (percentage < 50) color = '#ff9800'; // Orange
    
    return (
      <div className={`health-bar-container ${isPlayer ? 'player' : 'opponent'}`}>
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
    <div className="wave-combat-arena" ref={arenaRef}>
      {/* Battle controls */}
      <div className="battle-controls">
        {!battleInProgress ? (
          <motion.button 
            className="start-battle-button"
            onClick={startBattle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🚀 Commencer l&apos;Autobattle
          </motion.button>
        ) : (
          <div className="autobattle-status">
            ⚔️ Combat Automatique en Cours...
          </div>
        )}
        
        {battleResult && (
          <motion.div 
            className={`battle-result ${battleResult}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {battleResult === 'player' ? '🎉 Victoire !' : '💀 Défaite !'}
          </motion.div>
        )}
        
        {battleInProgress && (
          <div className="turn-indicator">
            Tour : {currentTurn === 'player' ? '👤 Joueur' : '🤖 Adversaire'}
            {playerAvatar.attackCooldown > 0 && (
              <div className="cooldown">Cooldown: {Math.ceil(playerAvatar.attackCooldown / 60)}s</div>
            )}
          </div>
        )}
      </div>
      
      {/* Battle field */}
      <div className="battle-field">
        {/* Opponent Avatar */}
        <motion.div 
          className="avatar opponent-avatar"
          style={{ 
            left: opponentAvatar.position.x, 
            top: opponentAvatar.position.y 
          }}
          animate={opponentAvatar.attackCooldown > 0 ? { 
            scale: [1, 1.1, 1],
            rotate: [0, -3, 3, 0] 
          } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="avatar-portrait">
            <div className="avatar-frame">
              <div className="avatar-image">{opponentAvatar.image}</div>
            </div>
          </div>
          <div className="avatar-info">
            <div className="avatar-name">{opponentAvatar.name}</div>
            {renderHealthBar(opponentAvatar.health, opponentAvatar.maxHealth, false)}
          </div>
          
          {/* Inventaire émojis adversaire */}
          <div className="emoji-inventory opponent">
            {opponentAvatar.emojiInventory.slice(0, 8).map((emoji, index) => (
              <span key={index} className="inventory-emoji">{emoji}</span>
            ))}
            {opponentAvatar.emojiInventory.length > 8 && (
              <span className="emoji-count">+{opponentAvatar.emojiInventory.length - 8}</span>
            )}
          </div>
        </motion.div>
        
        {/* Player Avatar */}
        <motion.div 
          className="avatar player-avatar"
          style={{ 
            left: playerAvatar.position.x, 
            top: playerAvatar.position.y 
          }}
          animate={playerAvatar.attackCooldown > 0 ? { 
            scale: [1, 1.1, 1],
            rotate: [0, 3, -3, 0] 
          } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="avatar-portrait">
            <div className="avatar-frame">
              <div className="avatar-image">{playerAvatar.image}</div>
            </div>
          </div>
          <div className="avatar-info">
            <div className="avatar-name">{playerAvatar.name}</div>
            {renderHealthBar(playerAvatar.health, playerAvatar.maxHealth, true)}
          </div>
          
          {/* Inventaire émojis joueur */}
          <div className="emoji-inventory player">
            {playerAvatar.emojiInventory.slice(0, 8).map((emoji, index) => (
              <span key={index} className="inventory-emoji">{emoji}</span>
            ))}
            {playerAvatar.emojiInventory.length > 8 && (
              <span className="emoji-count">+{playerAvatar.emojiInventory.length - 8}</span>
            )}
          </div>
        </motion.div>
        
        {/* Projectiles */}
        <AnimatePresence>
          {activeProjectiles.map(projectile => (
            <motion.div
              key={projectile.id}
              className={`emoji-projectile ${projectile.fromPlayer ? 'from-player' : 'from-opponent'}`}
              style={{
                left: projectile.currentX,
                top: projectile.currentY,
                transform: `rotate(${projectile.rotation}deg) scale(${projectile.scale})`,
                fontSize: '24px'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: projectile.scale, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
            >
              {projectile.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Player cards display at bottom */}
      <div className="player-cards-area">
        <h3>Vos Cartes</h3>
        <div className="cards-row">
          {playerCards.map((card, index) => (
            <div key={index} className="display-card">
              <div className="card-emoji">{card.emoji || card.emojis?.[0] || '❓'}</div>
              <div className="card-name">{card.name}</div>
              <div className="card-rarity">{card.rarity}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WaveCombatArena;
