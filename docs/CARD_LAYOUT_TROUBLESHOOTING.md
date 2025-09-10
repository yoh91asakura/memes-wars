# Card Layout Troubleshooting Guide

## Overview

This guide addresses common layout issues with the TCGCard system and provides solutions for maintaining consistent card positioning and appearance across different contexts.

## Common Issues & Solutions

### 1. Cards Appearing Stretched or Squished

**Symptoms**:
- Cards don't maintain proper aspect ratio
- Content appears compressed or elongated
- Inconsistent sizing across different screen sizes

**Causes**:
- Container constraints affecting card dimensions
- Missing or incorrect CSS Grid support
- Conflicting flex/grid properties

**Solutions**:

```css
/* Ensure proper container setup */
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

/* For flex containers */
.flex-card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.flex-card-container .tcgCard {
  flex: 0 0 auto; /* Prevent flex growth/shrink */
}
```

**Validation**:
```typescript
// Test aspect ratio maintenance
test('should maintain aspect ratio in different containers', () => {
  const { container } = render(
    <div style={{ width: '300px' }}>
      <TCGCard card={mockCard} />
    </div>
  );
  
  const card = container.querySelector('.tcgCard');
  const rect = card.getBoundingClientRect();
  const aspectRatio = rect.height / rect.width;
  
  expect(aspectRatio).toBeCloseTo(1.4, 1); // 140% padding-bottom
});
```

### 2. Content Overflowing Card Boundaries

**Symptoms**:
- Text extends beyond card edges
- Emoji effects appear cut off
- Stats sections overlap with other content

**Causes**:
- Insufficient container height
- Missing overflow handling
- Grid row sizing issues

**Solutions**:

```css
/* Ensure proper overflow handling */
.tcgCard .headerSection,
.tcgCard .footerSection {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Fix grid row sizing */
.cardFrame {
  grid-template-rows: auto 1fr auto auto auto;
  min-height: 0; /* Important for grid items */
}

/* Image section specific */
.imageSection {
  min-height: 0;
  overflow: hidden;
}
```

### 3. Emoji Effects Not Displaying Properly

**Symptoms**:
- Emoji damage/speed indicators missing
- Rarity effects not showing
- Tooltips not appearing

**Causes**:
- Emoji not in central effects system
- Component props not configured correctly
- CSS animations disabled

**Debugging Steps**:

```typescript
// Check if emoji is in central system
import { EmojiEffectsManager } from '../data/emojiEffects';

const checkEmoji = (emoji: string) => {
  const effect = EmojiEffectsManager.getEffect(emoji);
  console.log(`Emoji ${emoji}:`, effect ? 'Found' : 'Not found');
  if (effect) {
    console.log('Properties:', effect);
  }
};

// Usage
checkEmoji('🗿'); // Should show effect data
checkEmoji('🤖'); // Should show "Not found"
```

**Solutions**:

```tsx
// Ensure proper props for emoji effects
<EmojiDisplay
  emoji={card.emoji}
  showEffects={true}        // Enable effects display
  showTooltip={true}        // Enable tooltips
  showTrajectory={variant === 'detail'} // Context-aware
  animated={animated}       // Respect animation preference
/>

// For custom emojis, add to central system
const customEmojiEffect = {
  emoji: '🤖',
  damage: 12,
  speed: 4,
  trajectory: 'homing',
  type: 'utility',
  rarity: 'epic',
  description: 'AI-powered attack with adaptive targeting'
};
```

### 4. Inconsistent Spacing Between Card Sections

**Symptoms**:
- Uneven gaps between header, image, and footer
- Different spacing on different card sizes
- Sections appearing cramped or too spread out

**Causes**:
- Incorrect grid gap settings
- Missing responsive breakpoints
- Size-specific styles not applied

**Solutions**:

```css
/* Base grid spacing */
.cardFrame {
  grid-gap: 0.25rem;
  padding: 0.5rem;
}

/* Size-specific adjustments */
.tcgCard.small .cardFrame {
  grid-gap: 0.125rem;
  padding: 0.375rem;
}

.tcgCard.large .cardFrame {
  grid-gap: 0.375rem;
  padding: 0.75rem;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .cardFrame {
    grid-gap: 0.0625rem;
    padding: 0.25rem;
  }
}
```

### 5. Cards Not Responsive on Mobile

**Symptoms**:
- Cards too large for mobile screens
- Text too small to read
- Touch targets too small

**Causes**:
- Missing responsive breakpoints
- Fixed sizing preventing scaling
- Insufficient mobile testing

**Solutions**:

```css
/* Mobile-first responsive design */
.tcgCard {
  max-width: 100%;
  width: 100%;
}

/* Responsive sizing */
@media (max-width: 768px) {
  .tcgCard {
    max-width: 240px;
  }
  
  .tcgCard.small {
    max-width: 160px;
  }
  
  .tcgCard.large {
    max-width: 320px;
  }
}

@media (max-width: 480px) {
  .tcgCard {
    max-width: 200px;
  }
  
  /* Increase touch targets */
  .emoji-display--clickable {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### 6. Animation Performance Issues

**Symptoms**:
- Choppy or stuttering animations
- High CPU usage with multiple cards
- Animations not respecting user preferences

**Causes**:
- Too many simultaneous animations
- Heavy CSS effects
- Not honoring reduced motion preferences

**Solutions**:

```css
/* Optimize animations */
.emoji-display__character {
  animation: emoji-pulse 2s ease-in-out infinite;
  will-change: transform; /* Optimize for animation */
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  .tcgCard *,
  .emoji-display *,
  .emojiChip * {
    animation: none !important;
    transition: none !important;
  }
}

