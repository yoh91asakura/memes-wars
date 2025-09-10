/**
 * ImageUploadService - Service for custom card image management
 * 
 * This service handles image validation, upload, processing,
 * and management with progress tracking and error handling.
 */

import type { CardImage, ImageValidationResult, ImageUploadProgress } from '@/models/CardImage'
import { ImageValidator, ImageProcessor, ImageFactory } from '@/models/CardImage'
import { apiClient } from './BaseAPIClient'
import { CardUtils } from '../utils/cardUtils'
import { fileTypeFromBuffer } from 'file-type'

export interface UploadOptions {
  cardId: string
  playerId: string
  file: File
  onProgress?: (progress: ImageUploadProgress) => void
  signal?: AbortSignal
  replacePrevious?: boolean
  visibility?: 'public' | 'private'
  compress?: boolean
  quality?: number
  generateWebP?: boolean
  retryAttempts?: number
  retryDelay?: number
  metadata?: {
    source?: string
    tags?: string[]
    description?: string
  }
}

export interface UploadResult {
  success: boolean
  imageId: string
  imageUrl: string
  uploadedAt: string
  fileSize: number
  dimensions: {
    width: number
    height: number
  }
  processedVariants: Record<string, {
    url: string
    dimensions: { width: number; height: number }
    fileSize: number
  }>
  conflictResolution?: 'replaced' | 'versioned' | 'rejected'
  visibility: 'public' | 'private'
  compressionRatio?: number
  optimizationApplied: boolean
  qualitySettings?: {
    compression: number
  }
  metadata?: any
  contentHash: string
  uploadStats: {
    transferTime: number
    processingTime: number
    totalTime: number
  }
  attemptsMade: number
  cleanupPerformed?: boolean
}

export class ImageUploadService {
  private uploadQueue = new Map<string, Promise<UploadResult>>()
  
  /**
   * Validate image file before upload
   */
  async validateImageFile(file: File): Promise<ImageValidationResult> {
    if (!file) {
      throw new Error('Invalid file input')
    }
    
    try {
      const validationResult = await ImageValidator.validate(file)
      return validationResult
    } catch (error) {
      console.error('Image validation failed:', error)
      throw error
    }
  }
  
  /**
   * Upload and process custom card image
   */
  async uploadCardImage(options: UploadOptions): Promise<UploadResult> {
    const {
      cardId,
      playerId,
      file,
      onProgress,
      signal,
      replacePrevious = false,
      visibility = 'private',
      compress = false,
      quality = 90,
      generateWebP = false,
      retryAttempts = 3,
      retryDelay = 1000,
      metadata = {}
    } = options
    
    // Validate inputs using CardUtils
    CardUtils.Validation.validateCardId(cardId)
    CardUtils.Validation.validatePlayerId(playerId)
    CardUtils.Validation.validateImageFile(file)
    
    // Check for existing upload in progress
    const uploadKey = `${cardId}-${playerId}`
    if (this.uploadQueue.has(uploadKey)) {
      return this.uploadQueue.get(uploadKey)!
    }
    
    const uploadPromise = this.performUpload(options, retryAttempts)
    this.uploadQueue.set(uploadKey, uploadPromise)
    
    try {
      const result = await uploadPromise
      return result
    } finally {
      this.uploadQueue.delete(uploadKey)
    }
  }
  
