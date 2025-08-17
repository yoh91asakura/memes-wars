import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../types/card';
import WaveCombatArena from '../combat/WaveCombatArena';
import { commonCards } from '../../data/cards/common';
import './CombatScreen.css';

interface CombatScreenProps {
  playerCards?: Card[];
  onBattleComplete?: (winner: 'player' | 'opponent', rewards?: any) => void;
  onExit?: () => void;
  onNavigateBack?: () => void;
}

export const CombatScreen: React.FC<CombatScreenProps> = ({
  playerCards = [],
  onBattleComplete,
  onExit,
  onNavigateBack
}) => {
  const [gamePhase, setGamePhase] = useState<'setup' | 'battle' | 'result'>('setup');
  const [battleResult, setBattleResult] = useState<'player' | 'opponent' | null>(null);
  const [rewards, setRewards] = useState<any>(null);
  
  // Default cards for testing if no playerCards provided
  const defaultPlayerCards: Card[] = playerCards.length > 0 ? playerCards : commonCards.slice(0, 5);
  
  // Generate random opponent cards
  const opponentCards: Card[] = commonCards.slice(5, 10);
  
  const handleBattleComplete = useCallback((winner: 'player' | 'opponent') => {
    setBattleResult(winner);
    setGamePhase('result');
    
    // Calculate rewards if player wins
    if (winner === 'player') {
      const battleRewards = {
        coins: Math.floor(Math.random() * 100) + 50,
        experience: Math.floor(Math.random() * 50) + 25,
        items: ['Health Potion', 'Mana Crystal']
      };
      setRewards(battleRewards);
    }
    
    if (onBattleComplete) {
      onBattleComplete(winner, rewards);
    }
  }, [onBattleComplete, rewards]);
  
  const handlePlayAgain = () => {
    setGamePhase('setup');
    setBattleResult(null);
    setRewards(null);
  };
  
  const handleExit = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else if (onExit) {
      onExit();
    }
  };
  
  if (gamePhase === 'result') {
    return (
      <motion.div 
        className="combat-result-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="result-content">
          <motion.h1 
            className={`result-title ${battleResult}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            {battleResult === 'player' ? 'VICTORY!' : 'DEFEAT!'}
          </motion.h1>
          
          {battleResult === 'player' && rewards && (
            <motion.div 
              className="rewards-section"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2>Battle Rewards</h2>
              <div className="rewards-list">
                <div className="reward-item">
                  <span className="reward-icon">💰</span>
                  <span>{rewards.coins} Coins</span>
                </div>
                <div className="reward-item">
                  <span className="reward-icon">⭐</span>
                  <span>{rewards.experience} XP</span>
                </div>
                {rewards.items && rewards.items.map((item: string, index: number) => (
                  <div key={index} className="reward-item">
                    <span className="reward-icon">🎁</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          <motion.div 
            className="result-actions"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button className="play-again-btn" onClick={handlePlayAgain}>
              Battle Again
            </button>
            <button className="exit-btn" onClick={handleExit}>
              Exit Combat
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="combat-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Combat Header */}
      <div className="combat-header">
        <motion.button 
          className="exit-combat-btn"
          onClick={handleExit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Exit Combat
        </motion.button>
        
        <h1 className="combat-title">EMOJI BATTLE ARENA</h1>
        
        <div className="phase-indicator">
          Phase: {gamePhase.toUpperCase()}
        </div>
      </div>
      
      {/* Main Wave Combat Arena */}
      <WaveCombatArena 
        playerCards={defaultPlayerCards}
        opponentCards={opponentCards}
        onBattleComplete={handleBattleComplete}
      />
    </motion.div>
  );
};
