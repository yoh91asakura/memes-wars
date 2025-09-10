import React, { useState } from 'react';
import { Navigation } from '../../organisms/Navigation/Navigation';
import { AudioSettings } from '../../organisms/AudioSettings';
import { Button } from '../../atoms/Button';
import { Text } from '../../atoms/Text';
import { Icon } from '../../atoms/Icon';
import { Badge } from '../../atoms/Badge';
import { usePlayerStore, useCardsStore, useGold, useTickets, useGems, currencyActions } from '../../../stores';
import { useAudio } from '../../../hooks/useAudio';
import './MainLayout.css';

interface MainLayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
  className?: string;
  testId?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentPage,
  onNavigate,
  children,
  className = '',
  testId,
}) => {
  const { level } = usePlayerStore();
  const { collection } = useCardsStore();
  const gold = useGold();
  const tickets = useTickets();
  const gems = useGems();
  const { playSFX, isEnabled } = useAudio();
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const navigationItems = [
    {
      id: 'roll',
      label: 'Card Rolls',
      icon: 'roll',
      active: currentPage === 'roll',
      onClick: () => onNavigate('roll'),
    },
    {
      id: 'collection',
      label: `Collection (${collection.length})`,
      icon: 'cards',
      active: currentPage === 'collection',
      onClick: () => onNavigate('collection'),
    },
    {
      id: 'deck',
      label: 'Deck Builder',
      icon: 'deck',
      active: currentPage === 'deck',
      onClick: () => onNavigate('deck'),
    },
    {
      id: 'craft',
      label: 'Crafting',
      icon: 'craft',
      active: currentPage === 'craft',
      onClick: () => onNavigate('craft'),
    },
    {
      id: 'battle',
      label: 'Battle Arena',
      icon: 'battle',
      active: currentPage === 'battle',
      onClick: () => onNavigate('battle'),
    },
  ];

  const handleAudioSettingsClick = () => {
    playSFX('ui_click');
    setShowAudioSettings(true);
  };

  const handleResetGame = async () => {
    if (confirm('Reset the game? This will clear all progress and give you starter cards + currency.')) {
      playSFX('ui_click');
      
      console.log('Resetting game...');
      
      // Reset currency first
      currencyActions.resetForNewPlayer();
      console.log('Currency reset completed');
      
      // Reset cards and give starters
      const { clearCollection, giveStarterCards } = useCardsStore.getState();
      clearCollection();
      console.log('Collection cleared');
      
      // Wait for starter cards to be added
      await giveStarterCards();
      console.log('Starter cards added');
      
      console.log('Game reset completed');
    }
  };

  const handleCloseAudioSettings = () => {
    playSFX('ui_click');
    setShowAudioSettings(false);
  };

  return (
    <div className={`main-layout ${className}`.trim()} data-testid={testId}>
      {/* Header */}
      <header className="main-layout__header">
        <div className="main-layout__header-content">
          <div className="main-layout__logo">
            <Icon name="cards" size="lg" color="primary" />
            <Text variant="h4" weight="bold" color="primary">
              The Meme Wars
            </Text>
          </div>
          
          <div className="main-layout__status">
            <div className="main-layout__stats">
              <div className="main-layout__stat">
                <Icon emoji="🪙" size="sm" />
                <Text variant="caption" weight="medium">
                  {gold || 0}
                </Text>
              </div>
              <div className="main-layout__stat">
                <Icon emoji="🎫" size="sm" />
                <Text variant="caption" weight="medium">
                  {tickets || 0}
                </Text>
              </div>
              {gems && gems > 0 && (
                <div className="main-layout__stat">
                  <Icon emoji="💎" size="sm" />
                  <Text variant="caption" weight="medium">
                    {gems}
                  </Text>
                </div>
              )}
              <div className="main-layout__stat">
                <Badge variant="primary" size="sm">
                  Lv. {level}
                </Badge>
              </div>
            </div>
            <div className="main-layout__actions">
              <Button
                onClick={handleResetGame}
                variant="danger"
                size="sm"
                className="reset-game-btn"
                testId="reset-game-button"
              >
                🔄 Reset
              </Button>
              <Button
                onClick={handleAudioSettingsClick}
                variant="secondary"
                size="sm"
                className="audio-settings-btn"
                testId="audio-settings-button"
              >
                {isEnabled ? '🔊' : '🔇'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="main-layout__nav">
        <Navigation items={navigationItems} variant="horizontal" />
      </nav>

      {/* Main Content */}
      <main className="main-layout__main">
        {children}
      </main>

      {/* Footer */}
      <footer className="main-layout__footer">
        <Text variant="caption" color="muted" align="center">
          The Meme Wars v1.0.0 - Built with ❤️ and ⚡
        </Text>
      </footer>

      {/* Audio Settings Modal */}
      {showAudioSettings && (
        <div className="modal-overlay" onClick={handleCloseAudioSettings}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AudioSettings
              onClose={handleCloseAudioSettings}
              testId="main-audio-settings"
            />
          </div>
        </div>
      )}
    </div>
  );
};