/* Limit concurrent animations */
.tcgCard:not(:hover) .emoji-display__effect-overlay {
  animation-play-state: paused;
}
```

### 7. Grid Layout Not Working in Older Browsers

**Symptoms**:
- Cards stacked vertically
- Sections overlapping
- No positioning applied

**Causes**:
- CSS Grid not supported
- Missing fallback styles
- Polyfill not loaded

**Solutions**:

```css
/* Flexbox fallback */
.cardFrame {
  display: flex;
  flex-direction: column;
  /* Grid styles will override in supporting browsers */
  display: grid;
  grid-template-rows: auto 1fr auto auto auto;
}

/* Feature detection */
@supports not (display: grid) {
  .cardFrame {
    display: flex;
    flex-direction: column;
  }
  
  .imageSection {
    flex: 1;
  }
  
  .headerSection,
  .emojiSection,
  .passivesSection,
  .footerSection {
    flex: 0 0 auto;
  }
}
```

## Diagnostic Tools

### Layout Inspector

```typescript
// Add to development builds for debugging
const inspectCardLayout = (cardElement: HTMLElement) => {
  const sections = {
    header: cardElement.querySelector('.headerSection'),
    image: cardElement.querySelector('.imageSection'),
    emoji: cardElement.querySelector('.emojiSection'),
    passives: cardElement.querySelector('.passivesSection'),
    footer: cardElement.querySelector('.footerSection')
  };
  
  Object.entries(sections).forEach(([name, element]) => {
    if (element) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      console.log(`${name} section:`, {
        dimensions: { width: rect.width, height: rect.height },
        position: { top: rect.top, left: rect.left },
        gridRow: style.gridRow,
        display: style.display
      });
    }
  });
};

// Usage in tests or development
inspectCardLayout(document.querySelector('.tcgCard'));
```

### Performance Monitor

```typescript
// Monitor rendering performance
const measureCardRenderTime = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name.includes('tcgCard')) {
        console.log(`Card render time: ${entry.duration}ms`);
        if (entry.duration > 16.67) { // > 60fps
          console.warn('Card rendering is slow');
        }
      }
    });
  });
  
  observer.observe({ entryTypes: ['measure'] });
};
```

## Testing Strategies

### Visual Regression Tests

```typescript
// Automated visual testing
describe('Card Layout Visual Regression', () => {
  test('should maintain layout across browser updates', async () => {
    const { container } = render(<TCGCard card={mockCard} />);
    
    // Take screenshot
    await expect(container.firstChild).toMatchSnapshot();
  });
  
  test('should handle content overflow gracefully', async () => {
    const longContentCard = {
      ...mockCard,
      name: 'Very Long Card Name That Should Be Handled Properly',
      emojis: new Array(20).fill({ character: '🗿', damage: 1 })
    };
    
    const { container } = render(<TCGCard card={longContentCard} />);
    await expect(container.firstChild).toMatchSnapshot();
  });
});
```

### Layout Stability Tests

```typescript
// Test layout stability under different conditions
describe('Layout Stability', () => {
  test('should not shift when content changes', () => {
    const { rerender } = render(<TCGCard card={mockCard} />);
    
    const initialRect = screen.getByText(mockCard.name)
      .closest('.tcgCard').getBoundingClientRect();
    
    // Change content
    rerender(<TCGCard card={{ ...mockCard, name: 'New Name' }} />);
    
    const newRect = screen.getByText('New Name')
      .closest('.tcgCard').getBoundingClientRect();
    
    expect(newRect.width).toBeCloseTo(initialRect.width, 1);
    expect(newRect.height).toBeCloseTo(initialRect.height, 1);
  });
});
```

## Browser Compatibility

### Supported Features
- **CSS Grid**: Chrome 57+, Firefox 52+, Safari 10.1+
- **CSS Custom Properties**: Chrome 49+, Firefox 31+, Safari 9.1+
- **Backdrop Filter**: Chrome 76+, Firefox 103+, Safari 9+

### Fallback Strategies
- Flexbox layout for older browsers
- Standard colors when custom properties not supported
- Basic blur effects when backdrop-filter unavailable

## Performance Benchmarks

### Target Metrics
- **First Render**: < 16ms per card
- **Layout Shift**: < 0.1 CLS score
- **Memory Usage**: < 1MB per 100 cards
- **Animation**: 60fps sustained

### Optimization Checklist
- [ ] Use `will-change` for animated elements
- [ ] Implement `React.memo` for static cards
- [ ] Lazy load off-screen cards
- [ ] Optimize emoji effect calculations
- [ ] Minimize DOM manipulation during animations

---

*For additional support, check the visual tests in `/tests/integration/` or refer to the Emoji System Integration Guide.*