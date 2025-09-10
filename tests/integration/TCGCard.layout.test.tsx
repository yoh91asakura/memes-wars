/**
 * Layout integration tests for TCGCard component
 * Tests card positioning, layout consistency, and responsive behavior
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { TCGCard } from '../../src/components/organisms/TCGCard';
import { Card } from '../../src/models/Card';

describe('TCGCard Layout Tests', () => {
  const mockCard: Card = {
    id: 'test-card',
    name: 'Test Card',
    emoji: '🗿',
    hp: 100,
    luck: 500,
    rarity: 10,
    emojis: [
      { character: '🗿', damage: 8, effect: 'DIRECT' },
      { character: '💥', damage: 6, effect: 'DIRECT' }
    ],
    cardEffects: [],
    createdAt: new Date().toISOString(),
    stackLevel: 1,
    goldReward: 20
  };

  describe('Size consistency', () => {
    const sizes = ['small', 'medium', 'large'] as const;

    sizes.forEach(size => {
      test(`should maintain proper proportions in ${size} size`, () => {
        render(
          <TCGCard
            card={mockCard}
            size={size}
            showStats={true}
            showEmojis={true}
          />
        );

        const cardElement = screen.getByText('Test Card').closest('.tcgCard');
        expect(cardElement).toHaveClass(`tcgCard`);
        expect(cardElement).toHaveClass(size);
        
        // Check that card frame is present
        const cardFrame = cardElement?.querySelector('.cardFrame');
        expect(cardFrame).toBeInTheDocument();
        
        // Verify all sections are present
        const headerSection = cardElement?.querySelector('.headerSection');
        const imageSection = cardElement?.querySelector('.imageSection');
        const footerSection = cardElement?.querySelector('.footerSection');
        
        expect(headerSection).toBeInTheDocument();
        expect(imageSection).toBeInTheDocument();
        expect(footerSection).toBeInTheDocument();
      });
    });
  });

  describe('Grid layout structure', () => {
    test('should use CSS Grid for proper section alignment', () => {
      render(
        <TCGCard
          card={mockCard}
          showStats={true}
          showEmojis={true}
        />
      );

      const cardFrame = screen.getByText('Test Card').closest('.tcgCard')?.querySelector('.cardFrame');
      expect(cardFrame).toBeInTheDocument();
      
      // Check grid structure
      const computedStyle = window.getComputedStyle(cardFrame!);
      expect(computedStyle.display).toBe('grid');
    });

    test('should position sections in correct grid rows', () => {
      render(
        <TCGCard
          card={mockCard}
          showStats={true}
          showEmojis={true}
        />
      );

      const cardElement = screen.getByText('Test Card').closest('.tcgCard');
      
      // Header should be in grid row 1
      const headerSection = cardElement?.querySelector('.headerSection');
      expect(headerSection).toHaveStyle('grid-row: 1');
      
      // Image should be in grid row 2
      const imageSection = cardElement?.querySelector('.imageSection');
      expect(imageSection).toHaveStyle('grid-row: 2');
      
      // Footer should be in grid row 5 (last row)
      const footerSection = cardElement?.querySelector('.footerSection');
      expect(footerSection).toHaveStyle('grid-row: 5');
    });
  });

  describe('Emoji system integration', () => {
    test('should display EmojiDisplay component when no image URL provided', () => {
      render(
        <TCGCard
          card={mockCard}
          showEmojis={true}
        />
      );

      const imageSection = screen.getByText('Test Card').closest('.tcgCard')?.querySelector('.imageSection');
      
      // Should contain emoji display
      const emojiDisplay = imageSection?.querySelector('.emoji-display');
      expect(emojiDisplay).toBeInTheDocument();
      
      // Should show the card's main emoji
      expect(screen.getByText('🗿')).toBeInTheDocument();
    });

    test('should show emoji inventory section', () => {
      render(
        <TCGCard
          card={mockCard}
          showEmojis={true}
        />
      );

      const emojiSection = screen.getByText('Test Card').closest('.tcgCard')?.querySelector('.emojiSection');
      expect(emojiSection).toBeInTheDocument();
      expect(emojiSection).toHaveStyle('grid-row: 3');
    });

    test('should hide emoji sections when showEmojis=false', () => {
      render(
        <TCGCard
          card={mockCard}
          showEmojis={false}
        />
      );

      const emojiSection = screen.getByText('Test Card').closest('.tcgCard')?.querySelector('.emojiSection');
      expect(emojiSection).not.toBeInTheDocument();
    });
  });

  describe('Variant-specific layouts', () => {
    const variants = ['collection', 'battle', 'detail'] as const;

    variants.forEach(variant => {
      test(`should apply ${variant} variant styling`, () => {
        render(
          <TCGCard
            card={mockCard}
            variant={variant}
            showStats={true}
            showEmojis={true}
          />
        );

        const cardElement = screen.getByText('Test Card').closest('.tcgCard');
        expect(cardElement).toHaveClass(variant);
      });
    });

    test('should show detailed emoji effects in detail variant', () => {
      render(
        <TCGCard
          card={mockCard}
          variant="detail"
          showEmojis={true}
        />
      );

      // In detail variant, should show trajectory and full effects
      const emojiDisplay = screen.getByText('🗿').closest('.emoji-display');
      expect(emojiDisplay).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    test('should maintain aspect ratio across different container sizes', () => {
      const { container } = render(
        <div style={{ width: '200px' }}>
          <TCGCard
            card={mockCard}
            showStats={true}
            showEmojis={true}
          />
        </div>
      );

      const cardElement = container.querySelector('.tcgCard');
      expect(cardElement).toBeInTheDocument();
      
      // Should have padding-bottom for aspect ratio
      const computedStyle = window.getComputedStyle(cardElement!);
      expect(computedStyle.paddingBottom).toBe('140%');
    });

    test('should scale content appropriately for different sizes', () => {
      const { rerender } = render(
        <TCGCard
          card={mockCard}
          size="small"
          showStats={true}
        />
      );

      let cardElement = screen.getByText('Test Card').closest('.tcgCard');
      expect(cardElement).toHaveClass('small');

      rerender(
        <TCGCard
          card={mockCard}
          size="large"
          showStats={true}
        />
      );

      cardElement = screen.getByText('Test Card').closest('.tcgCard');
      expect(cardElement).toHaveClass('large');
    });
  });

  describe('Animation and interactions', () => {
    test('should apply clickable styles when onClick provided', () => {
      const handleClick = vi.fn();
      
      render(
        <TCGCard
          card={mockCard}
          onClick={handleClick}
        />
      );

      const cardElement = screen.getByText('Test Card').closest('.tcgCard');
      expect(cardElement).toHaveClass('clickable');
    });

    test('should disable animations when animated=false', () => {
      render(
        <TCGCard
          card={mockCard}
          animated={false}
        />
      );

      const cardElement = screen.getByText('Test Card').closest('.tcgCard');
      expect(cardElement).toBeInTheDocument();
    });
  });

  describe('Content overflow handling', () => {
    test('should handle long card names gracefully', () => {
      const longNameCard = {
        ...mockCard,
        name: 'This is an extremely long card name that should be handled properly'
      };

      render(
        <TCGCard
          card={longNameCard}
          showStats={true}
        />
      );

      const headerSection = screen.getByText(longNameCard.name).closest('.headerSection');
      expect(headerSection).toBeInTheDocument();
      
      // Should not overflow container
      const computedStyle = window.getComputedStyle(headerSection!);
      expect(computedStyle.overflow).toBe('hidden');
    });

    test('should handle many emojis without breaking layout', () => {
      const manyEmojisCard = {
        ...mockCard,
        emojis: [
          { character: '🗿', damage: 8, effect: 'DIRECT' },
          { character: '💥', damage: 6, effect: 'DIRECT' },
          { character: '🔥', damage: 5, effect: 'BURN' },
          { character: '❄️', damage: 4, effect: 'FREEZE' },
          { character: '⚡', damage: 6, effect: 'STUN' },
          { character: '💨', damage: 3, effect: 'BOOST' },
          { character: '🌊', damage: 7, effect: 'HEAL' }
        ]
      };

      render(
        <TCGCard
          card={manyEmojisCard}
          showEmojis={true}
        />
      );

      const emojiSection = screen.getByText('Test Card').closest('.tcgCard')?.querySelector('.emojiSection');
      expect(emojiSection).toBeInTheDocument();
      
      // Should contain emoji inventory
      const emojiInventory = emojiSection?.querySelector('.emojiInventory');
      expect(emojiInventory).toBeInTheDocument();
    });
  });

  describe('Performance validation', () => {
    test('should render efficiently', () => {
      const startTime = performance.now();
      
      render(
        <TCGCard
          card={mockCard}
          showStats={true}
          showEmojis={true}
          animated={true}
        />
      );
      
      const renderTime = performance.now() - startTime;
      
      // Should render in less than 50ms
      expect(renderTime).toBeLessThan(50);
    });

    test('should not cause layout thrashing with multiple cards', () => {
      const cards = Array.from({ length: 10 }, (_, i) => ({
        ...mockCard,
        id: `card-${i}`,
        name: `Card ${i}`
      }));

      const startTime = performance.now();
      
      render(
        <div>
          {cards.map(card => (
            <TCGCard
              key={card.id}
              card={card}
              size="small"
              showStats={true}
              showEmojis={true}
            />
          ))}
        </div>
      );
      
      const renderTime = performance.now() - startTime;
      
      // Should render 10 cards in less than 200ms
      expect(renderTime).toBeLessThan(200);
    });
  });
});