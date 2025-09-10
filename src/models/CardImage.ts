/**
 * CardImage Model with Validation Metadata
 * 
 * This model represents custom card images with comprehensive
 * metadata, validation results, and processing information.
 */

export interface ImageDimensions {
  width: number
  height: number
  aspectRatio?: number
}

export interface ImageVariant {
  name: string
  url: string
  dimensions: ImageDimensions
  fileSize: number
  format: string
  quality?: number
  optimized: boolean
}

export interface ImageProcessingResult {
  success: boolean
  processingTime: number
  operations: Array<{
    type: 'resize' | 'compress' | 'format_convert' | 'optimize'
    startTime: string
    duration: number
    inputSize: number
    outputSize: number
    settings?: Record<string, any>
  }>
  errors?: string[]
  warnings?: string[]
}

export interface ImageValidationResult {
  valid: boolean
  fileType: string
  fileSize: number
  dimensions: ImageDimensions
  errors: string[]
  warnings: string[]
  securityScan: {
    passed: boolean
    threats: string[]
    scanTime: number
  }
  metadata?: {
    colorDepth: number
    hasTransparency: boolean
    compressionType?: string
    createdAt?: string
    colorType?: string
    interlaced?: boolean
  }
}

export interface ImageUploadProgress {
  stage: 'validating' | 'uploading' | 'processing' | 'optimizing' | 'completed'
  percentage: number
  loaded: number
  total: number
  speed?: number // bytes per second
  estimatedTimeRemaining?: number // seconds
  currentOperation?: string
}

export interface ImageVersion {
  version: number
  imageId: string
  url: string
  uploadedAt: string
  archived: boolean
  reason?: string
  metadata: {
    fileSize: number
    dimensions: ImageDimensions
    contentHash: string
  }
}

export interface CardImage {
  // Identity
  id: string
  cardId: string
  playerId: string
  
  // File information
  originalFilename: string
  contentType: string
  fileSize: number
  contentHash: string
  
  // URLs
  url: string
  thumbnailUrl: string
  
  // Dimensions and quality
  dimensions: ImageDimensions
  variants: Record<string, ImageVariant>
  
  // Upload metadata
  uploadedAt: string
  uploadedBy: string
  uploadSource: 'web' | 'mobile' | 'api'
  
  // Validation results
  validationResult: ImageValidationResult
  
  // Processing results
  processingResult: ImageProcessingResult
  
  // Version control
  version: number
  previousVersions: ImageVersion[]
  
  // Status
  status: 'pending' | 'processing' | 'ready' | 'failed' | 'deleted'
  
  // Usage tracking
  viewCount: number
  lastAccessed?: string
  
  // Moderation
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged'
  moderationReason?: string
  moderatedAt?: string
  moderatedBy?: string
  
  // Metadata
  tags: string[]
  description?: string
  attribution?: string
  
  // Storage
  storageProvider: 'local' | 'cdn' | 's3' | 'cloudinary'
  storagePath: string
  cdnUrl?: string
  
  // Expiry and cleanup
  expiresAt?: string
  autoDeleteAt?: string
  
  // Performance
  cacheControl: string
  etag: string
}

/**
 * Image Factory Functions
 */
export class ImageFactory {
  /**
   * Create new image record from upload
   */
  static create(
    cardId: string,
    playerId: string,
    file: File,
    validationResult: ImageValidationResult,
    processingResult: ImageProcessingResult
  ): CardImage {
    const now = new Date().toISOString()
    const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return {
      id: imageId,
      cardId,
      playerId,
      originalFilename: file.name,
      contentType: file.type,
      fileSize: file.size,
      contentHash: this.generateContentHash(file),
      url: '', // Will be set after upload
      thumbnailUrl: '', // Will be set after processing
      dimensions: validationResult.dimensions,
      variants: {},
      uploadedAt: now,
      uploadedBy: playerId,
      uploadSource: 'web',
      validationResult,
      processingResult,
      version: 1,
      previousVersions: [],
      status: 'pending',
      viewCount: 0,
      moderationStatus: 'pending',
      tags: [],
      storageProvider: 'local',
      storagePath: '',
      cacheControl: 'public, max-age=31536000',
      etag: this.generateETag(imageId, now)
    }
  }

