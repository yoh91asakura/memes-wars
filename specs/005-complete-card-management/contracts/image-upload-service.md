# Service Contract: ImageUploadService

**Service**: Custom Card Image Upload Service  
**Type**: Frontend TypeScript Service  
**Dependencies**: CardImage, FileValidation, ProgressTracking

## Purpose

Handles PNG image uploads for custom card illustrations, including client-side validation, progress tracking, and integration with backend storage. Provides offline support and error recovery.

## Interface Definition

```typescript
interface ImageUploadService {
  // Upload Operations
  uploadCardImage(cardId: string, file: File, options?: UploadOptions): Promise<UploadResult>;
  validateImageFile(file: File): Promise<ValidationResult>;
  cancelUpload(uploadId: string): Promise<void>;
  retryFailedUpload(uploadId: string): Promise<UploadResult>;
  
  // Progress Tracking
  getUploadProgress(uploadId: string): UploadProgress | null;
  subscribeToProgress(uploadId: string, callback: ProgressCallback): Unsubscribe;
  
  // Image Management
  previewImage(file: File): Promise<PreviewData>;
  generateThumbnail(file: File, dimensions: ThumbnailSize): Promise<Blob>;
  compressImage(file: File, quality: number): Promise<Blob>;
  
  // Storage Operations
  getCachedImage(cardId: string): Promise<CardImage | null>;
  clearImageCache(cardId?: string): Promise<void>;
  getStorageUsage(): Promise<StorageInfo>;
  
  // Batch Operations
  uploadMultipleImages(uploads: Array<{ cardId: string; file: File }>): Promise<BatchUploadResult>;
  validateMultipleFiles(files: File[]): Promise<ValidationResult[]>;
}
```

## Type Definitions

```typescript
interface UploadOptions {
  quality?: number; // 0.1 to 1.0, for compression
  generateThumbnail?: boolean;
  thumbnailSize?: ThumbnailSize;
  onProgress?: ProgressCallback;
  allowRetry?: boolean;
  timeout?: number; // milliseconds
}

interface UploadResult {
  success: boolean;
  uploadId: string;
  cardImage?: CardImage;
  error?: UploadError;
  uploadTime: number; // milliseconds
  fileSize: number; // bytes
  compressionRatio?: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata: FileMetadata;
}

interface ValidationError {
  code: string;
  message: string;
  field?: string;
  expected?: any;
  actual?: any;
}

interface ValidationWarning {
  code: string;
  message: string;
  recommendation?: string;
}

interface FileMetadata {
  size: number;
  type: string;
  dimensions: { width: number; height: number };
  hasTransparency: boolean;
  colorDepth: number;
  compressionType: string;
  lastModified: Date;
}

interface UploadProgress {
  uploadId: string;
  cardId: string;
  filename: string;
  loaded: number; // bytes uploaded
  total: number; // total file size
  percentage: number; // 0-100
  status: UploadStatus;
  speed: number; // bytes per second
  estimatedTimeRemaining: number; // milliseconds
  error?: UploadError;
}

enum UploadStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  COMPRESSING = 'compressing',
  UPLOADING = 'uploading',
  PROCESSING = 'processing', // server-side processing
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

interface UploadError {
  code: string;
  message: string;
  retryable: boolean;
  retryCount: number;
  details?: any;
}

interface PreviewData {
  dataUrl: string;
  dimensions: { width: number; height: number };
  fileSize: number;
  estimatedUploadTime: number;
}

interface ThumbnailSize {
  width: number;
  height: number;
  maintainAspectRatio?: boolean;
}

interface StorageInfo {
  totalSpace: number; // bytes
  usedSpace: number;
  availableSpace: number;
  imageCount: number;
  oldestImage: Date;
}

interface BatchUploadResult {
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  results: UploadResult[];
  totalTime: number;
}

type ProgressCallback = (progress: UploadProgress) => void;
type Unsubscribe = () => void;
```

## Contract Tests

