# Service Contract: CardManagementService

**Service**: Complete Card Management Service  
**Type**: Frontend TypeScript Service  
**Dependencies**: CardCollection, CardFilter, SyncService

## Purpose

Core service for managing card collections on the client-side, including filtering, searching, sorting, and state management. Handles offline-first architecture with automatic sync.

## Interface Definition

```typescript
interface CardManagementService {
  // Collection Management
  loadCollection(playerId: string): Promise<CardCollection>;
  refreshCollection(playerId: string, force?: boolean): Promise<CardCollection>;
  getCollectionStats(playerId: string): Promise<CollectionStats>;
  
  // Card Operations
  addCardToCollection(card: Card, playerId: string): Promise<void>;
  updateCardMetadata(cardId: string, metadata: Partial<CollectionMetadata>): Promise<void>;
  removeCardFromCollection(cardId: string, playerId: string): Promise<void>;
  toggleCardFavorite(cardId: string): Promise<void>;
  addCardTags(cardId: string, tags: string[]): Promise<void>;
  removeCardTags(cardId: string, tags: string[]): Promise<void>;
  
  // Filtering & Search
  applyFilters(collection: CardCollection, filters: CardFilter[]): Promise<FilterResult>;
  searchCards(collection: CardCollection, query: string, options?: SearchOptions): Promise<FilterResult>;
  getSuggestedFilters(collection: CardCollection): Promise<CardFilter[]>;
  
  // Sorting
  sortCards(cards: Card[], criteria: SortCriteria, order: SortOrder): Card[];
  getAvailableSortOptions(): SortOption[];
  
  // Filter Management
  saveFilter(playerId: string, filter: CardFilter): Promise<CardFilter>;
  loadSavedFilters(playerId: string): Promise<CardFilter[]>;
  deleteFilter(filterId: string): Promise<void>;
  
  // Performance
  preloadCardImages(cards: Card[]): Promise<void>;
  clearCache(): Promise<void>;
  getMemoryUsage(): MemoryInfo;
}
```

## Type Definitions

```typescript
interface CollectionStats {
  totalCards: number;
  cardsByRarity: Record<Rarity, number>;
  favoriteCount: number;
  customImageCount: number;
  mostUsedCards: Array<{ card: Card; usageCount: number }>;
  recentlyAcquired: Card[];
  collectionValue: number; // game currency value
}

interface FilterResult {
  cards: Card[];
  totalMatches: number;
  appliedFilters: CardFilter[];
  executionTime: number;
  pagination: PaginationInfo;
}

interface SearchOptions {
  fuzzyMatch: boolean;
  searchFields: Array<'name' | 'abilities' | 'description' | 'tags'>;
  maxResults: number;
  highlightMatches: boolean;
}

interface SortCriteria {
  field: 'name' | 'rarity' | 'cost' | 'acquired' | 'used' | 'favorite';
  order: 'asc' | 'desc';
}

interface SortOption {
  value: string;
  label: string;
  description: string;
}

interface PaginationInfo {
  page: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface MemoryInfo {
  totalMemory: number;
  usedMemory: number;
  cacheSize: number;
  imagesCached: number;
}
```

## Contract Tests

### Test: loadCollection
```typescript
describe('CardManagementService.loadCollection', () => {
  it('should return complete card collection for valid player', async () => {
    const collection = await service.loadCollection('player-123');
    
    expect(collection).toBeDefined();
    expect(collection.playerId).toBe('player-123');
    expect(collection.cards).toBeInstanceOf(Array);
    expect(collection.metadata.totalCards).toBeGreaterThanOrEqual(0);
  });
  
  it('should throw error for invalid player ID', async () => {
    await expect(service.loadCollection('')).rejects.toThrow('Invalid player ID');
  });
  
  it('should use cached data when available', async () => {
    const spy = jest.spyOn(service, 'refreshCollection');
    await service.loadCollection('player-123');
    await service.loadCollection('player-123'); // Second call
    
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
```

### Test: applyFilters
```typescript
describe('CardManagementService.applyFilters', () => {
  it('should filter cards by rarity', async () => {
    const filter: CardFilter = {
      id: 'test-filter',
      name: 'Legendary Only',
      criteria: { rarities: ['legendary'] },
      active: true,
      createdDate: new Date(),
      lastUsed: new Date()
    };
    
    const result = await service.applyFilters(mockCollection, [filter]);
    
    expect(result.cards).toHaveLength(expectedLegendaryCount);
    expect(result.cards.every(card => card.rarity === 'legendary')).toBe(true);
    expect(result.executionTime).toBeLessThan(200); // Performance requirement
  });
  
  it('should combine multiple filters correctly', async () => {
    const filters: CardFilter[] = [
      { /* rarity filter */ },
      { /* cost range filter */ },
      { /* favorite filter */ }
    ];
    
    const result = await service.applyFilters(mockCollection, filters);
    
    expect(result.appliedFilters).toHaveLength(3);
    expect(result.totalMatches).toBeLessThanOrEqual(mockCollection.cards.length);
  });
});
```

