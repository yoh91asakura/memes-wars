# API Contract: Card Management System

**Service**: Complete Card Management API  
**Version**: v1.0.0  
**Date**: 2025-01-10

## Overview

REST API for complete card collection management, including filtering, search, custom images, and synchronization. Extends existing game backend with enhanced card management capabilities.

## Authentication

All endpoints require authentication via Bearer token:
```
Authorization: Bearer <jwt-token>
```

## Base URL
```
Production: https://api.memes-wars.com/v1
Development: http://localhost:3001/api/v1
```

## Endpoints

### Card Collection Management

#### GET /cards/collection/{playerId}
**Purpose**: Retrieve player's complete card collection with optional filtering

**Parameters**:
- `playerId` (path, required): Player identifier
- `rarity` (query, optional): Filter by rarity (comma-separated)
- `costMin` (query, optional): Minimum cost filter
- `costMax` (query, optional): Maximum cost filter
- `abilities` (query, optional): Filter by abilities (comma-separated)
- `search` (query, optional): Text search in name/description
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 50, max: 100)
- `sort` (query, optional): Sort criteria (name|rarity|cost|acquired|used)
- `order` (query, optional): Sort order (asc|desc, default: asc)

**Response 200**:
```json
{
  "collection": {
    "id": "collection-uuid",
    "playerId": "player-123",
    "totalCards": 247,
    "lastUpdated": "2025-01-10T15:30:00Z",
    "version": 15
  },
  "cards": [
    {
      "id": "card-uuid",
      "name": "Fire Dragon",
      "rarity": "legendary",
      "cost": 8,
      "abilities": ["burn", "flying"],
      "stats": { "attack": 8, "defense": 6 },
      "emoji": "🐉",
      "originalImage": "/images/cards/fire-dragon.png",
      "customImage": {
        "id": "custom-uuid",
        "cdnUrl": "/images/custom/player-123/card-uuid.png",
        "uploadDate": "2025-01-08T10:00:00Z"
      },
      "collectionMetadata": {
        "acquiredDate": "2024-12-15T09:30:00Z",
        "timesUsed": 42,
        "isFavorite": true,
        "tags": ["deck-main", "pvp"],
        "notes": "Best card for fire deck"
      },
      "syncStatus": "synced"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalItems": 247,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  },
  "appliedFilters": {
    "rarity": ["legendary", "epic"],
    "costRange": { "min": 5, "max": 10 },
    "search": "dragon"
  },
  "executionTime": 45
}
```

**Error Responses**:
- `400`: Invalid filter parameters
- `401`: Unauthorized access
- `404`: Player collection not found
- `500`: Server error

#### POST /cards/collection/{playerId}/sync
**Purpose**: Synchronize local changes with server

**Request Body**:
```json
{
  "clientVersion": 14,
  "changes": [
    {
      "type": "update",
      "entityType": "card",
      "entityId": "card-uuid",
      "timestamp": "2025-01-10T15:25:00Z",
      "data": {
        "collectionMetadata": {
          "isFavorite": true,
          "tags": ["deck-main", "pvp", "tournament"]
        }
      }
    },
    {
      "type": "create",
      "entityType": "filter",
      "entityId": "filter-uuid",
      "timestamp": "2025-01-10T15:26:00Z",
      "data": {
        "name": "PvP Dragons",
        "criteria": {
          "rarities": ["legendary"],
          "abilities": ["burn", "flying"],
          "tags": ["pvp"]
        }
      }
    }
  ]
}
```

**Response 200**:
```json
{
  "syncResult": "success",
  "serverVersion": 16,
  "conflicts": [],
  "appliedChanges": [
    {
      "clientChangeId": "change-1",
      "status": "applied",
      "serverVersion": 15
    },
    {
      "clientChangeId": "change-2", 
      "status": "applied",
      "serverVersion": 16
    }
  ]
}
```

**Response 409** (Conflicts):
```json
{
  "syncResult": "conflict",
  "serverVersion": 16,
  "conflicts": [
    {
      "entityId": "card-uuid",
      "clientChange": { /* client data */ },
      "serverState": { /* server data */ },
      "conflictType": "concurrent_modification",
      "resolution": "manual" // or "server_wins", "client_wins"
    }
  ]
}
```

### Custom Image Management

#### POST /cards/{cardId}/image
**Purpose**: Upload custom PNG image for a card

