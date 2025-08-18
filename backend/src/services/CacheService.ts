import { createClient, RedisClientType } from 'redis';
import { config } from '@config/index';
import { logger } from '@/utils/logger';

// Cache key prefixes for organization
export const CACHE_PREFIXES = {
  USER: 'user:',
  CARD: 'card:',
  DECK: 'deck:',
  MATCH: 'match:',
  STATS: 'stats:',
  LEADERBOARD: 'leaderboard:',
  SESSION: 'session:',
  COLLECTION: 'collection:',
  ACHIEVEMENTS: 'achievements:',
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes - for frequently changing data
  MEDIUM: 1800, // 30 minutes - for moderately stable data
  LONG: 3600, // 1 hour - for stable data
  VERY_LONG: 86400, // 24 hours - for rarely changing data
  PERMANENT: 0, // No expiration - manual invalidation only
} as const;

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
  serialize?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: string;
  uptime: number;
  connections: number;
}

class CacheService {
  private client: RedisClientType;
  private isConnected = false;
  private stats = {
    hits: 0,
    misses: 0,
    operations: 0,
  };

  constructor() {
    this.client = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis: Too many reconnection attempts, giving up');
            return false;
          }
          logger.warn(`Redis: Reconnecting, attempt ${retries + 1}`);
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.setupEventHandlers();
  }

  /**
   * Setup Redis client event handlers
   */
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('🔗 Redis client connected');
    });

    this.client.on('ready', () => {
      logger.info('✅ Redis client ready');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      logger.error('❌ Redis client error:', error);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      logger.info('🔌 Redis connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      logger.info('🔄 Redis client reconnecting...');
    });
  }

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    try {
      await this.client.connect();
      logger.info('🎯 Redis cache service initialized');

      // Test connection
      await this.ping();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw new Error('Redis connection failed');
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.quit();
        logger.info('🔌 Redis connection closed gracefully');
      }
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }

  /**
   * Check if Redis is connected and responsive
   */
  async ping(): Promise<boolean> {
    try {
      const response = await this.client.ping();
      return response === 'PONG';
    } catch (error) {
      logger.error('Redis ping failed:', error);
      return false;
    }
  }

  /**
   * Generate cache key with prefix
   */
  private generateKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}${key}` : key;
  }

  /**
   * Serialize data for storage
   */
  private serialize(data: any): string {
    return JSON.stringify(data);
  }

  /**
   * Deserialize data from storage
   */
  private deserialize<T>(data: string): T {
    return JSON.parse(data);
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, cache miss');
      return null;
    }

    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const data = await this.client.get(cacheKey);

      if (data === null) {
        this.stats.misses++;
        logger.debug('Cache miss', { key: cacheKey });
        return null;
      }

      this.stats.hits++;
      logger.debug('Cache hit', { key: cacheKey });

      return options.serialize !== false ? this.deserialize<T>(data) : (data as T);
    } catch (error) {
      logger.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, cache write skipped');
      return false;
    }

    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const serializedValue = options.serialize !== false ? this.serialize(value) : value;

      if (options.ttl && options.ttl > 0) {
        await this.client.setEx(cacheKey, options.ttl, serializedValue);
      } else {
        await this.client.set(cacheKey, serializedValue);
      }

      this.stats.operations++;
      logger.debug('Cache set', { key: cacheKey, ttl: options.ttl });
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const result = await this.client.del(cacheKey);
      
      logger.debug('Cache delete', { key: cacheKey, deleted: result > 0 });
      return result > 0;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const result = await this.client.exists(cacheKey);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Set expiration on existing key
   */
  async expire(key: string, ttl: number, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const result = await this.client.expire(cacheKey, ttl);
      return result;
    } catch (error) {
      logger.error('Cache expire error:', error);
      return false;
    }
  }

  /**
   * Get multiple keys at once
   */
  async mget<T>(keys: string[], options: CacheOptions = {}): Promise<(T | null)[]> {
    if (!this.isConnected || keys.length === 0) {
      return keys.map(() => null);
    }

    try {
      const cacheKeys = keys.map(key => this.generateKey(key, options.prefix));
      const results = await this.client.mGet(cacheKeys);

      return results.map((data) => {
        if (data === null) {
          this.stats.misses++;
          return null;
        }

        this.stats.hits++;
        return options.serialize !== false ? this.deserialize<T>(data) : (data as T);
      });
    } catch (error) {
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple keys at once
   */
  async mset(keyValuePairs: Record<string, any>, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const pipeline = this.client.multi();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        const cacheKey = this.generateKey(key, options.prefix);
        const serializedValue = options.serialize !== false ? this.serialize(value) : value;

        if (options.ttl && options.ttl > 0) {
          pipeline.setEx(cacheKey, options.ttl, serializedValue);
        } else {
          pipeline.set(cacheKey, serializedValue);
        }
      });

      await pipeline.exec();
      this.stats.operations += Object.keys(keyValuePairs).length;
      
      logger.debug('Cache mset', { count: Object.keys(keyValuePairs).length });
      return true;
    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Delete keys by pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.isConnected) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.client.del(keys);
      logger.info('Cache pattern delete', { pattern, deleted: result });
      return result;
    } catch (error) {
      logger.error('Cache pattern delete error:', error);
      return 0;
    }
  }

  /**
   * Increment numeric value
   */
  async increment(key: string, options: CacheOptions = {}): Promise<number> {
    if (!this.isConnected) {
      return 0;
    }

    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const result = await this.client.incr(cacheKey);

      if (options.ttl && options.ttl > 0) {
        await this.client.expire(cacheKey, options.ttl);
      }

      return result;
    } catch (error) {
      logger.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Cache with automatic invalidation wrapper
   */
  async wrap<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();

    // Store in cache for next time
    await this.set(key, data, options);

    return data;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    if (!this.isConnected) {
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        keys: 0,
        memory: '0B',
        uptime: 0,
        connections: 0,
      };
    }

    try {
      const info = await this.client.info('memory');
      const stats = await this.client.info('stats');
      const keyspace = await this.client.info('keyspace');

      // Parse Redis INFO output
      const memoryUsed = this.parseInfoValue(info, 'used_memory_human') || '0B';
      const uptime = parseInt(this.parseInfoValue(stats, 'uptime_in_seconds') || '0');
      const connections = parseInt(this.parseInfoValue(stats, 'connected_clients') || '0');

      // Count keys (this is approximate)
      const dbKeys = this.parseInfoValue(keyspace, 'db0');
      const keys = dbKeys ? parseInt(dbKeys.split('keys=')[1]?.split(',')[0] || '0') : 0;

      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        keys,
        memory: memoryUsed,
        uptime,
        connections,
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        keys: 0,
        memory: '0B',
        uptime: 0,
        connections: 0,
      };
    }
  }

  /**
   * Parse Redis INFO command value
   */
  private parseInfoValue(info: string, key: string): string | null {
    const line = info.split('\r\n').find(line => line.startsWith(`${key}:`));
    return line ? (line.split(':')[1] || null) : null;
  }

  /**
   * Health check for cache service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency: number; error?: string }> {
    const start = Date.now();

    try {
      const isHealthy = await this.ping();
      const latency = Date.now() - start;

      if (isHealthy) {
        return {
          status: 'healthy',
          latency,
        };
      } else {
        return {
          status: 'unhealthy',
          latency,
          error: 'Redis ping failed',
        };
      }
    } catch (error) {
      const latency = Date.now() - start;
      return {
        status: 'unhealthy',
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Clear all cache (use with caution!)
   */
  async clearAll(): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      await this.client.flushAll();
      logger.warn('All cache cleared');
      return true;
    } catch (error) {
      logger.error('Error clearing cache:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export default cacheService;
