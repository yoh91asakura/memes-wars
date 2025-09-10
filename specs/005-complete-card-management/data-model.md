# Data Model: Complete Card Management System

**Feature**: Complete Card Management System  
**Date**: 2025-01-10  
**Dependencies**: research.md, spec.md

## Entity Overview

The complete card management system introduces 5 core entities that extend and enhance the existing card system while maintaining backward compatibility.

```
CardCollection (1) ←→ (*) Card ←→ (0..1) CardImage
       ↓                            ↓
   CardFilter (*)              SyncStatus (1)
```

## Core Entities

### 1. Card (Enhanced)
**Purpose**: Extended card entity with custom image support and management metadata  
**Extends**: Existing card interface from `src/models/Card.ts`

```typescript
interface Card {
  // Existing card properties (preserved)
  id: string;
  name: string;
  rarity: Rarity;
  cost: number;
  abilities: Ability[];
  stats: CardStats;
  emoji: string;
  originalImage: string;

  // New management properties
  customImage?: CardImage;
  collectionMetadata: {
    acquiredDate: Date;
    timesUsed: number;
    isFavorite: boolean;
    tags: string[];
    notes?: string;
  };
  syncStatus: SyncStatus;
}
```

**Validation Rules**:
- `id` must be unique within collection
- `customImage` must be validated PNG if present
- `collectionMetadata.acquiredDate` cannot be future date
- `collectionMetadata.timesUsed` must be non-negative integer

**State Transitions**:
- New → Acquired (when added to collection)
- Acquired → Modified (when custom image added)
- Modified → Syncing (when uploading to backend)
- Syncing → Synced (when backend confirms)
- Synced → Conflicted (when sync conflict detected)

### 2. CardCollection
**Purpose**: Player's complete card collection with filtering and search capabilities

```typescript
interface CardCollection {
  id: string;
  playerId: string;
  cards: Card[];
  metadata: {
    totalCards: number;
    lastUpdated: Date;
    version: number;
  };
  preferences: {
    defaultSort: SortCriteria;
    defaultFilters: CardFilter[];
    viewMode: 'grid' | 'list' | 'compact';
    itemsPerPage: number;
  };
  searchIndex: SearchIndex; // Pre-built for performance
}
```

**Validation Rules**:
- `cards` array must not contain duplicates by id
- `metadata.totalCards` must equal `cards.length`
- `metadata.version` must increment on changes
- `preferences.itemsPerPage` must be between 10 and 100

### 3. CardFilter
**Purpose**: Multi-criteria filtering state with persistence

```typescript
interface CardFilter {
  id: string;
  name: string; // User-friendly name for saved filters
  criteria: {
    rarities: Rarity[];
    costRange: { min: number; max: number };
    abilities: string[];
    tags: string[];
    textSearch: string;
    isFavorite?: boolean;
    hasCustomImage?: boolean;
  };
  active: boolean;
  createdDate: Date;
  lastUsed: Date;
}
```

**Validation Rules**:
- `criteria.costRange.min` ≤ `criteria.costRange.max`
- `criteria.rarities` must be valid Rarity enum values
- `criteria.textSearch` max length 100 characters
- `name` required for saved filters, auto-generated for temporary

### 4. CardImage
**Purpose**: Custom PNG illustration with validation and storage metadata

```typescript
interface CardImage {
  id: string;
  cardId: string;
  filename: string;
  originalFilename: string;
  mimeType: 'image/png';
  size: number; // bytes
  dimensions: {
    width: number;
    height: number;
  };
  validation: {
    isValidPNG: boolean;
    hasTransparency: boolean;
    colorDepth: number;
  };
  storage: {
    localPath?: string; // For offline access
    cdnUrl?: string; // For online access
    uploadDate: Date;
    checksum: string; // For integrity verification
  };
  syncStatus: SyncStatus;
}
```

**Validation Rules**:
- `mimeType` must be exactly 'image/png'
- `size` must be ≤ 5MB (5,242,880 bytes)
- `dimensions.width` and `dimensions.height` between 200-800 pixels
- `checksum` must be SHA-256 hash for integrity
- `filename` must be sanitized for filesystem safety

