// Player Deck Display - Shows equipped cards during combat
import React from 'react';
import { Card } from '../../../models/Card';
import './PlayerDeckDisplay.css';

export interface PlayerDeckDisplayProps {
    playerName: string;
    cards: Card[];
    isPlayer?: boolean;
    className?: string;
}

export const PlayerDeckDisplay: React.FC<PlayerDeckDisplayProps> = ({
    playerName,
    cards,
    isPlayer = false,
    className = ''
}) => {
    return (
        <div className={`player-deck-display ${isPlayer ? 'player-deck' : 'opponent-deck'} ${className}`}>
            <div className="deck-header">
                <h4>{playerName}</h4>
                <span className="card-count">{cards.length} cards</span>
            </div>

            <div className="deck-cards">
                {cards.map((card, index) => (
                    <div
                        key={`${card.id}-${index}`}
                        className={`deck-card rarity-${card.rarity}`}
                        title={`${card.name} - ${card.attack}⚔️ ${card.health}❤️`}
                    >
                        <div className="card-emoji">{card.emoji}</div>
                        <div className="card-info">
                            <span className="card-name">{card.name}</span>
                            <div className="card-stats">
                                <span className="stat attack">{card.attack}⚔️</span>
                                <span className="stat health">{card.health}❤️</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