  /**
   * Perform the actual upload with retry logic
   */
  private async performUpload(options: UploadOptions, attemptsLeft: number): Promise<UploadResult> {
    const startTime = performance.now()
    let transferTime = 0
    let processingTime = 0
    
    try {
      // Step 1: Validate the image
      this.reportProgress(options.onProgress, {
        stage: 'validating',
        percentage: 0,
        loaded: 0,
        total: options.file.size,
        currentOperation: 'Validating image format and content'
      })
      
      const validationResult = await this.validateImageFile(options.file)
      
      if (!validationResult.valid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`)
      }
      
      // Step 2: Check for conflicts if not replacing
      if (!options.replacePrevious) {
        await this.checkForConflicts(options.cardId, options.playerId)
      }
      
      // Step 3: Upload the file
      this.reportProgress(options.onProgress, {
        stage: 'uploading',
        percentage: 10,
        loaded: 0,
        total: options.file.size,
        currentOperation: 'Uploading image file'
      })
      
      const uploadStartTime = performance.now()
      const uploadResponse = await this.uploadFile(options)
      transferTime = performance.now() - uploadStartTime
      
      // Step 4: Process the image
      this.reportProgress(options.onProgress, {
        stage: 'processing',
        percentage: 70,
        loaded: options.file.size,
        total: options.file.size,
        currentOperation: 'Processing image variants'
      })
      
      const processingStartTime = performance.now()
      const processedImage = await this.processUploadedImage(uploadResponse, options)
      processingTime = performance.now() - processingStartTime
      
      // Step 5: Finalize
      this.reportProgress(options.onProgress, {
        stage: 'completed',
        percentage: 100,
        loaded: options.file.size,
        total: options.file.size,
        currentOperation: 'Upload complete'
      })
      
      const totalTime = performance.now() - startTime
      
      return {
        success: true,
        imageId: processedImage.id,
        imageUrl: processedImage.url,
        uploadedAt: processedImage.uploadedAt,
        fileSize: processedImage.fileSize,
        dimensions: processedImage.dimensions,
        processedVariants: this.formatVariants(processedImage.variants),
        visibility: options.visibility || 'private',
        compressionRatio: options.compress ? 0.8 : 1.0,
        optimizationApplied: options.compress || false,
        qualitySettings: options.compress ? { compression: options.quality || 90 } : undefined,
        metadata: options.metadata,
        contentHash: processedImage.contentHash,
        uploadStats: {
          transferTime,
          processingTime,
          totalTime
        },
        attemptsMade: (options.retryAttempts || 3) - attemptsLeft + 1
      }
      
    } catch (error) {
      if (options.signal?.aborted) {
        throw new Error('Upload cancelled')
      }
      
      // Retry logic
      if (attemptsLeft > 1 && !this.isNonRetryableError(error)) {
        console.warn(`Upload attempt failed, retrying... (${attemptsLeft - 1} attempts left)`)
        
        // Exponential backoff
        const delay = (options.retryDelay || 1000) * Math.pow(2, (options.retryAttempts || 3) - attemptsLeft)
        await this.sleep(delay)
        
        return this.performUpload(options, attemptsLeft - 1)
      }
      
      // Cleanup failed upload
      await this.cleanupFailedUpload(options.cardId, options.playerId)
      
      throw error
    }
  }
  
  /**
   * Upload file to server
   */
  private async uploadFile(options: UploadOptions): Promise<{
    imageId: string
    url: string
    uploadedAt: string
  }> {
    const formData = new FormData()
    formData.append('image', options.file)
    formData.append('cardId', options.cardId)
    formData.append('playerId', options.playerId)
    formData.append('visibility', options.visibility || 'private')
    formData.append('replacePrevious', options.replacePrevious?.toString() || 'false')
    
    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata))
    }
    
    // Use BaseAPIClient for upload with progress tracking
    const response = await apiClient.upload(
      `/cards/${options.cardId}/image`,
      formData,
      {
        timeout: 60000,
        signal: options.signal,
        onUploadProgress: (event) => {
          if (event.lengthComputable && options.onProgress) {
            const percentage = 10 + (event.loaded / event.total) * 60 // 10-70% for upload
            
            this.reportProgress(options.onProgress, {
              stage: 'uploading',
              percentage,
              loaded: event.loaded,
              total: event.total,
              speed: this.calculateSpeed(event.loaded, event.total),
              estimatedTimeRemaining: this.estimateTimeRemaining(event.loaded, event.total),
              currentOperation: 'Uploading to server'
            })
          }
        }
      }
    )
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Upload failed')
    }
    
    return response.data
  }
  
  /**
   * Process uploaded image to generate variants
   */
  private async processUploadedImage(
    uploadResponse: { imageId: string; url: string; uploadedAt: string },
    options: UploadOptions
  ): Promise<CardImage> {
    // Create image record
    const imageRecord = ImageFactory.create(
      options.cardId,
      options.playerId,
      options.file,
      await this.validateImageFile(options.file),
      { success: false, processingTime: 0, operations: [] }
    )
    
    // Update with server response
    imageRecord.id = uploadResponse.imageId
    imageRecord.url = uploadResponse.url
    imageRecord.uploadedAt = uploadResponse.uploadedAt
    
    // Process to generate variants
    const processingResult = await ImageProcessor.process(imageRecord)
    
    // Update image record with processing results
    const processedImage = ImageFactory.withVariants(imageRecord, processingResult.variants)
    processedImage.processingResult = processingResult.processingResult
    
    return processedImage
  }
  
  /**
   * Check for upload conflicts
   */
  private async checkForConflicts(cardId: string, playerId: string): Promise<void> {
    try {
      const response = await apiClient.get(`/cards/${cardId}/image?playerId=${playerId}`)
      
      if (response.success && response.data) {
        throw new Error('Card already has custom image. Use replacePrevious option to replace it.')
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('already has custom image')) {
        throw error
      }
      // 404 is expected when no image exists
    }
  }
  
  /**
   * Cleanup failed upload
   */
  private async cleanupFailedUpload(cardId: string, playerId: string): Promise<void> {
    try {
      await apiClient.post(`/cards/${cardId}/image/cleanup`, { cardId, playerId })
    } catch (error) {
      console.warn('Failed to cleanup after upload failure:', error)
    }
  }
  
  /**
   * Helper methods
   */
  
  private reportProgress(
    onProgress: ((progress: ImageUploadProgress) => void) | undefined,
    progress: ImageUploadProgress
  ): void {
    if (onProgress) {
      onProgress(progress)
    }
  }
  
  private calculateSpeed(loaded: number, total: number): number {
    // This is a simplified calculation
    // In a real implementation, you'd track time and calculate bytes/second
    return total > 0 ? (loaded / total) * 1000 : 0
  }
  
  private estimateTimeRemaining(loaded: number, total: number): number {
    // Simplified estimation
    if (loaded === 0) return 0
    const progress = loaded / total
    const elapsed = 1000 // Mock elapsed time
    return ((elapsed / progress) - elapsed) / 1000
  }
  
  private formatVariants(variants: Record<string, any>): Record<string, any> {
    const formatted: Record<string, any> = {}
    
    Object.entries(variants).forEach(([name, variant]) => {
      formatted[name] = {
        url: variant.url,
        dimensions: variant.dimensions,
        fileSize: variant.fileSize
      }
    })
    
    return formatted
  }
  
  private isNonRetryableError(error: any): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      return (
        message.includes('unauthorized') ||
        message.includes('forbidden') ||
        message.includes('validation failed') ||
        message.includes('file too large') ||
        message.includes('invalid format')
      )
    }
    return false
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  /**
   * Delete custom image
   */
  async deleteCardImage(cardId: string, playerId: string): Promise<{
    success: boolean
    deletedImageId: string
    deletedAt: string
    cascadeOperations: Array<{
      type: string
      status: string
    }>
  }> {
    const response = await apiClient.delete(`/cards/${cardId}/image?playerId=${playerId}`)
    
    if (!response.success) {
      if (response.error?.code === 'NOT_FOUND') {
        throw new Error('No custom image found for this card')
      }
      throw new Error(`Failed to delete image: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }
  
  /**
   * Get image metadata
   */
  async getImageMetadata(cardId: string, playerId: string): Promise<CardImage> {
    CardUtils.Validation.validateCardId(cardId)
    CardUtils.Validation.validatePlayerId(playerId)
    
    const response = await apiClient.get(`/cards/${cardId}/image?playerId=${playerId}`)
    
    if (!response.success) {
      if (response.error?.code === 'NOT_FOUND') {
        throw new Error('No custom image found for this card')
      }
      throw new Error(`Failed to get image metadata: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }
  
  /**
   * Update image metadata
   */
  async updateImageMetadata(
    imageId: string,
    metadata: {
      description?: string
      tags?: string[]
      visibility?: 'public' | 'private'
    }
  ): Promise<CardImage> {
    const response = await apiClient.patch(`/images/${imageId}/metadata`, metadata)
    
    if (!response.ok) {
      throw new Error(`Failed to update image metadata: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }
  
  /**
   * Get upload statistics
   */
  async getUploadStatistics(playerId: string): Promise<{
    totalUploads: number
    totalSize: number
    averageSize: number
    successRate: number
    mostCommonErrors: Array<{ error: string; count: number }>
  }> {
    CardUtils.Validation.validatePlayerId(playerId)
    
    const response = await apiClient.get(`/images/stats/${playerId}`)
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get upload statistics')
    }
    
    return response.json()
  }
}