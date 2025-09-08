import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardsStore } from '../../../stores/cardsStore';
import { AutoRollSettings } from '../../../stores/cardsStore';
import { Button } from '../../atoms/Button';
import { Text } from '../../atoms/Text';
import { Icon } from '../../atoms/Icon';
import './AutoRollControls.css';

interface AutoRollControlsProps {
  className?: string;
  testId?: string;
}

export const AutoRollControls: React.FC<AutoRollControlsProps> = ({
  className = '',
  testId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [settings, setSettings] = useState<AutoRollSettings>({
    enabled: false,
    maxRolls: 10,
    stopOnRarity: undefined,
    animationSpeed: 'normal',
    batchSize: 1
  });

  const { 
    autoRollState, 
    startAutoRoll, 
    stopAutoRoll, 
    pauseAutoRoll, 
    resumeAutoRoll,
    updateAutoRollSettings 
  } = useCardsStore();

  const handleStartAutoRoll = () => {
    startAutoRoll(settings);
  };

  const handleStopAutoRoll = () => {
    stopAutoRoll();
  };

  const handleSettingsUpdate = (newSettings: Partial<AutoRollSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    updateAutoRollSettings(updatedSettings);
  };

  const progressPercentage = autoRollState.progress.totalRolls > 0 
    ? (autoRollState.progress.currentRoll / autoRollState.progress.totalRolls) * 100 
    : 0;

  const remainingRolls = autoRollState.progress.totalRolls - autoRollState.progress.currentRoll;

  return (
    <div className={`auto-roll-controls ${className}`.trim()} data-testid={testId}>
      <div className="auto-roll-controls__header">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="auto-roll-controls__toggle"
          testId="toggle-auto-roll"
        >
          <Icon emoji="⚡" size="sm" />
          <Text variant="body" weight="medium">
            Auto Roll
          </Text>
          <Icon 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size="sm" 
          />
        </Button>

        {autoRollState.isActive && (
          <div className="auto-roll-controls__status">
            <div className="auto-roll-controls__progress">
              <Text variant="caption" color="muted">
                {autoRollState.progress.currentRoll}/{autoRollState.progress.totalRolls}
              </Text>
              <div className="auto-roll-controls__progress-bar">
                <div 
                  className="auto-roll-controls__progress-fill" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="auto-roll-controls__panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!autoRollState.isActive ? (
              <div className="auto-roll-controls__settings">
                <div className="auto-roll-controls__setting-row">
                  <Text variant="caption" weight="medium">Number of Rolls:</Text>
                  <div className="auto-roll-controls__number-input">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSettingsUpdate({ 
                        maxRolls: Math.max(1, (settings.maxRolls || 10) - 10) 
                      })}
                      testId="auto-roll-decrease"
                    >
                      <Icon name="minus" size="xs" />
                    </Button>
                    <Text variant="body" weight="medium">
                      {settings.maxRolls || 10}
                    </Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSettingsUpdate({ 
                        maxRolls: Math.min(1000, (settings.maxRolls || 10) + 10) 
                      })}
                      testId="auto-roll-increase"
                    >
                      <Icon name="plus" size="xs" />
                    </Button>
                  </div>
                </div>

                <div className="auto-roll-controls__setting-row">
                  <Text variant="caption" weight="medium">Animation Speed:</Text>
                  <div className="auto-roll-controls__speed-buttons">
                    {(['slow', 'normal', 'fast', 'instant'] as const).map(speed => (
                      <Button
                        key={speed}
                        variant={settings.animationSpeed === speed ? "primary" : "ghost"}
                        size="xs"
                        onClick={() => handleSettingsUpdate({ animationSpeed: speed })}
                      >
                        {speed === 'instant' ? '⚡' : speed === 'fast' ? '🏃‍♂️' : speed === 'normal' ? '🚶‍♂️' : '🐌'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="auto-roll-controls__setting-row">
                  <Text variant="caption" weight="medium">Stop on Rarity:</Text>
                  <div className="auto-roll-controls__rarity-buttons">
                    {['EPIC', 'LEGENDARY', 'MYTHIC', 'COSMIC'].map(rarity => (
                      <Button
                        key={rarity}
                        variant={settings.stopOnRarity === rarity ? "primary" : "ghost"}
                        size="xs"
                        onClick={() => handleSettingsUpdate({ 
                          stopOnRarity: settings.stopOnRarity === rarity ? undefined : rarity 
                        })}
                      >
                        {rarity.slice(0, 3)}
                      </Button>
                    ))}
                    <Button
                      variant={settings.stopOnRarity === undefined ? "primary" : "ghost"}
                      size="xs"
                      onClick={() => handleSettingsUpdate({ stopOnRarity: undefined })}
                    >
                      None
                    </Button>
                  </div>
                </div>

                <div className="auto-roll-controls__actions">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleStartAutoRoll}
                    testId="start-auto-roll"
                  >
                    <Icon emoji="▶️" size="sm" />
                    Start Auto Roll
                  </Button>
                </div>
              </div>
            ) : (
              <div className="auto-roll-controls__active">
                <div className="auto-roll-controls__progress-details">
                  <Text variant="body" weight="medium">
                    Rolling automatically... {remainingRolls} rolls remaining
                  </Text>
                  
                  {autoRollState.progress.cardsObtained.length > 0 && (
                    <Text variant="caption" color="muted">
                      Latest cards: {autoRollState.progress.cardsObtained
                        .slice(-3)
                        .map(card => card.name)
                        .join(', ')}
                    </Text>
                  )}
                </div>

                <div className="auto-roll-controls__active-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStopAutoRoll}
                    testId="stop-auto-roll"
                  >
                    <Icon emoji="⏹️" size="sm" />
                    Stop
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};