### Test: validateImageFile
```typescript
describe('ImageUploadService.validateImageFile', () => {
  it('should accept valid PNG files', async () => {
    const validPngFile = new File([pngBuffer], 'test.png', { type: 'image/png' });
    
    const result = await service.validateImageFile(validPngFile);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.metadata.type).toBe('image/png');
  });
  
  it('should reject non-PNG files', async () => {
    const jpegFile = new File([jpegBuffer], 'test.jpg', { type: 'image/jpeg' });
    
    const result = await service.validateImageFile(jpegFile);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      expect.objectContaining({
        code: 'INVALID_FORMAT',
        message: expect.stringContaining('PNG')
      })
    );
  });
  
  it('should reject files over size limit', async () => {
    const largePngFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.png', { 
      type: 'image/png' 
    });
    
    const result = await service.validateImageFile(largePngFile);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      expect.objectContaining({
        code: 'FILE_TOO_LARGE',
        expected: 5242880, // 5MB in bytes
        actual: largePngFile.size
      })
    );
  });
  
  it('should validate image dimensions', async () => {
    const tinyPngFile = createMockPngFile(100, 100);
    
    const result = await service.validateImageFile(tinyPngFile);
    
    expect(result.warnings).toContain(
      expect.objectContaining({
        code: 'DIMENSIONS_TOO_SMALL',
        recommendation: expect.stringContaining('200x300')
      })
    );
  });
});
```

### Test: uploadCardImage
```typescript
describe('ImageUploadService.uploadCardImage', () => {
  it('should upload valid image successfully', async () => {
    const validFile = new File([pngBuffer], 'card-art.png', { type: 'image/png' });
    
    const result = await service.uploadCardImage('card-123', validFile);
    
    expect(result.success).toBe(true);
    expect(result.cardImage).toBeDefined();
    expect(result.cardImage?.cardId).toBe('card-123');
    expect(result.uploadTime).toBeGreaterThan(0);
  });
  
  it('should provide progress updates during upload', async () => {
    const progressUpdates: UploadProgress[] = [];
    const onProgress = (progress: UploadProgress) => {
      progressUpdates.push(progress);
    };
    
    const validFile = new File([pngBuffer], 'test.png', { type: 'image/png' });
    
    await service.uploadCardImage('card-123', validFile, { onProgress });
    
    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates[0].percentage).toBe(0);
    expect(progressUpdates[progressUpdates.length - 1].percentage).toBe(100);
  });
  
  it('should handle upload failures gracefully', async () => {
    // Mock network failure
    mockApiCall.mockRejectedValue(new Error('Network error'));
    
    const validFile = new File([pngBuffer], 'test.png', { type: 'image/png' });
    
    const result = await service.uploadCardImage('card-123', validFile);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.retryable).toBe(true);
  });
  
  it('should compress large images automatically', async () => {
    const largeFile = new File([largePngBuffer], 'large.png', { type: 'image/png' });
    
    const result = await service.uploadCardImage('card-123', largeFile, { 
      quality: 0.8 
    });
    
    expect(result.success).toBe(true);
    expect(result.compressionRatio).toBeLessThan(1);
    expect(result.fileSize).toBeLessThan(largeFile.size);
  });
});
```

