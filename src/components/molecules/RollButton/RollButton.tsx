import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Icon, Text } from '../../atoms';
import './RollButton.css';

interface RollButtonProps {
  onRoll?: () => void;
  disabled?: boolean;
  loading?: boolean;
  rollCount?: number;
  className?: string;
  testId?: string;
}

export const RollButton: React.FC<RollButtonProps> = ({
  onRoll,
  disabled = false,
  loading = false,
  rollCount = 0,
  className = '',
  testId,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRoll = async () => {
    if (disabled || loading || isAnimating) return;

    setIsAnimating(true);
    
    if (onRoll) {
      onRoll();
    }

    // Reset animation after a delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <div className={`roll-button ${className}`.trim()} data-testid={testId}>
      <motion.div
        className="roll-button__container"
        animate={isAnimating ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 0.6 }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={handleRoll}
          disabled={disabled || loading}
          loading={loading}
          className="roll-button__btn"
        >
          <Icon
            name="roll"
            size="lg"
            spin={loading || isAnimating}
          />
          <div className="roll-button__text">
            <Text variant="h5" color="inherit" weight="bold">
              {loading ? 'Rolling...' : 'Roll Card'}
            </Text>
            {rollCount > 0 && (
              <Text variant="caption" color="inherit">
                Rolls: {rollCount}
              </Text>
            )}
          </div>
        </Button>
      </motion.div>

      {/* Particles effect */}
      {isAnimating && (
        <div className="roll-button__particles">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="roll-button__particle"
              initial={{ scale: 0, rotate: 0 }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 360],
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
