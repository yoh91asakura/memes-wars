/**
 * CardLogger - Structured logging service for card management operations
 * 
 * This service provides comprehensive logging for upload progress, sync status,
 * performance metrics, and user actions with proper structured format.
 */

export interface LogEntry {
  id: string
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  category: 'upload' | 'sync' | 'cache' | 'performance' | 'user_action' | 'system'
  operation: string
  message: string
  data?: Record<string, any>
  context: {
    playerId?: string
    cardId?: string
    sessionId: string
    userAgent: string
    url: string
    componentPath?: string
  }
  performance?: {
    startTime: number
    endTime?: number
    duration?: number
    memoryUsage?: number
  }
  correlationId?: string
  tags?: string[]
}

export interface UploadProgressLog extends LogEntry {
  category: 'upload'
  data: {
    uploadId: string
    filename: string
    fileSize: number
    loaded: number
    percentage: number
    speed: number
    estimatedTimeRemaining: number
    stage: 'validating' | 'uploading' | 'processing' | 'completed' | 'failed'
    retryAttempt?: number
  }
}

export interface SyncStatusLog extends LogEntry {
  category: 'sync'
  data: {
    syncId: string
    entityType: 'card' | 'collection' | 'filter' | 'image'
    entityId: string
    status: 'pending' | 'syncing' | 'completed' | 'failed' | 'conflict'
    itemsProcessed: number
    totalItems: number
    conflicts: number
    errors: string[]
    syncDirection: 'upload' | 'download' | 'bidirectional'
  }
}

export interface PerformanceLog extends LogEntry {
  category: 'performance'
  data: {
    operationType: string
    itemCount: number
    executionTime: number
    memoryBefore: number
    memoryAfter: number
    cacheHits: number
    cacheMisses: number
    networkRequests: number
    renderTime?: number
    bundleSize?: number
  }
}

export interface UserActionLog extends LogEntry {
  category: 'user_action'
  data: {
    action: string
    target: string
    value?: any
    coordinates?: { x: number; y: number }
    keyboardShortcut?: boolean
    touchGesture?: boolean
  }
}

export interface LogFilter {
  levels?: LogEntry['level'][]
  categories?: LogEntry['category'][]
  operations?: string[]
  playerId?: string
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  correlationId?: string
}

export interface LogMetrics {
  totalLogs: number
  byLevel: Record<LogEntry['level'], number>
  byCategory: Record<LogEntry['category'], number>
  errorRate: number
  avgPerformance: Record<string, number>
  topOperations: Array<{ operation: string; count: number }>
  recentErrors: LogEntry[]
}

