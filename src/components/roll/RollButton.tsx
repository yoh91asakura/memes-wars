import React from 'react';
import { motion } from 'framer-motion';
import './RollButton.css';

interface RollButtonProps {
  onClick: () => void;
  disabled?: boolean;
  cost: number;
}

export const RollButton: React.FC<RollButtonProps> = ({ onClick, disabled, cost }) => {
  return (
    <motion.button
      className={`roll-button ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { 
        scale: 1.1,
        boxShadow: "0 0 30px rgba(255, 255, 255, 0.5)"
      }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={{
        boxShadow: [
          "0 0 20px rgba(255, 255, 255, 0.2)",
          "0 0 40px rgba(255, 255, 255, 0.4)",
          "0 0 20px rgba(255, 255, 255, 0.2)"
        ]
      }}
      transition={{
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <div className="roll-button-content">
        <span className="roll-emoji">🎲</span>
        <span className="roll-text">ROLL</span>
        <span className="roll-cost">🪙 {cost}</span>
      </div>
      
      {/* Animated gradient background */}
      <div className="roll-button-gradient" />
    </motion.button>
  );
};
