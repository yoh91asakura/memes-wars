import React from 'react';
import { useCardsStore } from '../../stores/cardsStore';
import { createTestCards } from '../../utils/testCards';

export const TestCardButton: React.FC = () => {
  const { addMultipleCards, collection, clearCollection } = useCardsStore();

  const handleAddTestCards = () => {
    const testCards = createTestCards();
    addMultipleCards(testCards);
    console.log('Added test cards:', testCards.length);
  };

  const handleClearCards = () => {
    clearCollection();
    console.log('Cleared all cards');
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      zIndex: 9999,
      display: 'flex',
      gap: '8px',
      flexDirection: 'column'
    }}>
      <button
        onClick={handleAddTestCards}
        style={{
          padding: '8px 16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
        data-testid="add-test-cards"
      >
        Add Test Cards ({collection.length})
      </button>
      
      <button
        onClick={handleClearCards}
        style={{
          padding: '8px 16px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
        data-testid="clear-test-cards"
      >
        Clear Cards
      </button>
    </div>
  );
};