# Task: Center Unified Card Model on Screen

## 📋 Metadata
- **ID**: TASK-001
- **Created**: 2025-08-17
- **Status**: TODO
- **Priority**: HIGH
- **Size**: S
- **Assignee**: [Unassigned]
- **Epic**: UI/UX Improvements
- **Sprint**: Current

## 🎯 User Story
**As a** player  
**I want** the card to be centered on the screen when viewing it  
**So that** I can focus on the card details without distraction

## 📝 Description
Currently, the unified card model is not properly centered on the screen. The card should be displayed in the center of the viewport with proper spacing and responsive behavior across different screen sizes.

## ✅ Acceptance Criteria
- [ ] Card is horizontally centered on all screen sizes
- [ ] Card is vertically centered on all screen sizes
- [ ] Proper margins and padding around the card
- [ ] Responsive behavior on mobile, tablet, and desktop
- [ ] Background doesn't interfere with card visibility
- [ ] Card maintains aspect ratio when scaling

## 🔧 Technical Details

### Files to Modify
- `src/components/screens/RollScreen.tsx`
- `src/components/cards/Card.css`
- `src/components/cards/CardDisplay.tsx`
- `src/components/test/CardShowcase.tsx`

### Components Affected
- Card
- CardDisplay
- RollScreen
- CardShowcase

### Dependencies
- None

## 💡 Implementation Notes
- Use CSS Flexbox or Grid for centering
- Consider using `display: flex; justify-content: center; align-items: center`
- Ensure the parent container has proper height (min-height: 100vh)
- Test on different viewport sizes using browser dev tools

## ⚠️ Risks & Mitigations
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking existing layouts | MEDIUM | LOW | Test all screens that display cards |
| Mobile responsiveness issues | HIGH | MEDIUM | Use responsive units and test on mobile viewports |

## 🧪 Test Scenarios
1. **Desktop Display**: 
   - Given: User is on desktop (1920x1080)
   - When: A card is displayed
   - Then: Card should be perfectly centered with equal spacing

2. **Mobile Display**: 
   - Given: User is on mobile (375x667)
   - When: A card is displayed
   - Then: Card should scale appropriately and remain centered

3. **Card Rotation/Animation**: 
   - Given: Card has animations enabled
   - When: Card is animating
   - Then: Card should remain centered during all animations

## 📊 Definition of Done
- [ ] Card centered on all tested screen sizes
- [ ] No visual regressions on existing screens
- [ ] CSS is clean and maintainable
- [ ] Tested on Chrome, Firefox, Safari
- [ ] No console errors or warnings
- [ ] Performance not impacted

## 💬 Discussion & Notes
The unified card model should provide a consistent viewing experience across the entire application.

## 🔄 Updates Log
- 2025-08-17 - TODO - System - Task created

---
*This task is part of The Meme Wars TCG project*