  /**
   * Create image with variants after processing
   */
  static withVariants(image: CardImage, variants: Record<string, ImageVariant>): CardImage {
    return {
      ...image,
      variants,
      thumbnailUrl: variants.thumbnail?.url || image.thumbnailUrl,
      status: 'ready',
      processingResult: {
        ...image.processingResult,
        success: true
      }
    }
  }

  /**
   * Create new version of existing image
   */
  static createVersion(
    existingImage: CardImage,
    newFile: File,
    validationResult: ImageValidationResult,
    processingResult: ImageProcessingResult
  ): CardImage {
    const now = new Date().toISOString()
    
    // Archive current version
    const archivedVersion: ImageVersion = {
      version: existingImage.version,
      imageId: existingImage.id,
      url: existingImage.url,
      uploadedAt: existingImage.uploadedAt,
      archived: true,
      reason: 'replaced',
      metadata: {
        fileSize: existingImage.fileSize,
        dimensions: existingImage.dimensions,
        contentHash: existingImage.contentHash
      }
    }

    return {
      ...existingImage,
      originalFilename: newFile.name,
      contentType: newFile.type,
      fileSize: newFile.size,
      contentHash: this.generateContentHash(newFile),
      dimensions: validationResult.dimensions,
      variants: {}, // Will be populated during processing
      uploadedAt: now,
      validationResult,
      processingResult,
      version: existingImage.version + 1,
      previousVersions: [...existingImage.previousVersions, archivedVersion],
      status: 'pending',
      moderationStatus: 'pending',
      etag: this.generateETag(existingImage.id, now)
    }
  }

  /**
   * Generate content hash (placeholder - would use actual hashing)
   */
  private static generateContentHash(file: File): string {
    return `hash-${file.size}-${file.lastModified}-${file.name.length}`
  }

  /**
   * Generate ETag for caching
   */
  private static generateETag(imageId: string, timestamp: string): string {
    return `"${imageId}-${Date.parse(timestamp)}"`
  }
}

/**
 * Image Validation Functions
 */
export class ImageValidator {
  /**
   * Validate image file before upload
   */
  static async validate(file: File): Promise<ImageValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Basic file validation
    if (!this.isPNGFile(file)) {
      errors.push('File must be PNG format')
    }
    
