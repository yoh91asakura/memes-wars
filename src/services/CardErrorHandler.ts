/**
 * CardErrorHandler - Global error handling for card management operations
 * 
 * This service provides centralized error handling, logging, user-friendly messages,
 * and recovery strategies for all card management related operations.
 */

export interface CardError {
  id: string
  type: 'network' | 'validation' | 'permission' | 'storage' | 'sync' | 'upload' | 'unknown'
  category: 'recoverable' | 'user_action_required' | 'critical'
  operation: string
  message: string
  userMessage: string
  originalError?: Error
  context: {
    playerId?: string
    cardId?: string
    collectionId?: string
    imageId?: string
    filterId?: string
    timestamp: Date
    userAgent: string
    url: string
  }
  retryable: boolean
  retryAttempts?: number
  maxRetries?: number
  stackTrace?: string
  metadata?: Record<string, any>
}

export interface ErrorRecoveryOptions {
  retryDelay?: number
  exponentialBackoff?: boolean
  maxRetries?: number
  fallbackStrategy?: 'offline' | 'cache' | 'default' | 'skip'
  notifyUser?: boolean
  logError?: boolean
}

export interface UserNotification {
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  actions?: Array<{
    label: string
    action: () => void
    primary?: boolean
  }>
  dismissible: boolean
  autoHide?: boolean
  duration?: number
}

class CardErrorHandler {
  private errorLog: CardError[] = []
  private errorSubscribers = new Set<(error: CardError) => void>()
  private notificationSubscribers = new Set<(notification: UserNotification) => void>()
  private recoveryStrategies = new Map<string, (error: CardError) => Promise<any>>()

  constructor() {
    // Register default recovery strategies
    this.registerRecoveryStrategy('network_timeout', this.handleNetworkTimeout.bind(this))
    this.registerRecoveryStrategy('storage_quota_exceeded', this.handleStorageQuotaExceeded.bind(this))
    this.registerRecoveryStrategy('sync_conflict', this.handleSyncConflict.bind(this))
    this.registerRecoveryStrategy('upload_failed', this.handleUploadFailed.bind(this))
    this.registerRecoveryStrategy('validation_failed', this.handleValidationFailed.bind(this))
    this.registerRecoveryStrategy('permission_denied', this.handlePermissionDenied.bind(this))
  }

  /**
   * Handle and process an error
   */
  async handleError(
    error: Error | CardError,
    context: Partial<CardError['context']>,
    operation: string,
    options: ErrorRecoveryOptions = {}
  ): Promise<{ recovered: boolean; result?: any; userAction?: UserNotification }> {
    let cardError: CardError

    if (this.isCardError(error)) {
      cardError = error
    } else {
      cardError = this.createCardError(error, context, operation)
    }

    // Log the error
    if (options.logError !== false) {
      this.logError(cardError)
    }

    // Notify subscribers
    this.notifyErrorSubscribers(cardError)

    // Attempt recovery
    const recovery = await this.attemptRecovery(cardError, options)

    // Notify user if needed
    if (options.notifyUser !== false || !recovery.recovered) {
      const notification = this.createUserNotification(cardError, recovery.recovered)
      this.notifyUserSubscribers(notification)
      
      return {
        recovered: recovery.recovered,
        result: recovery.result,
        userAction: notification
      }
    }

    return {
      recovered: recovery.recovered,
      result: recovery.result
    }
  }

