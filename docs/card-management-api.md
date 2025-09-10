# Card Management API Documentation

## Overview

The Card Management API provides comprehensive functionality for managing card collections in the Memes Wars game. It supports advanced features including offline synchronization, image upload with progress tracking, filtering, searching, and performance optimizations for large collections.

**Version:** 1.0.0  
**Base URL:** `/api`  
**Authentication:** Bearer Token required for all endpoints  

## Table of Contents

- [Authentication](#authentication)
- [Collection Management](#collection-management)
- [Card Operations](#card-operations)
- [Image Management](#image-management)
- [Filter Management](#filter-management)
- [Sync Operations](#sync-operations)
- [Performance & Monitoring](#performance--monitoring)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [SDKs & Libraries](#sdks--libraries)

## Authentication

All API endpoints require authentication via Bearer token in the Authorization header.

```http
Authorization: Bearer <your-token>
```

### Token Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Obtain authentication token |
| POST | `/auth/refresh` | Refresh expired token |
| POST | `/auth/logout` | Invalidate token |

## Collection Management

### Get Player Collection

Retrieve a player's complete card collection with optional pagination and filtering.

```http
GET /cards/collection/{playerId}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| playerId | string | Yes | Unique player identifier |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 50, max: 200) |
| includeMetadata | boolean | No | Include collection metadata |
| includeAll | boolean | No | Bypass pagination (admin only) |
| sortBy | string | No | Sort field: name, rarity, cost, date |
| sortOrder | string | No | Sort order: asc, desc |

**Response:**

```json
{
  "success": true,
  "data": {
    "playerId": "player-123",
    "collectionId": "collection-456",
    "cards": [
      {
        "id": "card-789",
        "name": "Ancient Dragon",
        "image": "https://cdn.example.com/cards/ancient-dragon.png",
        "description": "A mighty dragon from ancient times",
        "rarity": 200,
        "luck": 850,
        "cost": 8,
        "hp": 300,
        "attack": 150,
        "defense": 100,
        "abilities": ["Flying", "Fire Breath"],
        "family": "Dragon",
        "type": "Creature",
        "createdAt": "2025-01-10T10:00:00Z",
        "collectionMetadata": {
          "customImageId": "custom-img-123",
          "lastUsed": "2025-01-10T09:30:00Z",
          "usageCount": 42,
          "userRating": 5,
          "tags": ["favorite", "powerful"],
          "favorite": true,
          "locked": false
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 247,
      "totalPages": 5,
      "hasNext": true,
      "hasPrevious": false
    },
    "metadata": {
      "totalCards": 247,
      "lastSync": "2025-01-10T09:45:00Z",
      "cacheVersion": "v1.2.3"
    }
  }
}
```

### Update Collection Metadata

Update metadata for a player's collection.

```http
PATCH /cards/collection/{playerId}/metadata
```

**Request Body:**

```json
{
  "customSettings": {
    "defaultSort": "rarity",
    "defaultView": "grid",
    "cardsPerPage": 50
  },
  "tags": ["tournament", "competitive"],
  "notes": "Updated for tournament play"
}
```

## Card Operations

### Get Single Card

Retrieve detailed information about a specific card.

```http
GET /cards/{cardId}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cardId | string | Yes | Unique card identifier |
| includeUsage | boolean | No | Include usage statistics |
| includeImages | boolean | No | Include custom images |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "card-789",
    "name": "Ancient Dragon",
    "image": "https://cdn.example.com/cards/ancient-dragon.png",
    "description": "A mighty dragon from ancient times",
    "rarity": 200,
    "luck": 850,
    "cost": 8,
    "hp": 300,
    "attack": 150,
    "defense": 100,
    "abilities": ["Flying", "Fire Breath"],
    "family": "Dragon",
    "type": "Creature",
    "createdAt": "2025-01-10T10:00:00Z",
    "usage": {
      "totalUsage": 42,
      "lastUsed": "2025-01-10T09:30:00Z",
      "avgSessionTime": 120,
      "winRate": 0.75
    },
    "customImages": [
      {
        "id": "custom-img-123",
        "url": "https://cdn.example.com/custom/dragon-alt.png",
        "uploadedAt": "2025-01-09T14:20:00Z",
        "fileSize": 245760,
        "dimensions": { "width": 400, "height": 600 }
      }
    ]
  }
}
```

### Update Card Metadata

Update metadata for a specific card.

```http
PATCH /cards/{cardId}/metadata
```

**Request Body:**

```json
{
  "customImageId": "custom-img-123",
  "lastUsed": "2025-01-10T10:15:00Z",
  "usageCount": 43,
  "userRating": 5,
  "tags": ["favorite", "powerful", "tournament"],
  "favorite": true,
  "locked": false,
  "notes": "My best card for dragon decks"
}
```

### Batch Update Cards

Update multiple cards in a single operation.

```http
PATCH /cards/batch-update
```

**Request Body:**

```json
{
  "updates": [
    {
      "cardId": "card-789",
      "metadata": {
        "tags": ["favorite"],
        "userRating": 5
      }
    },
    {
      "cardId": "card-790",
      "metadata": {
        "tags": ["deck-main"],
        "locked": true
      }
    }
  ]
}
```

### Search Cards

Search through a player's card collection with advanced filtering.

```http
POST /cards/search
```

**Request Body:**

```json
{
  "playerId": "player-123",
  "query": "ancient dragon fire",
  "filters": {
    "rarities": ["Epic", "Legendary"],
    "costRange": { "min": 5, "max": 10 },
    "types": ["Creature"],
    "families": ["Dragon", "Fire"],
    "abilities": ["Flying"],
    "tags": ["favorite"],
    "customOnly": false
  },
  "options": {
    "maxResults": 50,
    "includeAbilities": true,
    "includeDescription": true,
    "threshold": 0.4,
    "sortBy": "relevance",
    "highlightMatches": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "item": {
          "id": "card-789",
          "name": "Ancient Dragon",
          // ... card data
        },
        "score": 0.95,
        "relevanceScore": 0.95,
        "matches": [
          {
            "field": "name",
            "value": "Ancient Dragon",
            "indices": [[0, 7], [8, 14]]
          }
        ]
      }
    ],
    "totalMatches": 12,
    "searchTerm": "ancient dragon fire",
    "executionTime": 45.2,
    "options": { /* ... */ }
  }
}
```

## Image Management

### Upload Custom Card Image

Upload a custom PNG image for a card with progress tracking.

```http
POST /cards/{cardId}/image
```

**Content-Type:** `multipart/form-data`

**Form Data:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | File | Yes | PNG image file (max 10MB) |
| playerId | string | Yes | Player identifier |
| visibility | string | No | public or private (default: private) |
| replacePrevious | boolean | No | Replace existing image |
| metadata | JSON | No | Additional metadata |

**Response:**

```json
{
  "success": true,
  "data": {
    "imageId": "img-abc123",
    "imageUrl": "https://cdn.example.com/custom/img-abc123.png",
    "uploadedAt": "2025-01-10T10:30:00Z",
    "fileSize": 245760,
    "dimensions": { "width": 400, "height": 600 },
    "processedVariants": {
      "thumbnail": {
        "url": "https://cdn.example.com/custom/img-abc123-thumb.png",
        "dimensions": { "width": 100, "height": 150 },
        "fileSize": 15420
      },
      "medium": {
        "url": "https://cdn.example.com/custom/img-abc123-med.png",
        "dimensions": { "width": 200, "height": 300 },
        "fileSize": 68540
      }
    },
    "visibility": "private",
    "compressionRatio": 0.8,
    "optimizationApplied": true,
    "contentHash": "sha256:abcdef123456...",
    "uploadStats": {
      "transferTime": 1250,
      "processingTime": 850,
      "totalTime": 2100
    }
  }
}
```

### Get Card Images

Retrieve all images associated with a card.

```http
GET /cards/{cardId}/images
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| playerId | string | Yes | Player identifier |
| includeVariants | boolean | No | Include processed variants |

### Delete Card Image

Remove a custom image from a card.

```http
DELETE /cards/{cardId}/image
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| playerId | string | Yes | Player identifier |

**Response:**

```json
{
  "success": true,
  "data": {
    "deletedImageId": "img-abc123",
    "deletedAt": "2025-01-10T10:45:00Z",
    "cascadeOperations": [
      { "type": "variant_cleanup", "status": "completed" },
      { "type": "cache_invalidation", "status": "completed" }
    ]
  }
}
```

## Filter Management

### Get Player Filters

Retrieve saved filters for a player.

```http
GET /cards/filters/{playerId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "filters": [
      {
        "id": "filter-123",
        "name": "Tournament Dragons",
        "criteria": {
          "rarities": ["Epic", "Legendary"],
          "families": ["Dragon"],
          "costRange": { "min": 5, "max": 12 },
          "tags": ["tournament"]
        },
        "active": true,
        "createdDate": "2025-01-08T14:20:00Z",
        "lastUsed": "2025-01-10T09:15:00Z",
        "playerId": "player-123"
      }
    ],
    "totalFilters": 5,
    "activeFilters": 2
  }
}
```

### Create Filter

Save a new filter configuration.

```http
POST /cards/filters/{playerId}
```

**Request Body:**

```json
{
  "name": "High Cost Spells",
  "criteria": {
    "types": ["Spell"],
    "costRange": { "min": 8 },
    "rarities": ["Epic", "Legendary"]
  },
  "active": true
}
```

### Update Filter

Modify an existing filter.

```http
PUT /cards/filters/{filterId}
```

### Delete Filter

Remove a saved filter.

```http
DELETE /cards/filters/{filterId}
```

## Sync Operations

### Sync Collection

Synchronize offline changes with the server.

```http
POST /cards/collection/{playerId}/sync
```

**Request Body:**

```json
{
  "changes": [
    {
      "type": "update",
      "itemType": "card",
      "itemId": "card-789",
      "data": {
        "metadata": {
          "tags": ["favorite"],
          "userRating": 5
        }
      },
      "previousData": {
        "metadata": {
          "tags": [],
          "userRating": null
        }
      },
      "timestamp": "2025-01-10T09:30:00Z",
      "clientId": "client-abc123"
    }
  ],
  "clientTimestamp": "2025-01-10T10:00:00Z"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "syncStatus": "success",
    "syncedItems": {
      "cards": 5,
      "filters": 2,
      "images": 1
    },
    "conflicts": [],
    "errors": [],
    "serverTimestamp": "2025-01-10T10:00:15Z"
  }
}
```

### Get Sync Status

Check the synchronization status for a player.

```http
GET /cards/sync/status/{playerId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "playerId": "player-123",
    "status": "synced",
    "lastSync": "2025-01-10T09:45:00Z",
    "pendingChanges": 0,
    "conflictsToResolve": 0,
    "nextSyncETA": null,
    "syncHistory": [
      {
        "timestamp": "2025-01-10T09:45:00Z",
        "status": "success",
        "itemsSynced": 3,
        "duration": 1250
      }
    ]
  }
}
```

### Resolve Sync Conflict

Resolve a synchronization conflict.

```http
POST /conflicts/{itemId}/resolve
```

**Request Body:**

```json
{
  "resolution": "local",
  "resolvedData": {
    // ... resolved data
  },
  "playerId": "player-123"
}
```

## Performance & Monitoring

### Get Analytics

Retrieve usage analytics for cards.

```http
GET /analytics/cards/{playerId}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cardId | string | No | Specific card analytics |
| dateRange | string | No | Time range: 7d, 30d, 90d |

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsage": 1250,
    "averageSessionTime": 145,
    "lastUsed": "2025-01-10T09:30:00Z",
    "usageByDay": [
      { "date": "2025-01-10", "count": 15 },
      { "date": "2025-01-09", "count": 22 }
    ],
    "popularCombinations": [
      { "cards": ["card-789", "card-790"], "frequency": 45 }
    ],
    "performanceMetrics": {
      "avgSearchTime": 45.2,
      "avgFilterTime": 32.1,
      "cacheHitRate": 0.85
    }
  }
}
```

### Get Collection Statistics

Retrieve comprehensive statistics about a collection.

```http
GET /cards/collection/{playerId}/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalCards": 247,
    "byRarity": {
      "Common": 85,
      "Uncommon": 67,
      "Rare": 45,
      "Epic": 35,
      "Legendary": 12,
      "Mythic": 3
    },
    "byType": {
      "Creature": 156,
      "Spell": 78,
      "Artifact": 13
    },
    "byFamily": {
      "Fire": 45,
      "Water": 38,
      "Earth": 41,
      "Air": 35,
      "Dark": 42,
      "Light": 46
    },
    "averageLuck": 245.6,
    "totalDeckHP": 15680,
    "strongestCard": "Ancient Dragon",
    "mostUsedCard": "Fire Bolt",
    "newestCard": "Crystal Guardian",
    "completionPercentage": 78.4
  }
}
```

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "playerId",
        "message": "Player ID is required"
      }
    ],
    "requestId": "req-abc123",
    "timestamp": "2025-01-10T10:30:00Z"
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| VALIDATION_ERROR | Request validation failed | 400 |
| UNAUTHORIZED | Invalid or missing authentication | 401 |
| FORBIDDEN | Insufficient permissions | 403 |
| NOT_FOUND | Resource not found | 404 |
| CONFLICT | Resource conflict (e.g., sync conflict) | 409 |
| PAYLOAD_TOO_LARGE | Upload exceeds size limit | 413 |
| RATE_LIMITED | Too many requests | 429 |
| INTERNAL_ERROR | Server error | 500 |
| SERVICE_UNAVAILABLE | Temporary service issue | 503 |

### Error Recovery Strategies

| Error Type | Recommended Action |
|------------|-------------------|
| Network Error | Retry with exponential backoff |
| Validation Error | Fix request and resubmit |
| Auth Error | Refresh token and retry |
| Conflict Error | Use conflict resolution API |
| Rate Limit | Wait and retry after cooldown |
| Server Error | Retry after delay |

## Rate Limiting

API endpoints are rate limited to ensure fair usage and system stability.

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1641811200
X-RateLimit-Window: 3600
```