    // Size validation
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`)
    }
    
    if (file.size < 1024) {
      errors.push('File is too small to be a valid image')
    }
    
    // Get dimensions (would use actual image processing library)
    const dimensions = await this.getDimensions(file)
    
    // Dimension validation
    const minDimension = 64
    const maxDimension = 2048
    
    if (dimensions.width < minDimension || dimensions.height < minDimension) {
      errors.push(`Image dimensions must be at least ${minDimension}x${minDimension}`)
    }
    
    if (dimensions.width > maxDimension || dimensions.height > maxDimension) {
      errors.push(`Image dimensions cannot exceed ${maxDimension}x${maxDimension}`)
    }
    
    // Aspect ratio validation
    const aspectRatio = dimensions.width / dimensions.height
    if (aspectRatio < 0.5 || aspectRatio > 2.0) {
      warnings.push('Image aspect ratio is unusual for card artwork')
    }
    
    // Security scan (placeholder)
    const securityScan = await this.performSecurityScan(file)
    
    // Extract metadata (placeholder)
    const metadata = await this.extractMetadata(file)
    
    return {
      valid: errors.length === 0,
      fileType: file.type,
      fileSize: file.size,
      dimensions,
      errors,
      warnings,
      securityScan,
      metadata
    }
  }

  /**
   * Check if file is PNG format
   */
  private static isPNGFile(file: File): boolean {
    return file.type === 'image/png' && file.name.toLowerCase().endsWith('.png')
  }

  /**
   * Get image dimensions (placeholder implementation)
   */
  private static async getDimensions(file: File): Promise<ImageDimensions> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight
        })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({ width: 0, height: 0, aspectRatio: 0 })
      }
      
      img.src = url
    })
  }

  /**
   * Perform security scan (placeholder)
   */
  private static async performSecurityScan(file: File): Promise<{
    passed: boolean
    threats: string[]
    scanTime: number
  }> {
    const startTime = performance.now()
    
    // Placeholder security checks
    const threats: string[] = []
    
    // Check file content for suspicious patterns
    const arrayBuffer = await file.arrayBuffer()
    const content = new Uint8Array(arrayBuffer)
    
    // Look for suspicious patterns (very basic example)
    const suspiciousPatterns = [
      new TextEncoder().encode('<script'),
      new TextEncoder().encode('javascript:'),
      new TextEncoder().encode('data:text/html')
    ]
    
    for (const pattern of suspiciousPatterns) {
      if (this.containsPattern(content, pattern)) {
        threats.push('Suspicious script content detected')
        break
      }
    }
    
    const scanTime = performance.now() - startTime
    
    return {
      passed: threats.length === 0,
      threats,
      scanTime
    }
  }

  /**
   * Extract image metadata (placeholder)
   */
  private static async extractMetadata(file: File) {
    // This would use a proper image processing library
    return {
      colorDepth: 24,
      hasTransparency: true,
      compressionType: 'deflate',
      createdAt: new Date().toISOString(),
      colorType: 'truecolor',
      interlaced: false
    }
  }

  /**
   * Check if byte array contains pattern
   */
  private static containsPattern(content: Uint8Array, pattern: Uint8Array): boolean {
    for (let i = 0; i <= content.length - pattern.length; i++) {
      let matches = true
      for (let j = 0; j < pattern.length; j++) {
        if (content[i + j] !== pattern[j]) {
          matches = false
          break
        }
      }
      if (matches) return true
    }
    return false
  }
}

/**
 * Image Processing Functions
 */
export class ImageProcessor {
  /**
   * Process image to generate variants
   */
  static async process(image: CardImage): Promise<{
    variants: Record<string, ImageVariant>
    processingResult: ImageProcessingResult
  }> {
    const startTime = performance.now()
    const operations: ImageProcessingResult['operations'] = []
    
    try {
      // Generate thumbnail
      const thumbnail = await this.generateVariant(image, 'thumbnail', 64, 64, 80)
      operations.push(...thumbnail.operations)
      
      // Generate small variant
      const small = await this.generateVariant(image, 'small', 128, 128, 85)
      operations.push(...small.operations)
      
      // Generate medium variant
      const medium = await this.generateVariant(image, 'medium', 256, 256, 90)
      operations.push(...medium.operations)
      
      // Generate large variant
      const large = await this.generateVariant(image, 'large', 512, 512, 95)
      operations.push(...large.operations)
      
      // Generate WebP variant if requested
      const webp = await this.generateWebPVariant(image)
      if (webp) {
        operations.push(...webp.operations)
      }
      
      const variants: Record<string, ImageVariant> = {
        thumbnail: thumbnail.variant,
        small: small.variant,
        medium: medium.variant,
        large: large.variant
      }
      
      if (webp) {
        variants.webp = webp.variant
      }
      
      const processingTime = performance.now() - startTime
      
      return {
        variants,
        processingResult: {
          success: true,
          processingTime,
          operations
        }
      }
    } catch (error) {
      const processingTime = performance.now() - startTime
      
      return {
        variants: {},
        processingResult: {
          success: false,
          processingTime,
          operations,
          errors: [error instanceof Error ? error.message : 'Unknown processing error']
        }
      }
    }
  }

  /**
   * Generate image variant (placeholder implementation)
   */
  private static async generateVariant(
    image: CardImage,
    name: string,
    maxWidth: number,
    maxHeight: number,
    quality: number
  ): Promise<{
    variant: ImageVariant
    operations: ImageProcessingResult['operations']
  }> {
    const startTime = new Date().toISOString()
    const inputSize = image.fileSize
    
    // Calculate new dimensions maintaining aspect ratio
    const { width, height } = this.calculateDimensions(
      image.dimensions.width,
      image.dimensions.height,
      maxWidth,
      maxHeight
    )
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 50))
    
    const outputSize = Math.floor(inputSize * (width * height) / (image.dimensions.width * image.dimensions.height))
    const duration = 50
    
    const variant: ImageVariant = {
      name,
      url: `${image.url.replace('.png', '')}-${name}.png`,
      dimensions: { width, height, aspectRatio: width / height },
      fileSize: outputSize,
      format: 'png',
      quality,
      optimized: true
    }
    
    const operations: ImageProcessingResult['operations'] = [{
      type: 'resize',
      startTime,
      duration,
      inputSize,
      outputSize,
      settings: { width, height, quality }
    }]
    
    return { variant, operations }
  }

  /**
   * Generate WebP variant (placeholder)
   */
  private static async generateWebPVariant(image: CardImage): Promise<{
    variant: ImageVariant
    operations: ImageProcessingResult['operations']
  } | null> {
    // Check if WebP is supported/requested
    const generateWebP = true // Would be configurable
    
    if (!generateWebP) return null
    
    const startTime = new Date().toISOString()
    const inputSize = image.fileSize
    const outputSize = Math.floor(inputSize * 0.7) // WebP typically 30% smaller
    
    await new Promise(resolve => setTimeout(resolve, 30))
    
    const variant: ImageVariant = {
      name: 'webp',
      url: image.url.replace('.png', '.webp'),
      dimensions: image.dimensions,
      fileSize: outputSize,
      format: 'webp',
      quality: 90,
      optimized: true
    }
    
    const operations: ImageProcessingResult['operations'] = [{
      type: 'format_convert',
      startTime,
      duration: 30,
      inputSize,
      outputSize,
      settings: { format: 'webp', quality: 90 }
    }]
    
    return { variant, operations }
  }

  /**
   * Calculate new dimensions maintaining aspect ratio
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight
    
    let width = maxWidth
    let height = Math.round(width / aspectRatio)
    
    if (height > maxHeight) {
      height = maxHeight
      width = Math.round(height * aspectRatio)
    }
    
    return { width, height }
  }
}

/**
 * Image Utility Functions
 */
export class ImageUtils {
  /**
   * Get best image variant for display size
   */
  static getBestVariant(image: CardImage, displayWidth: number, displayHeight: number): ImageVariant | null {
    const variants = Object.values(image.variants)
    if (variants.length === 0) return null
    
    // Find the smallest variant that's still larger than the display size
    const suitableVariants = variants.filter(v => 
      v.dimensions.width >= displayWidth && v.dimensions.height >= displayHeight
    )
    
    if (suitableVariants.length > 0) {
      return suitableVariants.reduce((best, current) => 
        current.fileSize < best.fileSize ? current : best
      )
    }
    
    // If no variant is large enough, return the largest available
    return variants.reduce((best, current) => 
      current.dimensions.width > best.dimensions.width ? current : best
    )
  }

  /**
   * Check if image needs reprocessing
   */
  static needsReprocessing(image: CardImage): boolean {
    return (
      image.status === 'failed' ||
      Object.keys(image.variants).length === 0 ||
      !image.processingResult.success
    )
  }

  /**
   * Get image display URL with fallback
   */
  static getDisplayUrl(image: CardImage, variant?: string): string {
    if (variant && image.variants[variant]) {
      return image.variants[variant].url
    }
    
    if (image.thumbnailUrl) {
      return image.thumbnailUrl
    }
    
    return image.url
  }

  /**
   * Check if image is expired
   */
  static isExpired(image: CardImage): boolean {
    if (!image.expiresAt) return false
    return new Date(image.expiresAt) <= new Date()
  }

  /**
   * Calculate storage cost (for cleanup decisions)
   */
  static calculateStorageCost(image: CardImage): number {
    let totalSize = image.fileSize
    
    Object.values(image.variants).forEach(variant => {
      totalSize += variant.fileSize
    })
    
    image.previousVersions.forEach(version => {
      totalSize += version.metadata.fileSize
    })
    
    return totalSize
  }

  /**
   * Get human-readable file size
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  /**
   * Generate responsive image HTML
   */
  static generateResponsiveHtml(image: CardImage, alt: string): string {
    const variants = Object.values(image.variants).sort((a, b) => 
      a.dimensions.width - b.dimensions.width
    )
    
    if (variants.length === 0) {
      return `<img src="${image.url}" alt="${alt}" />`
    }
    
    const srcset = variants.map(variant => 
      `${variant.url} ${variant.dimensions.width}w`
    ).join(', ')
    
    const sizes = '(max-width: 128px) 64px, (max-width: 256px) 128px, (max-width: 512px) 256px, 512px'
    
    return `<img src="${variants[0].url}" srcset="${srcset}" sizes="${sizes}" alt="${alt}" />`
  }
}