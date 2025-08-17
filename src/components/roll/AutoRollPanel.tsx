import React from 'react';
import { motion } from 'framer-motion';
import './AutoRollPanel.css';

interface AutoRollPanelProps {
  onAutoRoll: (count: number) => void;
  onClose: () => void;
  hideRoll: boolean;
  onHideRollToggle: () => void;
  coins: number;
}

export const AutoRollPanel: React.FC<AutoRollPanelProps> = ({
  onAutoRoll,
  onClose,
  hideRoll,
  onHideRollToggle,
  coins
}) => {
  const rollOptions = [
    { count: 10, cost: 1000, label: '10x' },
    { count: 25, cost: 2500, label: '25x' },
    { count: 50, cost: 5000, label: '50x' },
  ];

  return (
    <motion.div 
      className="auto-roll-panel"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="panel-header">
        <h3>Auto Roll</h3>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>
      
      <div className="roll-options">
        {rollOptions.map((option) => (
          <motion.button
            key={option.count}
            className={`roll-option ${coins < option.cost ? 'disabled' : ''}`}
            onClick={() => onAutoRoll(option.count)}
            disabled={coins < option.cost}
            whileHover={coins >= option.cost ? { scale: 1.05 } : {}}
            whileTap={coins >= option.cost ? { scale: 0.95 } : {}}
          >
            <div className="option-label">{option.label}</div>
            <div className="option-cost">🪙 {option.cost.toLocaleString()}</div>
          </motion.button>
        ))}
      </div>
      
      <div className="panel-settings">
        <label className="hide-roll-toggle">
          <input
            type="checkbox"
            checked={hideRoll}
            onChange={onHideRollToggle}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label">
            Hide Roll
            <span className="toggle-desc">Skip animations for Common-Legendary</span>
          </span>
        </label>
      </div>
      
      <div className="panel-info">
        <p>⚡ Auto-stop on Mythic or Cosmic</p>
        <p>💰 Current coins: {coins.toLocaleString()}</p>
      </div>
    </motion.div>
  );
};
