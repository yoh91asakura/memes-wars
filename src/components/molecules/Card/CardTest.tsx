import React from 'react';
import { Card } from './Card';
import { rareCards } from '../../../data/cards/rare';
import { commonCards } from '../../../data/cards/common';
import { legendaryCards } from '../../../data/cards/legendary';

// Test component to showcase the new TCG card design
export const CardTest: React.FC = () => {
  const testCards = [
    commonCards[0], // Fire Ember
    rareCards[0],   // Ancient Dragon
    legendaryCards[0] // Stonks Master
  ];

  return (
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      padding: '2rem',
      background: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <div>
        <h3>TCG Layout (New)</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {testCards.map((card) => (
            <Card 
              key={card.id}
              card={card}
              variant="tcg"
              size="md"
              interactive={true}
              onClick={(card) => console.log('Clicked card:', card)}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h3>Compact Layout (Legacy)</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {testCards.map((card) => (
            <Card 
              key={`compact-${card.id}`}
              card={card}
              variant="compact"
              size="md"
              interactive={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};