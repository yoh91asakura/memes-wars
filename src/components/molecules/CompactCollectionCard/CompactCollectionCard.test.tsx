import React from 'react';
import { render, screen } from '@testing-library/react';
import { CompactCollectionCard } from './CompactCollectionCard';
import { UnifiedCard } from '../../../models/unified/Card';

const mockCard: UnifiedCard = {
  id: 'test-card-1',
  name: 'Test Card',
  description: 'A test card',
  emoji: '🃏',
  rarity: 'rare',
  rarityProbability: 100,
  luck: 5,
  family: 'TEST',
  reference: 'Test reference',
  goldReward: 100,
  type: 'CREATURE',
  cost: 3,
  attack: 5,
  defense: 3,
  health: 4,
  attackSpeed: 1.0,
  passiveAbility: {
    name: 'Test Ability',
    description: 'Test description',
    trigger: 'onPlay',
    effect: 'none'
  },
  goldGeneration: 10,
  dustValue: 50,
  tradeable: true,
  level: 1,
  experience: 0,
  stackCount: 3,
  maxStacks: 10,
  stackBonus: {
    luckMultiplier: 1.5,
    goldMultiplier: 1.2,
    bonusEmojis: [],
    effectBonus: 0,
    damageBonus: 0
  },
  visual: {
    glow: '#3498db',
    borderColor: '#2980b9',
    backgroundColor: '#ffffff',
    textColor: '#000000'
  },
  emojis: [],
  cardEffects: [],
  synergies: [],
  craftable: false,
  isActive: true,
  isLimited: false,
  effects: [],
  tags: ['test'],
  flavor: 'Test flavor',
  releaseDate: '2024-01-01',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
};

describe('CompactCollectionCard', () => {
  test('renders compact card with emoji and name', () => {
    render(
      <CompactCollectionCard
        card={mockCard}
        testId="test-card"
      />
    );

    expect(screen.getByText('🃏')).toBeInTheDocument();
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // stack count
  });

  test('applies rarity color styling', () => {
    const { container } = render(
      <CompactCollectionCard
        card={mockCard}
        testId="test-card"
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('compact-collection-card--rare');
  });

  test('handles mouse events', () => {
    const handleMouseEnter = jest.fn();
    const handleMouseLeave = jest.fn();

    render(
      <CompactCollectionCard
        card={mockCard}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        testId="test-card"
      />
    );

    const card = screen.getByTestId('test-card');
    
    // Test mouse enter
    card.dispatchEvent(new MouseEvent('mouseenter', { clientX: 100, clientY: 100 }));
    expect(handleMouseEnter).toHaveBeenCalledWith(mockCard, expect.any(Object));

    // Test mouse leave
    card.dispatchEvent(new MouseEvent('mouseleave'));
    expect(handleMouseLeave).toHaveBeenCalled();
  });

  test('applies custom className', () => {
    const { container } = render(
      <CompactCollectionCard
        card={mockCard}
        className="custom-class"
        testId="test-card"
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  test('handles click events', () => {
    const handleClick = jest.fn();

    render(
      <CompactCollectionCard
        card={mockCard}
        onClick={handleClick}
        testId="test-card"
      />
    );

    const card = screen.getByTestId('test-card');
    card.click();
    expect(handleClick).toHaveBeenCalledWith(mockCard);
  });

  test('does not show stack badge when count is 1', () => {
    const singleCard = { ...mockCard, stackCount: 1 };
    render(
      <CompactCollectionCard
        card={singleCard}
        testId="test-card"
      />
    );

    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
});