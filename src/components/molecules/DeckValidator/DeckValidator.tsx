// DeckValidator - Pre-combat deck validation and optimization interface
// Simplified version to avoid type conflicts

import React, { useState } from 'react';
import { Button } from '../../atoms/Button';
import './DeckValidator.module.css';

export interface DeckValidatorProps {
  currentDeck: Record<string, unknown>[];
  onDeckValid: (deck: Record<string, unknown>[]) => void;
  onCancel?: () => void;
  requiredSynergies?: string[];
  className?: string;
}

export const DeckValidator: React.FC<DeckValidatorProps> = ({
  currentDeck,
  onDeckValid,
  onCancel,
  requiredSynergies: _requiredSynergies = [],
  className = ''
}) => {
  const [selectedCards] = useState<Record<string, unknown>[]>(currentDeck);

  // Simple validation - just check if deck has cards
  const isValid = selectedCards.length > 0;

  const handleConfirm = () => {
    if (isValid) {
      onDeckValid(selectedCards);
    }
  };

  return (
    <div className={`deck-validator ${className}`}>
      <div className="validator-header">
        <div className="deck-info">
          <h3>Deck Validation</h3>
          <div className="deck-stats">
            <span className={`deck-size ${isValid ? 'valid' : 'invalid'}`}>
              {selectedCards.length} cards
            </span>
          </div>
        </div>
      </div>

      <div className="validation-status">
        <div className={`check ${isValid ? 'valid' : 'invalid'}`}>
          <span>{isValid ? '✓' : '✗'} Deck has cards</span>
        </div>
      </div>

      <div className="deck-summary">
        <h4>Current Deck</h4>
        <p>{selectedCards.length} cards ready for combat</p>
        {selectedCards.length === 0 && (
          <p className="warning">Your deck is empty! Add some cards to continue.</p>
        )}
      </div>

      <div className="confirmation-actions">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Skip Validation
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={!isValid}
        >
          Start Combat ({selectedCards.length} cards)
        </Button>
      </div>
    </div>
  );
};

export default DeckValidator;