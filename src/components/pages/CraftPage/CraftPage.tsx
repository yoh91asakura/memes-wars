// CraftPage - Main crafting page
import React, { useCallback } from 'react';
import { CraftPanel } from '../../organisms/CraftPanel';
import { Text } from '../../atoms/Text';
import { useCardsStore } from '../../../stores/cardsStore';
import { usePlayerStore } from '../../../stores/playerStore';
import './CraftPage.css';

interface CraftPageProps {
  className?: string;
  testId?: string;
}

export const CraftPage: React.FC<CraftPageProps> = ({
  className = '',
  testId
}) => {
  const { spendCoins, spendGems } = usePlayerStore();
  const { removeCards } = useCardsStore();
  
  const handleCraftSuccess = useCallback((recipeName: string) => {
    // Show success notification
    console.log(`Successfully crafted: ${recipeName}`);
    
    // Could trigger toast notification here
    // toast.success(`Crafted ${recipeName}!`);
  }, []);
  
  return (
    <div className={`craft-page ${className}`.trim()} data-testid={testId || 'craft-page'}>
      {/* Page Header */}
      <section className="craft-page__header">
        <div className="craft-page__title-section">
          <Text variant="h1" weight="bold" align="center">
            🛠️ Crafting Workshop
          </Text>
          <Text variant="h4" color="muted" align="center">
            Transform your cards into powerful items and upgrades
          </Text>
        </div>
        
        <div className="craft-page__intro">
          <Text variant="body" align="center">
            Combine duplicate cards and resources to create consumables, permanent upgrades, and special items.
            Each recipe has different requirements and provides unique benefits for your journey.
          </Text>
        </div>
      </section>
      
      {/* Main Crafting Interface */}
      <section className="craft-page__main">
        <CraftPanel 
          className="craft-page__craft-panel"
          onCraftSuccess={handleCraftSuccess}
        />
      </section>
      
      {/* Help/Instructions */}
      <section className="craft-page__help">
        <details className="craft-page__help-details">
          <summary className="craft-page__help-summary">
            <Text variant="subtitle" weight="medium">
              📖 Crafting Guide
            </Text>
          </summary>
          
          <div className="craft-page__help-content">
            <div className="craft-page__help-section">
              <Text variant="subtitle" weight="medium" color="primary">
                🧪 Consumables
              </Text>
              <Text variant="body">
                Temporary items that provide boosts for a limited time or number of uses.
                Great for pushing through difficult stages or maximizing rewards.
              </Text>
            </div>
            
            <div className="craft-page__help-section">
              <Text variant="subtitle" weight="medium" color="success">
                ⚡ Permanent Upgrades
              </Text>
              <Text variant="body">
                One-time crafts that permanently improve your account.
                These are expensive but provide lasting benefits to your progression.
              </Text>
            </div>
            
            <div className="craft-page__help-section">
              <Text variant="subtitle" weight="medium" color="warning">
                🎴 Special Cards
              </Text>
              <Text variant="body">
                Transform multiple lower-rarity cards into higher-rarity ones.
                Perfect for converting duplicates into more powerful cards.
              </Text>
            </div>
            
            <div className="craft-page__help-section">
              <Text variant="subtitle" weight="medium" color="info">
                💡 Tips
              </Text>
              <ul className="craft-page__tips-list">
                <li>
                  <Text variant="body">
                    Craft consumables before big roll sessions to maximize rewards
                  </Text>
                </li>
                <li>
                  <Text variant="body">
                    Save rare materials for permanent upgrades - they have lasting value
                  </Text>
                </li>
                <li>
                  <Text variant="body">
                    Some recipes have cooldowns or can only be crafted once
                  </Text>
                </li>
                <li>
                  <Text variant="body">
                    Check your active items regularly - some expire or have limited uses
                  </Text>
                </li>
              </ul>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
};