// Integration test for RollService with Store interactions
// Tests how RollService integrates with rollStore and currencyStore

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RollService } from '@services/RollService';
import { storeTestUtils, serviceInteractionBuilder, waitForStateChange } from './setup';

describe('RollService-Store Integration', () => {
  let rollService: RollService;

  // Mock store states
  const mockRollStoreState = {
    rollHistory: [],
    pityProgress: { currentCount: 0, guaranteedAt: 10 },
    rollCount: 0,
    addRoll: vi.fn(),
    incrementPity: vi.fn(),
    resetPity: vi.fn(),
    updateRollCount: vi.fn(),
  };

  const mockCurrencyStoreState = {
    gold: 1000,
    tickets: 5,
    gems: 10,
    spendGold: vi.fn(),
    spendTickets: vi.fn(),
    addGold: vi.fn(),
    addTickets: vi.fn(),
  };

  beforeEach(() => {
    // Setup mock stores
    storeTestUtils.mockStore('useRollStore', mockRollStoreState);
    storeTestUtils.mockStore('useCurrencyStore', mockCurrencyStoreState);
    
    // Register services for interaction tracking
    serviceInteractionBuilder.registerService('RollService', rollService);
    
    rollService = new RollService();
  });

  afterEach(() => {
    storeTestUtils.resetStores();
    serviceInteractionBuilder.clearHistory();
  });

  describe('Currency Integration', () => {
    it('should deduct currency when rolling', async () => {
      // Test integration: rolling should deduct tickets or gold
      const initialTickets = mockCurrencyStoreState.tickets;
      
      rollService.rollSingle();
      
      // Verify currency store interaction
      expect(mockCurrencyStoreState.spendTickets).toHaveBeenCalledWith(1);
      
      // If no tickets, should fallback to gold
      mockCurrencyStoreState.tickets = 0;
      mockCurrencyStoreState.spendTickets.mockImplementation(() => {
        throw new Error('Insufficient tickets');
      });
      
      rollService.rollSingle();
      expect(mockCurrencyStoreState.spendGold).toHaveBeenCalledWith(100); // Assuming 100 gold per roll
    });

    it('should handle insufficient currency gracefully', () => {
      // Test integration: service should check currency before rolling
      mockCurrencyStoreState.tickets = 0;
      mockCurrencyStoreState.gold = 0;
      mockCurrencyStoreState.spendTickets.mockImplementation(() => {
        throw new Error('Insufficient tickets');
      });
      mockCurrencyStoreState.spendGold.mockImplementation(() => {
        throw new Error('Insufficient gold');
      });

      expect(() => rollService.rollSingle()).toThrow('Insufficient currency');
    });

    it('should handle bulk roll currency deduction', () => {
      // Test integration: bulk rolls should deduct appropriate amounts
      const rollCount = 10;
      mockCurrencyStoreState.tickets = 5; // Only enough for 5 rolls
      
      rollService.rollMultiple(rollCount);
      
      // Should spend all tickets first
      expect(mockCurrencyStoreState.spendTickets).toHaveBeenCalledWith(5);
      // Then spend gold for remaining 5 rolls
      expect(mockCurrencyStoreState.spendGold).toHaveBeenCalledWith(500); // 5 * 100 gold
    });
  });

  describe('Roll Store Integration', () => {
    it('should update roll history in store', () => {
      // Test integration: each roll should be recorded in roll store
      const result = rollService.rollSingle();
      
      expect(mockRollStoreState.addRoll).toHaveBeenCalledWith({
        card: result.card,
        timestamp: expect.any(Number),
        pityTriggered: result.pityTriggered,
        cost: expect.any(Object), // { tickets: 1 } or { gold: 100 }
      });
    });

    it('should maintain pity progression in store', () => {
      // Test integration: pity counter should sync with store
      rollService.rollSingle();
      
      expect(mockRollStoreState.incrementPity).toHaveBeenCalled();
      
      // Mock pity trigger
      mockRollStoreState.pityProgress.currentCount = 9; // One before guarantee
      const result = rollService.rollSingle();
      
      if (result.pityTriggered) {
        expect(mockRollStoreState.resetPity).toHaveBeenCalled();
      }
    });

    it('should update total roll count', () => {
      // Test integration: total roll count should be maintained
      const initialCount = mockRollStoreState.rollCount;
      
      rollService.rollMultiple(5);
      
      expect(mockRollStoreState.updateRollCount).toHaveBeenCalledWith(initialCount + 5);
    });
  });

  describe('Auto-Roll Integration', () => {
    it('should handle auto-roll with store updates', async () => {
      // Test integration: auto-roll should continuously update stores
      const autoConfig = {
        maxRolls: 20,
        stopOnRarity: 'epic' as const,
        batchSize: 5,
      };

      // Mock an epic card appearing on the 15th roll
      let rollCounter = 0;
      const originalRollSingle = rollService.rollSingle.bind(rollService);
      rollService.rollSingle = vi.fn().mockImplementation(() => {
        rollCounter++;
        const isEpic = rollCounter === 15;
        return originalRollSingle().then((result: any) => ({
          ...result,
          card: { ...result.card, rarity: isEpic ? 'epic' : 'common' },
        }));
      });

      const autoResult = await rollService.rollAuto(autoConfig);

      // Should have stopped at epic (roll 15), not reached max (20)
      expect(autoResult.totalRolls).toBe(15);
      expect(autoResult.stoppedReason).toBe('rarity');
      expect(mockRollStoreState.addRoll).toHaveBeenCalledTimes(15);
    });

    it('should respect currency limits during auto-roll', async () => {
      // Test integration: auto-roll should stop when running out of currency
      mockCurrencyStoreState.tickets = 3;
      mockCurrencyStoreState.gold = 200; // Enough for 2 more rolls

      const autoConfig = {
        maxRolls: 10,
        stopOnRarity: 'legendary' as const,
        batchSize: 2,
      };

      const autoResult = await rollService.rollAuto(autoConfig);

      // Should stop after 5 rolls (3 tickets + 2 gold rolls)
      expect(autoResult.totalRolls).toBe(5);
      expect(autoResult.stoppedReason).toBe('insufficient_currency');
    });
  });

  describe('State Synchronization', () => {
    it('should maintain consistency between service and stores', async () => {
      // Test integration: service state should always match store state
      const servicePity = rollService.getPityProgress();
      const storePity = mockRollStoreState.pityProgress;
      
      expect(servicePity.currentCount).toBe(storePity.currentCount);
      expect(servicePity.guaranteedAt).toBe(storePity.guaranteedAt);

      // Perform operations and verify sync
      rollService.rollSingle();
      
      await waitForStateChange(
        () => mockRollStoreState.pityProgress.currentCount,
        storePity.currentCount + 1,
        1000
      );
    });

    it('should handle store state changes from external sources', () => {
      // Test integration: service should react to external store changes
      // Simulate external pity reset (e.g., from another component)
      mockRollStoreState.pityProgress.currentCount = 0;
      mockRollStoreState.resetPity();

      const servicePity = rollService.getPityProgress();
      expect(servicePity.currentCount).toBe(0);
    });
  });

  describe('Error Recovery Integration', () => {
    it('should handle store errors gracefully', () => {
      // Test integration: service should handle store failures
      mockRollStoreState.addRoll.mockImplementation(() => {
        throw new Error('Store write error');
      });

      // Service should still function, but with degraded functionality
      expect(() => rollService.rollSingle()).not.toThrow();
      
      // Should have attempted store update
      expect(mockRollStoreState.addRoll).toHaveBeenCalled();
    });

    it('should retry store operations on transient failures', async () => {
      // Test integration: service should retry failed store operations
      let attempts = 0;
      mockRollStoreState.addRoll.mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Transient error');
        }
        return true; // Success on third attempt
      });

      rollService.rollSingle();
      
      // Should have retried and eventually succeeded
      expect(mockRollStoreState.addRoll).toHaveBeenCalledTimes(3);
    });
  });
});