### Test: progress tracking
```typescript
describe('ImageUploadService progress tracking', () => {
  it('should track upload progress accurately', async () => {
    const file = new File([pngBuffer], 'test.png', { type: 'image/png' });
    
    const uploadPromise = service.uploadCardImage('card-123', file);
    
    // Give upload time to start
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const uploadId = getLastUploadId();
    const progress = service.getUploadProgress(uploadId);
    
    expect(progress).toBeDefined();
    expect(progress!.status).toBeOneOf([
      UploadStatus.VALIDATING,
      UploadStatus.UPLOADING,
      UploadStatus.PROCESSING
    ]);
    
    await uploadPromise;
    
    const finalProgress = service.getUploadProgress(uploadId);
    expect(finalProgress!.status).toBe(UploadStatus.COMPLETED);
    expect(finalProgress!.percentage).toBe(100);
  });
  
  it('should allow subscription to progress updates', async () => {
    const progressUpdates: UploadProgress[] = [];
    
    const file = new File([pngBuffer], 'test.png', { type: 'image/png' });
    const uploadPromise = service.uploadCardImage('card-123', file);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const uploadId = getLastUploadId();
    const unsubscribe = service.subscribeToProgress(uploadId, (progress) => {
      progressUpdates.push(progress);
    });
    
    await uploadPromise;
    unsubscribe();
    
    expect(progressUpdates.length).toBeGreaterThan(1);
    expect(progressUpdates[progressUpdates.length - 1].percentage).toBe(100);
  });
  
  it('should clean up progress data after completion', async () => {
    const file = new File([pngBuffer], 'test.png', { type: 'image/png' });
    
    const result = await service.uploadCardImage('card-123', file);
    
    // Progress should be available immediately after completion
    let progress = service.getUploadProgress(result.uploadId);
    expect(progress).toBeDefined();
    
    // Should be cleaned up after timeout
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    progress = service.getUploadProgress(result.uploadId);
    expect(progress).toBeNull();
  });
});
```

### Test: batch operations
```typescript
describe('ImageUploadService batch operations', () => {
  it('should upload multiple images concurrently', async () => {
    const uploads = [
      { cardId: 'card-1', file: createMockPngFile() },
      { cardId: 'card-2', file: createMockPngFile() },
      { cardId: 'card-3', file: createMockPngFile() }
    ];
    
    const startTime = Date.now();
    const result = await service.uploadMultipleImages(uploads);
    const endTime = Date.now();
    
    expect(result.totalUploads).toBe(3);
    expect(result.successfulUploads).toBe(3);
    expect(result.failedUploads).toBe(0);
    
    // Should be faster than sequential uploads
    expect(endTime - startTime).toBeLessThan(sequentialUploadTime * 0.7);
  });
  
  it('should handle partial batch failures', async () => {
    const uploads = [
      { cardId: 'card-1', file: createMockPngFile() }, // Valid
      { cardId: 'card-2', file: createInvalidFile() }, // Invalid
      { cardId: 'card-3', file: createMockPngFile() }  // Valid
    ];
    
    const result = await service.uploadMultipleImages(uploads);
    
    expect(result.totalUploads).toBe(3);
    expect(result.successfulUploads).toBe(2);
    expect(result.failedUploads).toBe(1);
    
    const failedResult = result.results.find(r => !r.success);
    expect(failedResult?.error).toBeDefined();
  });
});
```

## Error Handling

```typescript
enum ImageUploadError {
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
  COMPRESSION_FAILED = 'COMPRESSION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UPLOAD_CANCELLED = 'UPLOAD_CANCELLED',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  CARD_NOT_FOUND = 'CARD_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

class ImageUploadException extends Error {
  constructor(
    public code: ImageUploadError,
    message: string,
    public retryable: boolean = false,
    public context?: any
  ) {
    super(message);
  }
}
```

## Performance Requirements

- **File validation**: Complete in <50ms for files up to 5MB
- **Image preview generation**: <200ms for any supported file
- **Upload progress updates**: At least every 100ms during upload
- **Compression**: Reduce file size by 30-60% while maintaining quality
- **Concurrent uploads**: Handle up to 5 simultaneous uploads
- **Memory usage**: <20MB per active upload

## Configuration

```typescript
interface ImageUploadConfig {
  maxFileSize: number; // 5MB default
  allowedFormats: string[]; // ['image/png'] default
  minDimensions: { width: number; height: number };
  maxDimensions: { width: number; height: number };
  compressionQuality: number; // 0.8 default
  uploadTimeout: number; // 30000ms default
  retryAttempts: number; // 3 default
  chunkSize: number; // for large file uploads
}
```

---
*Service contract for ImageUploadService - Ready for implementation*