  /**
   * Create a CardError from a regular Error
   */
  private createCardError(
    error: Error,
    context: Partial<CardError['context']>,
    operation: string
  ): CardError {
    const errorType = this.classifyError(error)
    const category = this.categorizeError(error, errorType)
    
    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: errorType,
      category,
      operation,
      message: error.message,
      userMessage: this.generateUserMessage(error, errorType),
      originalError: error,
      context: {
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      },
      retryable: this.isRetryableError(error, errorType),
      stackTrace: error.stack,
      metadata: this.extractErrorMetadata(error)
    }
  }

  /**
   * Classify error type
   */
  private classifyError(error: Error): CardError['type'] {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network'
    }
    
    if (message.includes('validation') || message.includes('invalid') || message.includes('format')) {
      return 'validation'
    }
    
    if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'permission'
    }
    
    if (message.includes('storage') || message.includes('quota') || message.includes('indexeddb')) {
      return 'storage'
    }
    
    if (message.includes('sync') || message.includes('conflict')) {
      return 'sync'
    }
    
    if (message.includes('upload') || message.includes('file')) {
      return 'upload'
    }
    
    return 'unknown'
  }

  /**
   * Categorize error severity
   */
  private categorizeError(error: Error, type: CardError['type']): CardError['category'] {
    switch (type) {
      case 'network':
        return 'recoverable'
      case 'storage':
        return 'user_action_required'
      case 'permission':
        return 'user_action_required'
      case 'sync':
        return 'recoverable'
      case 'upload':
        return 'recoverable'
      case 'validation':
        return 'user_action_required'
      default:
        return 'critical'
    }
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserMessage(error: Error, type: CardError['type']): string {
    switch (type) {
      case 'network':
        return 'Connection issue detected. Please check your internet connection and try again.'
      case 'validation':
        return 'The file or data provided is not valid. Please check the requirements and try again.'
      case 'permission':
        return 'You do not have permission to perform this action. Please contact support.'
      case 'storage':
        return 'Storage space is full. Please clear some space and try again.'
      case 'sync':
        return 'Sync conflict detected. Your changes may need to be reviewed.'
      case 'upload':
        return 'File upload failed. Please check your connection and try again.'
      default:
        return 'An unexpected error occurred. Please try again or contact support.'
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error, type: CardError['type']): boolean {
    const message = error.message.toLowerCase()
    
    // Non-retryable conditions
    if (message.includes('unauthorized') || 
        message.includes('forbidden') || 
        message.includes('invalid format') ||
        message.includes('validation failed')) {
      return false
    }
    
    // Retryable by type
    return ['network', 'storage', 'sync', 'upload'].includes(type)
  }

  /**
   * Attempt error recovery
   */
  private async attemptRecovery(
    error: CardError, 
    options: ErrorRecoveryOptions
  ): Promise<{ recovered: boolean; result?: any }> {
    if (!error.retryable && !this.hasRecoveryStrategy(error)) {
      return { recovered: false }
    }

    // Try registered recovery strategy first
    if (this.hasRecoveryStrategy(error)) {
      try {
        const result = await this.executeRecoveryStrategy(error)
        return { recovered: true, result }
      } catch (recoveryError) {
        console.warn('Recovery strategy failed:', recoveryError)
      }
    }

    // Try generic retry logic
    if (error.retryable && options.maxRetries && (error.retryAttempts || 0) < options.maxRetries) {
      const delay = this.calculateRetryDelay(error, options)
      await this.sleep(delay)
      
      error.retryAttempts = (error.retryAttempts || 0) + 1
      
      return { recovered: false } // Let the caller retry
    }

    return { recovered: false }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(error: CardError, options: ErrorRecoveryOptions): number {
    const baseDelay = options.retryDelay || 1000
    const attempts = error.retryAttempts || 0
    
    if (options.exponentialBackoff) {
      return baseDelay * Math.pow(2, attempts)
    }
    
    return baseDelay
  }

  /**
   * Recovery strategies
   */
  private async handleNetworkTimeout(error: CardError): Promise<any> {
    // Try to recover from network timeout by switching to offline mode
    console.log('Attempting network timeout recovery...')
    
    // Could trigger offline mode or use cached data
    return { strategy: 'offline_mode', fallback: true }
  }

  private async handleStorageQuotaExceeded(error: CardError): Promise<any> {
    console.log('Attempting storage quota recovery...')
    
    // Try to clear old cache data
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        const oldCaches = cacheNames.filter(name => name.includes('old') || name.includes('temp'))
        
        for (const cacheName of oldCaches) {
          await caches.delete(cacheName)
        }
        
        return { strategy: 'cache_cleanup', cleared: oldCaches.length }
      }
    } catch (cleanupError) {
      console.warn('Cache cleanup failed:', cleanupError)
    }
    
    return { strategy: 'user_action_required' }
  }

  private async handleSyncConflict(error: CardError): Promise<any> {
    console.log('Attempting sync conflict resolution...')
    
    // Auto-resolve simple conflicts
    return { strategy: 'conflict_resolution', resolution: 'merge' }
  }

  private async handleUploadFailed(error: CardError): Promise<any> {
    console.log('Attempting upload failure recovery...')
    
    // Could implement image compression or format conversion
    return { strategy: 'compress_and_retry' }
  }

  private async handleValidationFailed(error: CardError): Promise<any> {
    console.log('Validation failed - user action required')
    
    return { strategy: 'user_correction_needed' }
  }

  private async handlePermissionDenied(error: CardError): Promise<any> {
    console.log('Permission denied - redirecting to auth')
    
    return { strategy: 'authentication_required' }
  }

  /**
   * Create user notification
   */
  private createUserNotification(error: CardError, recovered: boolean): UserNotification {
    if (recovered) {
      return {
        type: 'success',
        title: 'Issue Resolved',
        message: 'The issue has been automatically resolved.',
        dismissible: true,
        autoHide: true,
        duration: 3000
      }
    }

    const actions: UserNotification['actions'] = []

    if (error.retryable) {
      actions.push({
        label: 'Retry',
        action: () => this.triggerRetry(error),
        primary: true
      })
    }

    if (error.type === 'sync') {
      actions.push({
        label: 'View Conflicts',
        action: () => this.openConflictResolver(error)
      })
    }

    if (error.type === 'storage') {
      actions.push({
        label: 'Clear Cache',
        action: () => this.clearCache()
      })
    }

    return {
      type: error.category === 'critical' ? 'error' : 'warning',
      title: this.getNotificationTitle(error),
      message: error.userMessage,
      actions,
      dismissible: true,
      autoHide: error.category !== 'critical',
      duration: error.category === 'critical' ? undefined : 8000
    }
  }

  /**
   * Helper methods
   */
  private isCardError(error: any): error is CardError {
    return error && typeof error === 'object' && error.id && error.type && error.context
  }

  private logError(error: CardError): void {
    this.errorLog.push(error)
    
    // Keep only last 100 errors to prevent memory bloat
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }
    
    console.error(`[CardError:${error.type}] ${error.operation}:`, {
      id: error.id,
      message: error.message,
      context: error.context,
      stack: error.stackTrace
    })
  }

  private notifyErrorSubscribers(error: CardError): void {
    this.errorSubscribers.forEach(subscriber => {
      try {
        subscriber(error)
      } catch (err) {
        console.warn('Error subscriber failed:', err)
      }
    })
  }

  private notifyUserSubscribers(notification: UserNotification): void {
    this.notificationSubscribers.forEach(subscriber => {
      try {
        subscriber(notification)
      } catch (err) {
        console.warn('Notification subscriber failed:', err)
      }
    })
  }

  private hasRecoveryStrategy(error: CardError): boolean {
    const key = `${error.type}_${error.operation}` || error.type
    return this.recoveryStrategies.has(key) || this.recoveryStrategies.has(error.type)
  }

  private async executeRecoveryStrategy(error: CardError): Promise<any> {
    const key = `${error.type}_${error.operation}` || error.type
    const strategy = this.recoveryStrategies.get(key) || this.recoveryStrategies.get(error.type)
    
    if (strategy) {
      return strategy(error)
    }
    
    throw new Error('No recovery strategy found')
  }

  private extractErrorMetadata(error: Error): Record<string, any> {
    const metadata: Record<string, any> = {}
    
    // Extract fetch-specific metadata
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      metadata.networkError = true
    }
    
    // Extract validation-specific metadata
    if (error.message.includes('validation')) {
      const matches = error.message.match(/field: (\w+)/)
      if (matches) {
        metadata.invalidField = matches[1]
      }
    }
    
    return metadata
  }

  private getNotificationTitle(error: CardError): string {
    switch (error.type) {
      case 'network':
        return 'Connection Problem'
      case 'validation':
        return 'Invalid Input'
      case 'permission':
        return 'Access Denied'
      case 'storage':
        return 'Storage Full'
      case 'sync':
        return 'Sync Conflict'
      case 'upload':
        return 'Upload Failed'
      default:
        return 'Error Occurred'
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private triggerRetry(error: CardError): void {
    console.log('Retry triggered for error:', error.id)
    // This would trigger a retry in the calling code
  }

  private openConflictResolver(error: CardError): void {
    console.log('Opening conflict resolver for error:', error.id)
    // This would open a conflict resolution UI
  }

  private async clearCache(): Promise<void> {
    console.log('Clearing cache...')
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName)
        }
      }
      
      // Clear IndexedDB cache as well
      if ('indexedDB' in window) {
        // This would clear card management caches
      }
    } catch (err) {
      console.warn('Cache clear failed:', err)
    }
  }

  /**
   * Public API
   */

  public registerRecoveryStrategy(
    key: string, 
    strategy: (error: CardError) => Promise<any>
  ): void {
    this.recoveryStrategies.set(key, strategy)
  }

  public subscribeToErrors(callback: (error: CardError) => void): () => void {
    this.errorSubscribers.add(callback)
    return () => this.errorSubscribers.delete(callback)
  }

  public subscribeToNotifications(
    callback: (notification: UserNotification) => void
  ): () => void {
    this.notificationSubscribers.add(callback)
    return () => this.notificationSubscribers.delete(callback)
  }

  public getErrorHistory(): CardError[] {
    return [...this.errorLog]
  }

  public getErrorStats(): {
    total: number
    byType: Record<string, number>
    byCategory: Record<string, number>
    recoverable: number
  } {
    const stats = {
      total: this.errorLog.length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      recoverable: 0
    }

    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1
      
      if (error.retryable) {
        stats.recoverable++
      }
    })

    return stats
  }

  public clearErrorHistory(): void {
    this.errorLog = []
  }
}

export const cardErrorHandler = new CardErrorHandler()
export default CardErrorHandler