### Test: searchCards
```typescript
describe('CardManagementService.searchCards', () => {
  it('should find cards by exact name match', async () => {
    const result = await service.searchCards(mockCollection, 'Fire Dragon');
    
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].name).toBe('Fire Dragon');
  });
  
  it('should support fuzzy matching', async () => {
    const options: SearchOptions = { fuzzyMatch: true, searchFields: ['name'] };
    const result = await service.searchCards(mockCollection, 'fier dragn', options);
    
    expect(result.cards.length).toBeGreaterThan(0);
    expect(result.cards[0].name).toContain('Fire Dragon');
  });
  
  it('should search in multiple fields', async () => {
    const options: SearchOptions = { 
      fuzzyMatch: false, 
      searchFields: ['name', 'abilities', 'tags'] 
    };
    const result = await service.searchCards(mockCollection, 'burn', options);
    
    expect(result.cards.length).toBeGreaterThan(0);
    expect(result.cards.some(card => 
      card.abilities.includes('burn') || card.collectionMetadata.tags.includes('burn')
    )).toBe(true);
  });
});
```

### Test: updateCardMetadata
```typescript
describe('CardManagementService.updateCardMetadata', () => {
  it('should update card favorite status', async () => {
    await service.updateCardMetadata('card-123', { isFavorite: true });
    
    const collection = await service.loadCollection('player-123');
    const updatedCard = collection.cards.find(c => c.id === 'card-123');
    
    expect(updatedCard?.collectionMetadata.isFavorite).toBe(true);
  });
  
  it('should increment usage count', async () => {
    const originalUsage = mockCard.collectionMetadata.timesUsed;
    
    await service.updateCardMetadata('card-123', { 
      timesUsed: originalUsage + 1 
    });
    
    const collection = await service.loadCollection('player-123');
    const updatedCard = collection.cards.find(c => c.id === 'card-123');
    
    expect(updatedCard?.collectionMetadata.timesUsed).toBe(originalUsage + 1);
  });
  
  it('should queue changes for sync', async () => {
    const syncSpy = jest.spyOn(service, 'queueSyncOperation');
    
    await service.updateCardMetadata('card-123', { isFavorite: true });
    
    expect(syncSpy).toHaveBeenCalledWith({
      type: 'update',
      entityType: 'card',
      entityId: 'card-123',
      data: { collectionMetadata: { isFavorite: true } }
    });
  });
});
```

## Error Handling

```typescript
enum CardManagementError {
  INVALID_PLAYER_ID = 'INVALID_PLAYER_ID',
  COLLECTION_NOT_FOUND = 'COLLECTION_NOT_FOUND',
  CARD_NOT_FOUND = 'CARD_NOT_FOUND',
  INVALID_FILTER = 'INVALID_FILTER',
  SYNC_FAILED = 'SYNC_FAILED',
  CACHE_ERROR = 'CACHE_ERROR',
  PERFORMANCE_LIMIT_EXCEEDED = 'PERFORMANCE_LIMIT_EXCEEDED'
}

class CardManagementException extends Error {
  constructor(
    public code: CardManagementError,
    message: string,
    public context?: any
  ) {
    super(message);
  }
}
```

## Performance Requirements

- **Filter operation**: Complete in <200ms for collections up to 500 cards
- **Search operation**: Return results in <100ms for text queries
- **Collection loading**: Initial load <1s, cached load <50ms
- **Memory usage**: <50MB for 500 cards with metadata
- **Sync operation**: Queue changes immediately, background sync <5s

## Events

```typescript
interface CardManagementEvents {
  'collection:loaded': { playerId: string; cardCount: number };
  'collection:updated': { playerId: string; changes: string[] };
  'card:favorited': { cardId: string; isFavorite: boolean };
  'filter:applied': { filterId: string; resultCount: number };
  'search:performed': { query: string; resultCount: number; executionTime: number };
  'sync:started': { operationId: string };
  'sync:completed': { operationId: string; changeCount: number };
  'sync:failed': { operationId: string; error: string };
}
```

## Dependencies

### Required Services
- `SyncService`: For backend synchronization
- `CacheService`: For offline data storage
- `ImageService`: For custom image management

### External Libraries
- `fuse.js`: For fuzzy search functionality
- `idb`: For IndexedDB operations
- `rxjs`: For reactive state management (optional)

---
*Service contract for CardManagementService - Ready for implementation*