### Rate Limits by Endpoint Type

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Collection GET | 300/hour | 1 hour |
| Collection POST/PUT | 100/hour | 1 hour |
| Image Upload | 50/hour | 1 hour |
| Search | 500/hour | 1 hour |
| Sync Operations | 200/hour | 1 hour |

## SDKs & Libraries

### JavaScript/TypeScript SDK

```bash
npm install @memes-wars/card-management-sdk
```

```typescript
import { CardManagementClient } from '@memes-wars/card-management-sdk'

const client = new CardManagementClient({
  baseUrl: 'https://api.memes-wars.com',
  apiKey: 'your-api-key'
})

// Get collection
const collection = await client.collections.get('player-123')

// Search cards
const searchResult = await client.cards.search('player-123', 'dragon', {
  filters: { rarities: ['Epic', 'Legendary'] }
})

// Upload image with progress
await client.images.upload('card-789', file, {
  onProgress: (progress) => {
    console.log(`Upload: ${progress.percentage}%`)
  }
})
```

### Performance Utilities

```typescript
import { PerformanceUtils } from '@memes-wars/card-management-sdk'

// Debounced search
const debouncedSearch = PerformanceUtils.debounce(
  (query: string) => client.cards.search('player-123', query),
  300
)

// Chunked processing
await PerformanceUtils.processInChunks(
  cards,
  async (chunk) => await processCards(chunk),
  100
)
```

