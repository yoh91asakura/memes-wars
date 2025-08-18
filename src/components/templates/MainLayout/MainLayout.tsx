import React from 'react';
import { Navigation } from '../../organisms/Navigation/Navigation';
import { Text } from '../../atoms/Text';
import { Icon } from '../../atoms/Icon';
import { Badge } from '../../atoms/Badge';
import { usePlayerStore, useCardsStore } from '../../../stores';
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
  const { coins, gems, level } = usePlayerStore();
  const { collection } = useCardsStore();
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
      id: 'battle',
      label: 'Battle Arena',
      icon: 'battle',
      active: currentPage === 'battle',
      onClick: () => onNavigate('battle'),
    },
  ];

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
                <Icon emoji="💰" size="sm" />
                <Text variant="caption" weight="medium">
                  {coins}
                </Text>
              </div>
              <div className="main-layout__stat">
                <Icon emoji="💎" size="sm" />
                <Text variant="caption" weight="medium">
                  {gems}
                </Text>
              </div>
              <div className="main-layout__stat">
                <Badge variant="primary" size="sm">
                  Lv. {level}
                </Badge>
              </div>
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
    </div>
  );
};
