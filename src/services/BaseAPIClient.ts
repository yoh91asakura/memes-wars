/**
 * BaseAPIClient - Common API client for card management services
 * 
 * This service provides a unified HTTP client with authentication,
 * error handling, retries, and logging for all card management APIs.
 */

import { cardErrorHandler } from './CardErrorHandler'
import { cardLogger } from './CardLogger'

export interface APIConfig {
  baseUrl?: string
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
}

export interface RequestOptions {
  timeout?: number
  retries?: number
  signal?: AbortSignal
  onUploadProgress?: (progress: ProgressEvent) => void
  headers?: Record<string, string>
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any[]
  }
  meta?: {
    timestamp: string
    requestId: string
    duration: number
  }
}

export class BaseAPIClient {
  private config: APIConfig
  private authToken: string | null = null

  constructor(config: APIConfig = {}) {
    this.config = {
      baseUrl: '/api',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    }

    // Initialize auth token
    this.authToken = this.getStoredAuthToken()
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token
    localStorage.setItem('auth_token', token)
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_token')
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<APIResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options)
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<APIResponse<T>> {
    return this.request<T>('POST', endpoint, data, options)
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<APIResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options)
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<APIResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options)
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<APIResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options)
  }

  /**
   * Upload file with progress tracking
   */
  async upload<T>(
    endpoint: string, 
    formData: FormData, 
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const startTime = performance.now()

      // Setup abort handling
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          xhr.abort()
          reject(new Error('Upload cancelled'))
        })
      }

      // Track upload progress
      if (options.onUploadProgress) {
        xhr.upload.addEventListener('progress', options.onUploadProgress)
      }

      xhr.addEventListener('load', () => {
        const duration = performance.now() - startTime

        try {
          const response = this.parseXHRResponse(xhr, duration)
          
          if (response.success) {
            resolve(response)
          } else {
            reject(new Error(response.error?.message || 'Upload failed'))
          }
        } catch (error) {
          reject(error)
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'))
      })

      xhr.open('POST', url)
      xhr.timeout = options.timeout || this.config.timeout || 60000

      // Set auth header
      if (this.authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.authToken}`)
      }

      // Set custom headers
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value)
        })
      }

      xhr.send(formData)
    })
  }

  /**
   * Core request method with retry logic and error handling
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`
    const requestId = this.generateRequestId()
    const startTime = performance.now()

    let lastError: Error | null = null
    const maxRetries = options.retries ?? this.config.retryAttempts ?? 3

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        cardLogger.debug('system', 'api_request', `${method} ${endpoint}`, {
          requestId,
          attempt: attempt + 1,
          maxRetries: maxRetries + 1
        })

        const response = await this.performRequest<T>(method, url, data, options, requestId)
        
        const duration = performance.now() - startTime
        cardLogger.info('system', 'api_response', `${method} ${endpoint} completed`, {
          requestId,
          status: response.success ? 'success' : 'error',
          duration,
          attempt: attempt + 1
        })

        return response

      } catch (error) {
        lastError = error as Error
        
        const duration = performance.now() - startTime
        cardLogger.warn('system', 'api_error', `${method} ${endpoint} failed`, {
          requestId,
          error: lastError.message,
          attempt: attempt + 1,
          duration
        })

        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError) || attempt === maxRetries) {
          break
        }

        // Wait before retry with exponential backoff
        const delay = (this.config.retryDelay || 1000) * Math.pow(2, attempt)
        await this.sleep(delay)
      }
    }

    // Handle final error
    if (lastError) {
      const errorResponse = await this.handleError(lastError, method, endpoint, requestId)
      return errorResponse
    }

    throw new Error('Request failed without error details')
  }

  /**
   * Perform the actual HTTP request
   */
  private async performRequest<T>(
    method: string,
    url: string,
    data: any,
    options: RequestOptions,
    requestId: string
  ): Promise<APIResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...options.headers
    }

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`
    }

    const config: RequestInit = {
      method,
      headers,
      signal: options.signal
    }

    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        // Don't set Content-Type for FormData, let browser set it with boundary
        delete headers['Content-Type']
        config.body = data
      } else {
        config.body = JSON.stringify(data)
      }
    }

    const response = await fetch(url, config)
    const duration = performance.now() - Date.now() // Approximate

    return this.parseResponse<T>(response, duration)
  }

  /**
   * Parse fetch response
   */
  private async parseResponse<T>(response: Response, duration: number): Promise<APIResponse<T>> {
    const text = await response.text()
    let parsedData: any

    try {
      parsedData = text ? JSON.parse(text) : {}
    } catch (error) {
      parsedData = { message: text }
    }

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: this.getErrorCode(response.status),
          message: parsedData.message || `HTTP ${response.status}: ${response.statusText}`,
          details: parsedData.details
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: response.headers.get('X-Request-ID') || '',
          duration
        }
      }
    }

    return {
      success: true,
      data: parsedData,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: response.headers.get('X-Request-ID') || '',
        duration
      }
    }
  }

  /**
   * Parse XMLHttpRequest response
   */
  private parseXHRResponse(xhr: XMLHttpRequest, duration: number): APIResponse {
    let parsedData: any

    try {
      parsedData = xhr.responseText ? JSON.parse(xhr.responseText) : {}
    } catch (error) {
      parsedData = { message: xhr.responseText }
    }

    if (xhr.status >= 200 && xhr.status < 300) {
      return {
        success: true,
        data: parsedData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: xhr.getResponseHeader('X-Request-ID') || '',
          duration
        }
      }
    } else {
      return {
        success: false,
        error: {
          code: this.getErrorCode(xhr.status),
          message: parsedData.message || `HTTP ${xhr.status}: ${xhr.statusText}`,
          details: parsedData.details
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: xhr.getResponseHeader('X-Request-ID') || '',
          duration
        }
      }
    }
  }

  /**
   * Handle errors with structured error handling
   */
  private async handleError(
    error: Error,
    method: string,
    endpoint: string,
    requestId: string
  ): Promise<APIResponse> {
    const context = {
      requestId,
      url: `${this.config.baseUrl}${endpoint}`,
      playerId: this.getCurrentPlayerId()
    }

    const result = await cardErrorHandler.handleError(
      error,
      context,
      `api_${method.toLowerCase()}_${endpoint.replace(/\//g, '_')}`,
      {
        retryAttempts: 0, // Already handled retries
        logError: true,
        notifyUser: false // Let caller decide on user notification
      }
    )

    return {
      success: false,
      error: {
        code: 'REQUEST_FAILED',
        message: error.message,
        details: [result]
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        duration: 0
      }
    }
  }

  /**
   * Helper methods
   */
  private getStoredAuthToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  }

  private getCurrentPlayerId(): string | undefined {
    // Get current player ID from auth token or app state
    try {
      if (this.authToken) {
        const payload = JSON.parse(atob(this.authToken.split('.')[1]))
        return payload.playerId
      }
    } catch (error) {
      // Invalid token format
    }
    return undefined
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getErrorCode(status: number): string {
    const statusCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      413: 'PAYLOAD_TOO_LARGE',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT'
    }
    return statusCodes[status] || 'UNKNOWN_ERROR'
  }

  private isNonRetryableError(error: Error): boolean {
    const nonRetryableMessages = [
      'unauthorized',
      'forbidden', 
      'validation',
      'bad request',
      'not found'
    ]

    const message = error.message.toLowerCase()
    return nonRetryableMessages.some(msg => message.includes(msg))
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: 'ok' | 'error'; timestamp: string }> {
    try {
      const response = await this.get('/health')
      return {
        status: response.success ? 'ok' : 'error',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): APIConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<APIConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// Global API client instance
export const apiClient = new BaseAPIClient()
export default BaseAPIClient