### 5. SyncStatus
**Purpose**: Synchronization tracking between client and backend

```typescript
interface SyncStatus {
  entityId: string;
  entityType: 'card' | 'cardImage' | 'collection' | 'filter';
  status: 'synced' | 'pending' | 'syncing' | 'failed' | 'conflict';
  lastSyncAttempt: Date;
  lastSuccessfulSync: Date;
  syncVersion: number;
  pendingActions: SyncAction[];
  error?: {
    code: string;
    message: string;
    retryCount: number;
  };
}

interface SyncAction {
  type: 'create' | 'update' | 'delete';
  timestamp: Date;
  data: any;
  applied: boolean;
}
```

**Validation Rules**:
- `status` must be valid enum value
- `syncVersion` must increment on successful syncs
- `error.retryCount` must be non-negative
- `pendingActions` array must be ordered by timestamp

## Derived Entities

### SearchIndex
**Purpose**: Pre-built search index for performance optimization

```typescript
interface SearchIndex {
  cards: Array<{
    id: string;
    searchableText: string; // name + abilities + tags combined
    boost: number; // relevance boost for favorites
  }>;
  lastUpdated: Date;
  version: number;
}
```

### FilterResult
**Purpose**: Result of applying filters to card collection

```typescript
interface FilterResult {
  cards: Card[];
  totalMatches: number;
  appliedFilters: CardFilter[];
  executionTime: number; // milliseconds
  pagination: {
    page: number;
    itemsPerPage: number;
    totalPages: number;
  };
}
```

## Relationships

### Card ↔ CardImage (0..1)
- Each card can have zero or one custom image
- Custom image always belongs to exactly one card
- Cascade delete: When card deleted, custom image deleted
- Referential integrity: CardImage.cardId must exist in Card collection

### CardCollection ↔ Card (1..*)
- Each collection contains multiple cards
- Each card belongs to exactly one collection
- Cascade delete: When collection deleted, all cards deleted
- Referential integrity: Card.collectionId must exist

### CardFilter ↔ CardCollection (*..*)
- Filters can be applied to any collection
- Collections can have multiple active filters
- Independent lifecycle: Filters persist when collections change
- Soft reference: Filters don't enforce collection existence

### Entity ↔ SyncStatus (1..1)
- Every managed entity has exactly one sync status
- Sync status cannot exist without parent entity
- Cascade delete: When entity deleted, sync status deleted
- Strong consistency: SyncStatus.entityId must exist

## Storage Strategy

### Client-Side Storage (IndexedDB)
```typescript
interface LocalDatabase {
  collections: ObjectStore<CardCollection>;
  cards: ObjectStore<Card>;
  cardImages: ObjectStore<CardImage>;
  filters: ObjectStore<CardFilter>;
  syncStatus: ObjectStore<SyncStatus>;
  searchIndex: ObjectStore<SearchIndex>;
}
```

### Backend API Schema
```typescript
// REST endpoints
GET    /api/cards/collection/{playerId}
POST   /api/cards/collection/{playerId}/sync
PUT    /api/cards/{cardId}
POST   /api/cards/{cardId}/image
GET    /api/cards/filters/{playerId}
POST   /api/cards/filters/{playerId}
```

## Performance Considerations

### Indexing Strategy
- Primary indexes: id fields for all entities
- Secondary indexes: 
  - Card.rarity for filter performance
  - Card.cost for range queries
  - CardImage.cardId for joins
  - SyncStatus.status for sync operations

### Caching Strategy
- SearchIndex cached in memory, rebuilt on collection changes
- FilterResult cached by filter criteria hash
- CardImage thumbnails cached separately from full images
- Sync status cached to avoid repeated API calls

### Memory Management
- Lazy load card images on demand
- Paginate large collections to limit memory usage
- Cleanup unused search indexes periodically
- Compress offline storage using IndexedDB compression

---
*Data model for Complete Card Management System - Ready for contract generation*