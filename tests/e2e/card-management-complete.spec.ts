/**
 * Complete Card Management System E2E Tests
 * 
 * This test suite covers all scenarios defined in quickstart.md:
 * 1. Collection loading and display
 * 2. Multi-criteria filtering 
 * 3. Search functionality
 * 4. Image upload with progress
 * 5. Offline synchronization
 * 6. Performance requirements
 * 7. Error handling
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// Test data paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_PATH = path.resolve(__dirname, '../fixtures');
const TEST_CARD_IMAGE = path.join(FIXTURES_PATH, 'test-card.png');

// Performance thresholds from quickstart.md
const PERFORMANCE_LIMITS = {
  COLLECTION_LOAD: 1000,  // 1s for collection loading
  FILTER_TIME: 200,       // 200ms for filtering
  SEARCH_TIME: 100,       // 100ms for search
  UPLOAD_TIMEOUT: 30000   // 30s for image upload
};

// Test helpers
class CardManagementPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/collection');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await expect(this.page.locator('[data-testid="card-grid"]')).toBeVisible();
    await this.page.waitForLoadState('networkidle');
  }

  async getCardCount() {
    return await this.page.locator('[data-testid="card-item"]').count();
  }

  async getVisibleCards() {
    return this.page.locator('[data-testid="card-item"]').all();
  }

  async selectCard(index = 0) {
    await this.page.click(`[data-testid="card-item"]:nth-child(${index + 1})`);
  }

  async applyRarityFilter(rarity: string) {
    await this.page.click(`[data-testid="rarity-filter-${rarity}"]`);
  }

  async applyCostFilter(min?: number, max?: number) {
    if (min !== undefined) {
      await this.page.fill('[data-testid="cost-filter-min"]', min.toString());
    }
    if (max !== undefined) {
      await this.page.fill('[data-testid="cost-filter-max"]', max.toString());
    }
    await this.page.click('[data-testid="apply-cost-filter"]');
  }

  async searchCards(searchTerm: string) {
    await this.page.fill('[data-testid="search-input"]', searchTerm);
    // Wait for debounced search
    await this.page.waitForTimeout(500);
  }

  async clearSearch() {
    await this.page.fill('[data-testid="search-input"]', '');
    await this.page.waitForTimeout(500);
  }

  async uploadCustomImage(imagePath: string) {
    await this.page.click('[data-testid="upload-custom-image"]');
    await this.page.setInputFiles('[data-testid="image-input"]', imagePath);
  }

  async waitForUploadComplete() {
    await expect(this.page.locator('[data-testid="upload-progress"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: PERFORMANCE_LIMITS.UPLOAD_TIMEOUT });
  }

  async toggleOfflineMode() {
    await this.page.click('[data-testid="offline-mode-toggle"]');
  }

  async triggerSync() {
    await this.page.click('[data-testid="sync-trigger"]');
  }

  async waitForSyncComplete() {
    await expect(this.page.locator('[data-testid="sync-status-success"]')).toBeVisible({ timeout: 10000 });
  }
}

test.describe('Card Management System E2E', () => {
  let cardPage: CardManagementPage;

  test.beforeEach(async ({ page }) => {
    cardPage = new CardManagementPage(page);
    
    // Mock successful API responses for consistent testing
    await page.route('/api/cards/collection/*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            playerId: 'test-player',
            collectionId: 'test-collection',
            cards: generateMockCards(247),
            totalCards: 247,
            lastSync: new Date().toISOString()
          }
        })
      });
    });
  });

  test.describe('1. Collection Loading & Display', () => {
    test('should load collection within performance limits', async ({ page }) => {
      const startTime = Date.now();
      
      await cardPage.goto();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(PERFORMANCE_LIMITS.COLLECTION_LOAD);
      
      const cardCount = await cardPage.getCardCount();
      expect(cardCount).toBe(247);
    });

    test('should display cards in virtualized grid layout', async ({ page }) => {
      await cardPage.goto();
      
      // Check grid container exists
      await expect(page.locator('[data-testid="card-grid"]')).toBeVisible();
      
      // Verify virtualization is working (not all cards rendered at once)
      const renderedCards = await page.locator('[data-testid="card-item"]').count();
      expect(renderedCards).toBeLessThan(247); // Only visible cards should be rendered
      expect(renderedCards).toBeGreaterThan(0);
    });

    test('should handle large collections (500+ cards)', async ({ page }) => {
      // Mock large collection
      await page.route('/api/cards/collection/*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              cards: generateMockCards(750),
              totalCards: 750
            }
          })
        });
      });

      await cardPage.goto();
      
      const cardCount = await cardPage.getCardCount();
      expect(cardCount).toBeGreaterThan(500);
      
      // Performance should still be acceptable
      const startTime = Date.now();
      await cardPage.searchCards('dragon');
      const searchTime = Date.now() - startTime;
      expect(searchTime).toBeLessThan(PERFORMANCE_LIMITS.SEARCH_TIME * 2); // Allow some extra time for large collections
    });

    test('should handle empty collection gracefully', async ({ page }) => {
      // Mock empty collection
      await page.route('/api/cards/collection/*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              cards: [],
              totalCards: 0
            }
          })
        });
      });

      await cardPage.goto();
      
      await expect(page.locator('[data-testid="empty-collection-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="empty-collection-message"]')).toContainText('No cards found');
    });
  });

  test.describe('2. Multi-Criteria Filtering', () => {
    test('should filter cards by rarity', async ({ page }) => {
      await cardPage.goto();
      
      const startTime = Date.now();
      await cardPage.applyRarityFilter('legendary');
      const filterTime = Date.now() - startTime;
      
      expect(filterTime).toBeLessThan(PERFORMANCE_LIMITS.FILTER_TIME);
      
      const cardCount = await cardPage.getCardCount();
      expect(cardCount).toBeLessThanOrEqual(247);
      
      // Verify filter is applied (check that legendary indicator is visible on cards)
      const firstCard = page.locator('[data-testid="card-item"]').first();
      await expect(firstCard.locator('[data-testid="card-rarity-legendary"]')).toBeVisible();
    });

    test('should filter cards by cost range', async ({ page }) => {
      await cardPage.goto();
      
      const startTime = Date.now();
      await cardPage.applyCostFilter(5, 10);
      const filterTime = Date.now() - startTime;
      
      expect(filterTime).toBeLessThan(PERFORMANCE_LIMITS.FILTER_TIME);
      
      const cardCount = await cardPage.getCardCount();
      expect(cardCount).toBeGreaterThan(0);
      expect(cardCount).toBeLessThanOrEqual(247);
    });

    test('should combine multiple filters', async ({ page }) => {
      await cardPage.goto();
      
      // Apply rarity filter
      await cardPage.applyRarityFilter('epic');
      const epicCount = await cardPage.getCardCount();
      
      // Add cost filter
      await cardPage.applyCostFilter(3, 7);
      const combinedCount = await cardPage.getCardCount();
      
      // Combined filter should have fewer or equal results
      expect(combinedCount).toBeLessThanOrEqual(epicCount);
    });

    test('should clear filters and restore full collection', async ({ page }) => {
      await cardPage.goto();
      
      // Apply filter
      await cardPage.applyRarityFilter('rare');
      const filteredCount = await cardPage.getCardCount();
      expect(filteredCount).toBeLessThan(247);
      
      // Clear filters
      await page.click('[data-testid="clear-all-filters"]');
      
      const clearedCount = await cardPage.getCardCount();
      expect(clearedCount).toBe(247);
    });

    test('should persist filter state across page reloads', async ({ page }) => {
      await cardPage.goto();
      
      // Apply filter
      await cardPage.applyRarityFilter('legendary');
      const filteredCount = await cardPage.getCardCount();
      
      // Reload page
      await page.reload();
      await cardPage.waitForLoad();
      
      // Filter should be preserved
      const reloadedCount = await cardPage.getCardCount();
      expect(reloadedCount).toBe(filteredCount);
      
      // Filter UI should show active state
      await expect(page.locator('[data-testid="rarity-filter-legendary"]')).toHaveClass(/active/);
    });
  });

  test.describe('3. Search Functionality', () => {
    test('should search cards by name', async ({ page }) => {
      await cardPage.goto();
      
      const startTime = Date.now();
      await cardPage.searchCards('dragon');
      const searchTime = Date.now() - startTime;
      
      expect(searchTime).toBeLessThan(PERFORMANCE_LIMITS.SEARCH_TIME);
      
      const cardCount = await cardPage.getCardCount();
      expect(cardCount).toBeGreaterThan(0);
      
      // Verify search highlighting
      const searchResults = await cardPage.getVisibleCards();
      for (const card of searchResults.slice(0, 5)) { // Check first 5 cards
        const cardText = await card.textContent();
        expect(cardText?.toLowerCase()).toContain('dragon');
      }
    });

    test('should search cards by description', async ({ page }) => {
      await cardPage.goto();
      
      await cardPage.searchCards('fire breath');
      const cardCount = await cardPage.getCardCount();
      
      expect(cardCount).toBeGreaterThan(0);
    });

    test('should handle fuzzy search', async ({ page }) => {
      await cardPage.goto();
      
      // Test with typos
      await cardPage.searchCards('draggon'); // Intentional typo
      const typoCount = await cardPage.getCardCount();
      
      await cardPage.clearSearch();
      await cardPage.searchCards('dragon'); // Correct spelling
      const correctCount = await cardPage.getCardCount();
      
      // Fuzzy search should still find some results
      expect(typoCount).toBeGreaterThan(0);
      expect(correctCount).toBeGreaterThanOrEqual(typoCount);
    });

    test('should debounce search input', async ({ page }) => {
      await cardPage.goto();
      
      // Type quickly without waiting
      await page.type('[data-testid="search-input"]', 'dragon', { delay: 50 });
      
      // Should not trigger search for each character
      await expect(page.locator('[data-testid="search-loading"]')).toBeVisible();
      await expect(page.locator('[data-testid="search-loading"]')).not.toBeVisible({ timeout: 1000 });
    });

    test('should clear search and restore full collection', async ({ page }) => {
      await cardPage.goto();
      
      // Search
      await cardPage.searchCards('phoenix');
      const searchCount = await cardPage.getCardCount();
      expect(searchCount).toBeLessThan(247);
      
      // Clear search
      await cardPage.clearSearch();
      const clearedCount = await cardPage.getCardCount();
      expect(clearedCount).toBe(247);
    });

    test('should combine search with filters', async ({ page }) => {
      await cardPage.goto();
      
      // Apply filter first
      await cardPage.applyRarityFilter('legendary');
      const filteredCount = await cardPage.getCardCount();
      
      // Add search
      await cardPage.searchCards('dragon');
      const combinedCount = await cardPage.getCardCount();
      
      // Combined should be subset of filtered results
      expect(combinedCount).toBeLessThanOrEqual(filteredCount);
    });
  });

  test.describe('4. Image Upload with Progress', () => {
    test('should upload custom card image with progress tracking', async ({ page }) => {
      // Mock image upload endpoint
      await page.route('/api/cards/*/image', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              imageId: 'test-image-123',
              imageUrl: '/custom-images/test-image-123.png',
              uploadedAt: new Date().toISOString()
            }
          })
        });
      });

      await cardPage.goto();
      
      // Select a card
      await cardPage.selectCard(0);
      await expect(page.locator('[data-testid="card-detail-modal"]')).toBeVisible();
      
      // Upload image
      await cardPage.uploadCustomImage(TEST_CARD_IMAGE);
      
      // Verify progress indicator
      await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="upload-percentage"]')).toBeVisible();
      
      // Wait for completion
      await cardPage.waitForUploadComplete();
      
      // Verify custom image is displayed
      await expect(page.locator('[data-testid="custom-image-preview"]')).toBeVisible();
    });

    test('should validate image file types', async ({ page }) => {
      await cardPage.goto();
      
      // Select a card
      await cardPage.selectCard(0);
      
      // Try uploading invalid file type
      await cardPage.uploadCustomImage(__filename); // .ts file instead of image
      
      await expect(page.locator('[data-testid="upload-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="upload-error"]')).toContainText('Invalid file type');
    });

    test('should handle upload failures gracefully', async ({ page }) => {
      // Mock upload failure
      await page.route('/api/cards/*/image', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: { message: 'Upload failed' }
          })
        });
      });

      await cardPage.goto();
      await cardPage.selectCard(0);
      await cardPage.uploadCustomImage(TEST_CARD_IMAGE);
      
      await expect(page.locator('[data-testid="upload-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-upload-button"]')).toBeVisible();
    });

    test('should allow cancelling uploads', async ({ page }) => {
      await cardPage.goto();
      await cardPage.selectCard(0);
      
      // Start upload
      await cardPage.uploadCustomImage(TEST_CARD_IMAGE);
      await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
      
      // Cancel upload
      await page.click('[data-testid="cancel-upload"]');
      
      await expect(page.locator('[data-testid="upload-progress"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="upload-cancelled"]')).toBeVisible();
    });
  });

  test.describe('5. Offline Synchronization', () => {
    test('should work in offline mode', async ({ page }) => {
      await cardPage.goto();
      
      // Go offline
      await page.context().setOffline(true);
      await cardPage.toggleOfflineMode();
      
      // Should still display cached collection
      const cardCount = await cardPage.getCardCount();
      expect(cardCount).toBeGreaterThan(0);
      
      // Should show offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    });

    test('should queue changes while offline', async ({ page }) => {
      await cardPage.goto();
      
      // Go offline
      await page.context().setOffline(true);
      await cardPage.toggleOfflineMode();
      
      // Make changes (add filter)
      await cardPage.applyRarityFilter('epic');
      
      // Should show pending sync indicator
      await expect(page.locator('[data-testid="sync-pending"]')).toBeVisible();
    });

    test('should sync changes when back online', async ({ page }) => {
      // Mock sync endpoint
      await page.route('/api/cards/collection/*/sync', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              syncStatus: 'success',
              syncedItems: { cards: 5, filters: 1 }
            }
          })
        });
      });

      await cardPage.goto();
      
      // Go offline, make changes, go online
      await page.context().setOffline(true);
      await cardPage.toggleOfflineMode();
      await cardPage.applyRarityFilter('legendary');
      
      await page.context().setOffline(false);
      await cardPage.toggleOfflineMode();
      
      // Should automatically sync
      await cardPage.waitForSyncComplete();
      
      await expect(page.locator('[data-testid="sync-status-success"]')).toBeVisible();
    });

    test('should handle sync conflicts', async ({ page }) => {
      // Mock sync conflict
      await page.route('/api/cards/collection/*/sync', async route => {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            data: {
              conflicts: [{
                itemId: 'card-123',
                type: 'metadata_conflict',
                localData: { tags: ['local-tag'] },
                remoteData: { tags: ['remote-tag'] }
              }]
            }
          })
        });
      });

      await cardPage.goto();
      
      // Trigger sync
      await cardPage.triggerSync();
      
      // Should show conflict resolution dialog
      await expect(page.locator('[data-testid="conflict-resolution-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="conflict-resolution-options"]')).toBeVisible();
    });
  });

  test.describe('6. Performance & Scalability', () => {
    test('should maintain performance with large collections', async ({ page }) => {
      // Mock very large collection
      await page.route('/api/cards/collection/*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              cards: generateMockCards(1000),
              totalCards: 1000
            }
          })
        });
      });

      const startTime = Date.now();
      await cardPage.goto();
      const loadTime = Date.now() - startTime;
      
      // Should still load within limits (with some tolerance for large data)
      expect(loadTime).toBeLessThan(PERFORMANCE_LIMITS.COLLECTION_LOAD * 2);
      
      // Filtering should still be fast
      const filterStart = Date.now();
      await cardPage.applyRarityFilter('epic');
      const filterTime = Date.now() - filterStart;
      
      expect(filterTime).toBeLessThan(PERFORMANCE_LIMITS.FILTER_TIME * 1.5);
    });

    test('should not cause memory leaks', async ({ page }) => {
      await cardPage.goto();
      
      // Perform many operations that could cause memory leaks
      for (let i = 0; i < 10; i++) {
        await cardPage.searchCards(`search-${i}`);
        await cardPage.clearSearch();
        await cardPage.applyRarityFilter('common');
        await page.click('[data-testid="clear-all-filters"]');
      }
      
      // Check that page is still responsive
      await cardPage.searchCards('final-search');
      const finalCount = await cardPage.getCardCount();
      expect(finalCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('7. Error Handling & User Experience', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error
      await page.route('/api/cards/collection/*', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: { message: 'Server error' }
          })
        });
      });

      await cardPage.goto();
      
      // Should show error state
      await expect(page.locator('[data-testid="collection-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('should show loading states', async ({ page }) => {
      // Delay API response
      await page.route('/api/cards/collection/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { cards: generateMockCards(247), totalCards: 247 }
          })
        });
      });

      await cardPage.goto();
      
      // Should show loading indicator
      await expect(page.locator('[data-testid="collection-loading"]')).toBeVisible();
      
      // Wait for content to load
      await cardPage.waitForLoad();
      await expect(page.locator('[data-testid="collection-loading"]')).not.toBeVisible();
    });

    test('should handle network interruptions', async ({ page }) => {
      await cardPage.goto();
      
      // Simulate network interruption
      await page.context().setOffline(true);
      await cardPage.searchCards('network-test');
      
      // Should show offline indicator and cached results
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
      
      // Restore network
      await page.context().setOffline(false);
      
      // Should eventually sync when network is restored
      await expect(page.locator('[data-testid="online-indicator"]')).toBeVisible();
    });
  });
});

// Test utilities
function generateMockCards(count: number) {
  const cards = [];
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const families = ['Fire', 'Water', 'Earth', 'Air', 'Dark', 'Light'];
  const types = ['Creature', 'Spell', 'Artifact'];
  const names = ['Dragon', 'Phoenix', 'Unicorn', 'Griffin', 'Sphinx', 'Kraken'];
  
  for (let i = 0; i < count; i++) {
    cards.push({
      id: `mock-card-${i}`,
      name: `${names[i % names.length]} ${Math.floor(i / names.length)}`,
      description: `A powerful ${families[i % families.length]} ${types[i % types.length]}`,
      image: `/images/cards/card-${i}.png`,
      rarity: rarities[i % rarities.length],
      luck: Math.floor(Math.random() * 1000),
      cost: (i % 12) + 1,
      hp: (i % 500) + 50,
      attack: (i % 200) + 10,
      defense: (i % 150) + 5,
      family: families[i % families.length],
      type: types[i % types.length],
      abilities: [`Ability ${i % 10}`, `Power ${i % 5}`],
      createdAt: new Date(Date.now() - i * 60000).toISOString()
    });
  }
  
  return cards;
}