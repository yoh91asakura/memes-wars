# Task: Display Recent Rolls List Below Header

## 📋 Metadata
- **ID**: TASK-002
- **Created**: 2025-08-17
- **Status**: TODO
- **Priority**: MEDIUM
- **Size**: M
- **Assignee**: [Unassigned]
- **Epic**: UI/UX Improvements
- **Sprint**: Current

## 🎯 User Story
**As a** player  
**I want** to see my recent card rolls displayed below the header  
**So that** I can track my roll history and quickly access recently obtained cards

## 📝 Description
Add a section below the main header that displays the last 5-10 card rolls. This should show a compact view of recently obtained cards with their rarity, name, and timestamp. The list should persist across sessions and update in real-time when new rolls occur.

## ✅ Acceptance Criteria
- [ ] Recent rolls section appears below the header on all relevant screens
- [ ] Shows last 5-10 rolls (configurable)
- [ ] Each roll displays: card thumbnail/emoji, name, rarity, timestamp
- [ ] List updates immediately when a new roll occurs
- [ ] Rolls persist across browser sessions (localStorage)
- [ ] Clicking on a recent roll opens the card details
- [ ] Responsive design for mobile and desktop
- [ ] Smooth animations when new rolls are added

## 🔧 Technical Details

### Files to Modify
- `src/components/layout/Header.tsx`
- `src/components/roll/RecentRolls.tsx` (new file)
- `src/stores/rollStore.ts`
- `src/App.tsx`

### Components Affected
- Header
- App Layout
- RollScreen

### Dependencies
- rollStore for state management
- localStorage for persistence

## 💡 Implementation Notes
```typescript
// Example structure for recent rolls
interface RecentRoll {
  id: string;
  cardId: string;
  cardName: string;
  cardRarity: string;
  cardEmoji: string;
  timestamp: Date;
}

// Store in rollStore
recentRolls: RecentRoll[] // max 10 items
```

- Use Zustand persist middleware for localStorage
- Consider using react-transition-group for animations
- Implement FIFO (First In, First Out) for roll limit

## ⚠️ Risks & Mitigations
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Performance with many animations | LOW | LOW | Limit concurrent animations, use CSS transforms |
| localStorage quota exceeded | LOW | LOW | Implement cleanup for old rolls |
| Layout shift when adding rolls | MEDIUM | MEDIUM | Reserve space for the component |

## 🧪 Test Scenarios
1. **New Roll Added**: 
   - Given: User has 3 recent rolls displayed
   - When: User rolls a new card
   - Then: New roll appears at the top with animation, oldest removed if limit reached

2. **Persistence Check**: 
   - Given: User has 5 recent rolls
   - When: User refreshes the browser
   - Then: Same 5 rolls are still visible

3. **Click to View**: 
   - Given: Recent rolls are displayed
   - When: User clicks on a recent roll
   - Then: Card details modal/view opens

4. **Mobile Responsive**: 
   - Given: User is on mobile device
   - When: Recent rolls section is displayed
   - Then: Rolls display in a horizontal scrollable list or compact grid

## 📊 Definition of Done
- [ ] Component created and integrated
- [ ] Real-time updates working
- [ ] Persistence implemented
- [ ] Click interactions functional
- [ ] Responsive on all screen sizes
- [ ] Animations smooth and performant
- [ ] Unit tests written
- [ ] No console errors
- [ ] Documentation updated

## 💬 Discussion & Notes
Consider adding filters or search functionality in future iterations. May want to add a "clear history" button for user privacy.

## 🔄 Updates Log
- 2025-08-17 - TODO - System - Task created

---
*This task is part of The Meme Wars TCG project*
