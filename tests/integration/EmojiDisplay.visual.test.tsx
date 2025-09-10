/**
 * Visual integration tests for EmojiDisplay component
 * Tests the visual appearance and layout of emoji displays
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmojiDisplay } from '../../src/components/atoms/EmojiDisplay';
import { EmojiEffectsManager } from '../../src/data/emojiEffects';

describe('EmojiDisplay Visual Tests', () => {
  // Test all supported emojis from the central system
  const testEmojis = EmojiEffectsManager.getAllEmojis().slice(0, 10); // Test first 10

  describe('Size variations', () => {
    const sizes = ['small', 'medium', 'large', 'xlarge'] as const;

    sizes.forEach(size => {
      test(`should render ${size} size correctly`, () => {
        render(
          <EmojiDisplay
            emoji="🗿"
            size={size}
            showEffects={true}
            showTooltip={true}
            showTrajectory={true}
          />
        );

        const display = screen.getByText('🗿').closest('.emoji-display');
        expect(display).toHaveClass(`emoji-display--${size}`);
        
        // Verify size-specific styling is applied
        const character = screen.getByText('🗿');
        expect(character).toHaveClass('emoji-display__character');
      });
    });
  });

  describe('Effect system integration', () => {
    test('should display damage and speed stats for emoji with effects', () => {
      const emojiWithEffect = '🗿'; // Stone emoji with known effects
      const effect = EmojiEffectsManager.getEffect(emojiWithEffect);
      
      expect(effect).toBeDefined();
      
      render(
        <EmojiDisplay
          emoji={emojiWithEffect}
          showEffects={true}
          showTooltip={true}
        />
      );

      // Check that stats are displayed
      const damageElement = screen.getByText(effect!.damage.toString());
      const speedElement = screen.getByText(effect!.speed.toString());
      
      expect(damageElement).toBeInTheDocument();
      expect(speedElement).toBeInTheDocument();
    });

    test('should show rarity indicators for different rarity levels', () => {
      const rarityEmojis = {
        common: '🗿',
        uncommon: '⚡',
        rare: '🌪️',
        epic: '💯'
      };

      Object.entries(rarityEmojis).forEach(([rarity, emoji]) => {
        const { container } = render(
          <EmojiDisplay
            emoji={emoji}
            showEffects={true}
            data-testid={`emoji-${rarity}`}
          />
        );

        const display = container.querySelector('.emoji-display');
        expect(display).toHaveClass(`emoji-display--${rarity}`);
      });
    });
  });

  describe('Interactive states', () => {
    test('should apply clickable styles when onClick is provided', () => {
      const handleClick = vi.fn();
      
      render(
        <EmojiDisplay
          emoji="🗿"
          onClick={handleClick}
        />
      );

      const display = screen.getByText('🗿').closest('.emoji-display');
      expect(display).toHaveClass('emoji-display--clickable');
    });

    test('should show trajectory indicators in detail mode', () => {
      render(
        <EmojiDisplay
          emoji="🗿"
          showTrajectory={true}
          showEffects={true}
        />
      );

      // Should have trajectory stat indicator
      const stats = screen.getByText('🗿').closest('.emoji-display')?.querySelector('.emoji-display__stats');
      expect(stats).toBeInTheDocument();
    });
  });

  describe('Animation and visual effects', () => {
    test('should apply animation classes when animated=true', () => {
      render(
        <EmojiDisplay
          emoji="🗿"
          animated={true}
        />
      );

      const display = screen.getByText('🗿').closest('.emoji-display');
      expect(display).toHaveClass('emoji-display--animated');
    });

    test('should render special effects for epic rarity', () => {
      render(
        <EmojiDisplay
          emoji="💯" // Epic emoji
          showEffects={true}
        />
      );

      const display = screen.getByText('💯').closest('.emoji-display');
      expect(display).toHaveClass('emoji-display--epic');
      
      // Should have special effect element
      const specialEffect = display?.querySelector('.emoji-display__special-effect--epic');
      expect(specialEffect).toBeInTheDocument();
    });
  });

  describe('Layout consistency', () => {
    test('should maintain consistent layout across different emojis', () => {
      testEmojis.forEach(emoji => {
        const { container } = render(
          <EmojiDisplay
            emoji={emoji}
            showEffects={true}
            showTooltip={true}
            data-testid={`emoji-${emoji}`}
          />
        );

        const display = container.querySelector('.emoji-display');
        expect(display).toBeInTheDocument();
        
        // Should have main character
        const character = container.querySelector('.emoji-display__character');
        expect(character).toBeInTheDocument();
        expect(character?.textContent).toBe(emoji);
        
        // Should have stats if effect exists
        const effect = EmojiEffectsManager.getEffect(emoji);
        if (effect) {
          const stats = container.querySelector('.emoji-display__stats');
          expect(stats).toBeInTheDocument();
        }
      });
    });
  });

  describe('Accessibility', () => {
    test('should provide proper tooltip information', () => {
      const emoji = '🗿';
      const effect = EmojiEffectsManager.getEffect(emoji);
      
      render(
        <EmojiDisplay
          emoji={emoji}
          showTooltip={true}
        />
      );

      const display = screen.getByText(emoji).closest('.emoji-display');
      const title = display?.getAttribute('title');
      
      expect(title).toContain(emoji);
      expect(title).toContain(effect?.description);
      expect(title).toContain(`Damage: ${effect?.damage}`);
      expect(title).toContain(`Speed: ${effect?.speed}`);
    });

    test('should be focusable when clickable', () => {
      const handleClick = vi.fn();
      
      render(
        <EmojiDisplay
          emoji="🗿"
          onClick={handleClick}
        />
      );

      const display = screen.getByText('🗿').closest('.emoji-display');
      expect(display).toHaveAttribute('tabIndex');
    });
  });

  describe('Performance validation', () => {
    test('should render efficiently with multiple emojis', () => {
      const startTime = performance.now();
      
      testEmojis.forEach((emoji, index) => {
        render(
          <EmojiDisplay
            emoji={emoji}
            showEffects={true}
            key={index}
          />
        );
      });
      
      const renderTime = performance.now() - startTime;
      
      // Should render 10 emojis in less than 100ms
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('Error handling', () => {
    test('should handle unknown emojis gracefully', () => {
      const unknownEmoji = '🤖'; // Not in emoji effects system
      
      render(
        <EmojiDisplay
          emoji={unknownEmoji}
          showEffects={true}
        />
      );

      const display = screen.getByText(unknownEmoji);
      expect(display).toBeInTheDocument();
      
      // Should not have effect stats for unknown emoji
      const stats = display.closest('.emoji-display')?.querySelector('.emoji-display__stats');
      expect(stats).not.toBeInTheDocument();
    });
  });
});