## Webhooks

Subscribe to real-time events for collection changes.

### Webhook Events

| Event | Description |
|-------|-------------|
| collection.updated | Collection modified |
| card.metadata.changed | Card metadata updated |
| image.uploaded | Custom image uploaded |
| sync.completed | Synchronization finished |
| conflict.detected | Sync conflict occurred |

### Webhook Payload Example

```json
{
  "event": "collection.updated",
  "timestamp": "2025-01-10T10:30:00Z",
  "data": {
    "playerId": "player-123",
    "collectionId": "collection-456",
    "changes": [
      {
        "type": "card.added",
        "cardId": "card-999",
        "timestamp": "2025-01-10T10:29:45Z"
      }
    ]
  }
}
```

## API Versioning

The API uses URL versioning with backwards compatibility support.

| Version | Status | End of Life |
|---------|--------|-------------|
| v1 | Current | TBD |
| v0 (beta) | Deprecated | 2025-06-01 |

### Version Migration

- All breaking changes will increment the major version
- New features are added as backwards-compatible additions
- Deprecated features include migration guides
- 6-month notice period for version deprecation

---

**Last Updated:** 2025-01-10  
**API Version:** 1.0.0  
**Contact:** [api-support@memes-wars.com](mailto:api-support@memes-wars.com)