class CardLogger {
  private logs: LogEntry[] = []
  private sessionId: string
  private maxLogs = 1000
  private logSubscribers = new Set<(log: LogEntry) => void>()
  private performanceObserver?: PerformanceObserver
  private memoryTrackingEnabled = 'memory' in performance

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializePerformanceTracking()
    this.startMemoryTracking()
  }

  /**
   * Initialize performance tracking
   */
  private initializePerformanceTracking(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.name.includes('card-')) {
            this.logPerformanceEntry(entry)
          }
        })
      })

      try {
        this.performanceObserver.observe({ entryTypes: ['measure', 'mark'] })
      } catch (error) {
        console.warn('Performance observer not supported:', error)
      }
    }
  }

  /**
   * Start memory usage tracking
   */
  private startMemoryTracking(): void {
    if (this.memoryTrackingEnabled) {
      setInterval(() => {
        this.logMemoryUsage()
      }, 30000) // Log memory usage every 30 seconds
    }
  }

  /**
   * Core logging methods
   */
  public debug(
    category: LogEntry['category'],
    operation: string,
    message: string,
    data?: Record<string, any>,
    context?: Partial<LogEntry['context']>
  ): void {
    this.log('debug', category, operation, message, data, context)
  }

  public info(
    category: LogEntry['category'],
    operation: string,
    message: string,
    data?: Record<string, any>,
    context?: Partial<LogEntry['context']>
  ): void {
    this.log('info', category, operation, message, data, context)
  }

  public warn(
    category: LogEntry['category'],
    operation: string,
    message: string,
    data?: Record<string, any>,
    context?: Partial<LogEntry['context']>
  ): void {
    this.log('warn', category, operation, message, data, context)
  }

  public error(
    category: LogEntry['category'],
    operation: string,
    message: string,
    data?: Record<string, any>,
    context?: Partial<LogEntry['context']>
  ): void {
    this.log('error', category, operation, message, data, context)
  }

  /**
   * Specialized logging methods
   */
  public logUploadProgress(
    uploadId: string,
    filename: string,
    fileSize: number,
    loaded: number,
    stage: UploadProgressLog['data']['stage'],
    context: Partial<LogEntry['context']> = {}
  ): void {
    const percentage = (loaded / fileSize) * 100
    const speed = this.calculateUploadSpeed(uploadId, loaded)
    const estimatedTimeRemaining = this.calculateETA(speed, fileSize - loaded)

    const logData: UploadProgressLog['data'] = {
      uploadId,
      filename,
      fileSize,
      loaded,
      percentage,
      speed,
      estimatedTimeRemaining,
      stage
    }

    this.log('info', 'upload', `upload_progress_${stage}`, 
      `Upload ${stage}: ${filename} (${percentage.toFixed(1)}%)`, 
      logData, 
      context, 
      ['upload', 'progress', stage]
    )
  }

  public logSyncStatus(
    syncId: string,
    entityType: SyncStatusLog['data']['entityType'],
    entityId: string,
    status: SyncStatusLog['data']['status'],
    itemsProcessed: number,
    totalItems: number,
    syncDirection: SyncStatusLog['data']['syncDirection'] = 'bidirectional',
    context: Partial<LogEntry['context']> = {}
  ): void {
    const logData: SyncStatusLog['data'] = {
      syncId,
      entityType,
      entityId,
      status,
      itemsProcessed,
      totalItems,
      conflicts: 0,
      errors: [],
      syncDirection
    }

    this.log('info', 'sync', `sync_${status}`,
      `Sync ${status}: ${entityType} ${entityId} (${itemsProcessed}/${totalItems})`,
      logData,
      context,
      ['sync', status, entityType]
    )
  }

  public logPerformanceMetrics(
    operation: string,
    duration: number,
    itemCount: number,
    additionalMetrics: Partial<PerformanceLog['data']> = {},
    context: Partial<LogEntry['context']> = {}
  ): void {
    const memoryUsage = this.getCurrentMemoryUsage()
    
    const logData: PerformanceLog['data'] = {
      operationType: operation,
      itemCount,
      executionTime: duration,
      memoryBefore: memoryUsage.usedJSHeapSize,
      memoryAfter: memoryUsage.usedJSHeapSize,
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      ...additionalMetrics
    }

    const level = duration > 5000 ? 'warn' : duration > 2000 ? 'info' : 'debug'
    
    this.log(level, 'performance', `perf_${operation}`,
      `Performance: ${operation} took ${duration}ms for ${itemCount} items`,
      logData,
      context,
      ['performance', operation]
    )
  }

  public logUserAction(
    action: string,
    target: string,
    value?: any,
    coordinates?: { x: number; y: number },
    context: Partial<LogEntry['context']> = {}
  ): void {
    const logData: UserActionLog['data'] = {
      action,
      target,
      value,
      coordinates,
      keyboardShortcut: this.wasKeyboardTriggered(),
      touchGesture: this.wasTouchTriggered()
    }

    this.log('debug', 'user_action', `user_${action}`,
      `User ${action}: ${target}${value ? ` = ${value}` : ''}`,
      logData,
      context,
      ['user_action', action]
    )
  }

  public logCacheOperation(
    operation: 'hit' | 'miss' | 'set' | 'evict' | 'clear',
    cacheKey: string,
    data?: Record<string, any>,
    context: Partial<LogEntry['context']> = {}
  ): void {
    this.log('debug', 'cache', `cache_${operation}`,
      `Cache ${operation}: ${cacheKey}`,
      { cacheKey, operation, ...data },
      context,
      ['cache', operation]
    )
  }

  /**
   * Core log method
   */
  private log(
    level: LogEntry['level'],
    category: LogEntry['category'],
    operation: string,
    message: string,
    data?: Record<string, any>,
    context?: Partial<LogEntry['context']>,
    tags?: string[]
  ): void {
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      category,
      operation,
      message,
      data,
      context: {
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      },
      tags
    }

    // Add performance data if available
    if (performance.now) {
      logEntry.performance = {
        startTime: performance.now(),
        memoryUsage: this.getCurrentMemoryUsage().usedJSHeapSize
      }
    }

    this.addLog(logEntry)
    this.notifySubscribers(logEntry)
    this.consoleLog(logEntry)
  }

  /**
   * Add log to storage with rotation
   */
  private addLog(log: LogEntry): void {
    this.logs.push(log)
    
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs + Math.floor(this.maxLogs * 0.1))
    }
  }

  /**
   * Console logging with proper formatting
   */
  private consoleLog(log: LogEntry): void {
    const prefix = `[${log.level.toUpperCase()}:${log.category}]`
    const context = log.context.playerId ? ` (${log.context.playerId})` : ''
    const message = `${prefix} ${log.operation}${context}: ${log.message}`
    
    switch (log.level) {
      case 'debug':
        console.debug(message, log.data)
        break
      case 'info':
        console.info(message, log.data)
        break
      case 'warn':
        console.warn(message, log.data)
        break
      case 'error':
        console.error(message, log.data, log.context)
        break
    }
  }

  /**
   * Helper methods
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateLogId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getCurrentMemoryUsage(): { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } {
    if ('memory' in performance) {
      return (performance as any).memory
    }
    return { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 }
  }

  private calculateUploadSpeed(uploadId: string, currentLoaded: number): number {
    // This would typically track upload start time and calculate bytes/second
    // For now, return a mock value
    return currentLoaded / 1000 // bytes per millisecond
  }

  private calculateETA(speed: number, remaining: number): number {
    if (speed === 0) return 0
    return remaining / speed
  }

  private wasKeyboardTriggered(): boolean {
    // Check if last event was keyboard
    return document.activeElement?.tagName !== 'BUTTON'
  }

  private wasTouchTriggered(): boolean {
    // Check if last event was touch
    return 'ontouchstart' in window && window.innerWidth <= 768
  }

  private logPerformanceEntry(entry: PerformanceEntry): void {
    this.logPerformanceMetrics(
      entry.name,
      entry.duration,
      1,
      {
        renderTime: entry.duration,
        operationType: 'performance_api'
      }
    )
  }

  private logMemoryUsage(): void {
    const memory = this.getCurrentMemoryUsage()
    
    this.log('debug', 'system', 'memory_usage',
      `Memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      },
      {},
      ['system', 'memory']
    )
  }

  private notifySubscribers(log: LogEntry): void {
    this.logSubscribers.forEach(subscriber => {
      try {
        subscriber(log)
      } catch (error) {
        console.warn('Log subscriber error:', error)
      }
    })
  }

  /**
   * Query and analysis methods
   */
  public getLogs(filter?: LogFilter): LogEntry[] {
    let filteredLogs = this.logs

    if (filter) {
      if (filter.levels) {
        filteredLogs = filteredLogs.filter(log => filter.levels!.includes(log.level))
      }
      
      if (filter.categories) {
        filteredLogs = filteredLogs.filter(log => filter.categories!.includes(log.category))
      }
      
      if (filter.operations) {
        filteredLogs = filteredLogs.filter(log => 
          filter.operations!.some(op => log.operation.includes(op))
        )
      }
      
      if (filter.playerId) {
        filteredLogs = filteredLogs.filter(log => log.context.playerId === filter.playerId)
      }
      
      if (filter.dateRange) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp >= filter.dateRange!.start && 
          log.timestamp <= filter.dateRange!.end
        )
      }
      
      if (filter.tags) {
        filteredLogs = filteredLogs.filter(log => 
          log.tags?.some(tag => filter.tags!.includes(tag))
        )
      }
      
      if (filter.correlationId) {
        filteredLogs = filteredLogs.filter(log => log.correlationId === filter.correlationId)
      }
    }

    return filteredLogs
  }

  public getMetrics(filter?: LogFilter): LogMetrics {
    const logs = this.getLogs(filter)
    
    const metrics: LogMetrics = {
      totalLogs: logs.length,
      byLevel: { debug: 0, info: 0, warn: 0, error: 0 },
      byCategory: { upload: 0, sync: 0, cache: 0, performance: 0, user_action: 0, system: 0 },
      errorRate: 0,
      avgPerformance: {},
      topOperations: [],
      recentErrors: []
    }

    const operationCounts: Record<string, number> = {}
    const performanceByOperation: Record<string, number[]> = {}

    logs.forEach(log => {
      // Count by level
      metrics.byLevel[log.level]++
      
      // Count by category
      metrics.byCategory[log.category]++
      
      // Count operations
      operationCounts[log.operation] = (operationCounts[log.operation] || 0) + 1
      
      // Collect performance data
      if (log.category === 'performance' && log.data?.executionTime) {
        if (!performanceByOperation[log.operation]) {
          performanceByOperation[log.operation] = []
        }
        performanceByOperation[log.operation].push(log.data.executionTime)
      }
      
      // Collect recent errors
      if (log.level === 'error' && metrics.recentErrors.length < 10) {
        metrics.recentErrors.push(log)
      }
    })

    // Calculate error rate
    metrics.errorRate = logs.length > 0 ? (metrics.byLevel.error / logs.length) * 100 : 0

    // Calculate average performance
    Object.entries(performanceByOperation).forEach(([operation, times]) => {
      metrics.avgPerformance[operation] = times.reduce((sum, time) => sum + time, 0) / times.length
    })

    // Top operations
    metrics.topOperations = Object.entries(operationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([operation, count]) => ({ operation, count }))

    return metrics
  }

  /**
   * Public API
   */
  public subscribeToLogs(callback: (log: LogEntry) => void): () => void {
    this.logSubscribers.add(callback)
    return () => this.logSubscribers.delete(callback)
  }

  public exportLogs(filter?: LogFilter): string {
    const logs = this.getLogs(filter)
    return JSON.stringify(logs, null, 2)
  }

  public clearLogs(): void {
    this.logs = []
  }

  public setMaxLogs(max: number): void {
    this.maxLogs = max
    if (this.logs.length > max) {
      this.logs = this.logs.slice(-max)
    }
  }

  public startOperation(operation: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      this.logPerformanceMetrics(operation, duration, 1)
    }
  }

  public groupLogs(correlationId: string): {
    addLog: (level: LogEntry['level'], category: LogEntry['category'], operation: string, message: string, data?: any) => void
    getLogs: () => LogEntry[]
  } {
    return {
      addLog: (level, category, operation, message, data) => {
        this.log(level, category, operation, message, data, {}, undefined)
        this.logs[this.logs.length - 1].correlationId = correlationId
      },
      getLogs: () => this.getLogs({ correlationId })
    }
  }

  public getSessionId(): string {
    return this.sessionId
  }
}

export const cardLogger = new CardLogger()
export default CardLogger