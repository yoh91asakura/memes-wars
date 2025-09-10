# Research: Complete Card Management System

**Feature**: Complete Card Management System  
**Date**: 2025-01-10  
**Research Phase**: Technical decisions and best practices

## Research Tasks Completed

### 1. PNG Image Validation for React Applications

**Decision**: Client-side validation with File API + Canvas for dimensions, server-side validation for security  
**Rationale**: Provides immediate user feedback while maintaining security through double validation  
**Alternatives considered**:
- Server-only validation: Poor UX, slow feedback
- Canvas-only validation: Security risk, can be bypassed
- Third-party libraries: Unnecessary complexity for PNG validation

**Implementation approach**:
```typescript
// Client-side validation
const validatePNG = (file: File): Promise<ValidationResult> => {
  // Check file type, size, dimensions using Canvas API
  // Provide immediate feedback to user
}

// Server-side validation (backend API)
POST /api/cards/image/validate
// Security validation, malware scanning, final dimensions check
```

### 2. File Upload with Progress Tracking in TypeScript

**Decision**: XMLHttpRequest with progress events + React state for UI updates  
**Rationale**: Native browser support, precise progress tracking, easy React integration  
**Alternatives considered**:
- Fetch API: No upload progress support
- Third-party upload libraries: Overkill for single file uploads
- WebSocket upload: Unnecessary complexity

**Implementation approach**:
```typescript
interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
}

const useImageUpload = () => {
  const [progress, setProgress] = useState<UploadProgress>();
  // XMLHttpRequest with onprogress handler
}
```

### 3. Offline-First Synchronization Patterns for Web Applications

**Decision**: IndexedDB for local storage + sync queue with conflict resolution  
**Rationale**: Persistent storage, large capacity, works offline, handles sync conflicts  
**Alternatives considered**:
- localStorage: Size limitations, no structured data
- WebSQL: Deprecated technology
- Memory-only: Data loss on refresh

**Implementation approach**:
```typescript
interface SyncItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

class SyncQueue {
  // IndexedDB for persistence
  // Queue pending changes
  // Handle conflicts with last-write-wins + user choice
}
```

### 4. Performance Optimization for Large Lists in React

**Decision**: React Window for virtualization + useMemo for filtered results  
**Rationale**: Handles thousands of cards efficiently, maintains smooth scrolling  
**Alternatives considered**:
- Pagination only: Poor UX for filtering/searching
- No optimization: Performance issues with 500+ cards
- Custom virtualization: Reinventing the wheel

**Implementation approach**:
```typescript
const CardGrid = ({ cards, filters }) => {
  const filteredCards = useMemo(() => 
    applyFilters(cards, filters), [cards, filters]
  );
  
  return (
    <VariableSizeGrid
      itemData={filteredCards}
      itemSize={() => 200}
      // React Window configuration
    />
  );
};
```

## Technical Decisions Summary

### Image Handling
- **Format**: PNG only, validated on both client and server
- **Size limit**: 5MB maximum, enforced client-side with server confirmation
- **Dimensions**: 400x600px recommended, 200x300px minimum, 800x1200px maximum
- **Storage**: Backend API with CDN for production, local cache for offline

### Filtering & Search
- **Real-time filtering**: Debounced input (300ms) with useMemo optimization
- **Filter persistence**: localStorage for session, backend sync for cross-device
- **Search algorithm**: Fuzzy matching with Fuse.js for card names and abilities
- **Performance**: Virtual scrolling for collections >100 cards

### Synchronization
- **Strategy**: Offline-first with eventual consistency
- **Conflict resolution**: Last-write-wins with user override option
- **Storage**: IndexedDB for offline data, automatic background sync
- **Retry logic**: Exponential backoff for failed sync attempts

### State Management
- **Architecture**: Zustand stores for collection and filter state
- **Persistence**: Automatic serialization to IndexedDB
- **Real-time updates**: WebSocket integration for multi-device sync (future)

## Security Considerations

### Image Upload Security
- Client-side type checking (File.type validation)
- Server-side MIME type verification
- Content scanning for malicious files
- Size and dimension limits enforced
- Sandboxed image processing

### Data Synchronization Security
- Authentication tokens for API requests
- HTTPS only for image uploads
- Input validation on filter parameters
- Rate limiting for API calls

## Performance Benchmarks

### Target Performance Metrics
- **Filter response**: <200ms for any combination of filters
- **Image upload feedback**: <1s for progress indication start
- **Grid rendering**: 60fps scroll with 500+ cards
- **Search results**: <100ms for text search with fuzzy matching
- **Sync completion**: <5s for typical collection changes

### Memory Usage
- **Target**: <50MB for 500 card collection with images cached
- **Optimization**: Lazy image loading, WebP conversion for display
- **Cleanup**: Automatic cache cleanup for unused images

## Browser Compatibility

### Minimum Requirements
- Chrome 90+, Firefox 90+, Safari 14+
- IndexedDB support required
- File API support required
- Canvas API support required

### Progressive Enhancement
- Basic card display without custom images on older browsers
- Graceful degradation of filtering features
- Fallback to server-side pagination if virtualization fails

## Integration Points

### Existing Systems
- **Card data**: Integration with existing CardService and cardsStore
- **Game mechanics**: Preserve all existing card properties and behaviors
- **UI components**: Reuse atomic components from existing design system
- **Testing**: Integration with existing Vitest and Playwright setup

### New Dependencies
- **react-window**: Virtual scrolling for large lists
- **fuse.js**: Fuzzy search for card filtering
- **idb**: IndexedDB wrapper for easier offline storage
- **file-type**: Client-side file type validation

---
*Research completed for Complete Card Management System - Ready for Phase 1 design*