**Parameters**:
- `cardId` (path, required): Card identifier

**Request**: Multipart form-data
```
Content-Type: multipart/form-data

image: [PNG file, max 5MB]
metadata: {
  "originalFilename": "my-dragon.png",
  "playerNotes": "Custom artwork for favorite card"
}
```

**Response 200**:
```json
{
  "upload": {
    "id": "upload-uuid",
    "cardId": "card-uuid",
    "status": "completed",
    "image": {
      "id": "image-uuid",
      "filename": "card-uuid-20250110153000.png",
      "originalFilename": "my-dragon.png",
      "size": 2048576,
      "dimensions": { "width": 400, "height": 600 },
      "cdnUrl": "/images/custom/player-123/card-uuid.png",
      "uploadDate": "2025-01-10T15:30:00Z",
      "checksum": "sha256:abc123..."
    }
  }
}
```

**Response 400** (Validation Error):
```json
{
  "error": "validation_failed",
  "message": "Invalid image file",
  "details": {
    "code": "INVALID_FORMAT",
    "expected": "PNG",
    "received": "JPEG",
    "maxSize": "5MB",
    "receivedSize": "8MB"
  }
}
```

#### GET /cards/{cardId}/image
**Purpose**: Get custom image information for a card

**Response 200**:
```json
{
  "image": {
    "id": "image-uuid",
    "cardId": "card-uuid", 
    "cdnUrl": "/images/custom/player-123/card-uuid.png",
    "thumbnailUrl": "/images/custom/player-123/card-uuid-thumb.png",
    "dimensions": { "width": 400, "height": 600 },
    "size": 2048576,
    "uploadDate": "2025-01-10T15:30:00Z",
    "checksum": "sha256:abc123..."
  }
}
```

**Response 404**: No custom image for card

#### DELETE /cards/{cardId}/image
**Purpose**: Remove custom image for a card

**Response 204**: Image deleted successfully

### Filter Management

#### GET /cards/filters/{playerId}
**Purpose**: Get saved filters for a player

**Response 200**:
```json
{
  "filters": [
    {
      "id": "filter-uuid",
      "name": "PvP Dragons",
      "criteria": {
        "rarities": ["legendary", "epic"],
        "abilities": ["burn", "flying"],
        "costRange": { "min": 6, "max": 10 },
        "tags": ["pvp"],
        "isFavorite": true
      },
      "active": true,
      "createdDate": "2025-01-05T10:00:00Z",
      "lastUsed": "2025-01-10T14:30:00Z"
    }
  ]
}
```

#### POST /cards/filters/{playerId}
**Purpose**: Create or update a saved filter

**Request Body**:
```json
{
  "name": "Budget Deck",
  "criteria": {
    "costRange": { "min": 1, "max": 4 },
    "rarities": ["common", "uncommon"],
    "hasCustomImage": false
  }
}
```

**Response 201**:
```json
{
  "filter": {
    "id": "filter-uuid",
    "name": "Budget Deck",
    "criteria": { /* same as request */ },
    "active": false,
    "createdDate": "2025-01-10T15:30:00Z",
    "lastUsed": "2025-01-10T15:30:00Z"
  }
}
```

### Health & Status

#### GET /health
**Purpose**: API health check

**Response 200**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-10T15:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "storage": "available",
    "cache": "active"
  }
}
```

## Error Handling

### Standard Error Format
```json
{
  "error": "error_code",
  "message": "Human readable message",
  "details": {
    "field": "validation details",
    "code": "SPECIFIC_ERROR_CODE"
  },
  "timestamp": "2025-01-10T15:30:00Z",
  "requestId": "req-uuid"
}
```

### Common Error Codes
- `INVALID_REQUEST`: Malformed request body
- `VALIDATION_FAILED`: Request validation errors
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (sync conflicts)
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- Collection requests: 100/minute per player
- Image uploads: 10/minute per player
- Sync requests: 20/minute per player
- Filter operations: 200/minute per player

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641825600
```

## WebSocket Events (Future)

### Real-time Sync Events
```javascript
// Collection updated by another device
{
  "type": "collection_updated",
  "playerId": "player-123",
  "changes": [/* sync changes */]
}

// Image upload progress
{
  "type": "image_upload_progress",
  "uploadId": "upload-uuid",
  "progress": 75,
  "status": "uploading"
}
```

---
*API Contract for Complete Card Management System - Ready for implementation*