import { cacheService, CACHE_PREFIXES, CACHE_TTL } from '@services/CacheService';
import { logger } from '@/utils/logger';

/**
 * User-related caching utilities
 */
export class UserCache {
  /**
   * Cache user profile data
   */
  static async cacheUserProfile(userId: string, userData: any): Promise<boolean> {
    return cacheService.set(
      userId,
      userData,
      {
        prefix: CACHE_PREFIXES.USER,
        ttl: CACHE_TTL.MEDIUM,
      }
    );
  }

  /**
   * Get cached user profile
   */
  static async getUserProfile(userId: string): Promise<any | null> {
    return cacheService.get(userId, {
      prefix: CACHE_PREFIXES.USER,
    });
  }

  /**
   * Cache user collection
   */
  static async cacheUserCollection(userId: string, collection: any): Promise<boolean> {
    return cacheService.set(
      `${userId}_collection`,
      collection,
      {
        prefix: CACHE_PREFIXES.COLLECTION,
        ttl: CACHE_TTL.LONG,
      }
    );
  }

  /**
   * Get cached user collection
   */
  static async getUserCollection(userId: string): Promise<any | null> {
    return cacheService.get(`${userId}_collection`, {
      prefix: CACHE_PREFIXES.COLLECTION,
    });
  }

  /**
   * Cache user achievements
   */
  static async cacheUserAchievements(userId: string, achievements: any): Promise<boolean> {
    return cacheService.set(
      userId,
      achievements,
      {
        prefix: CACHE_PREFIXES.ACHIEVEMENTS,
        ttl: CACHE_TTL.LONG,
      }
    );
  }

  /**
   * Get cached user achievements
   */
  static async getUserAchievements(userId: string): Promise<any | null> {
    return cacheService.get(userId, {
      prefix: CACHE_PREFIXES.ACHIEVEMENTS,
    });
  }

  /**
   * Invalidate user-related cache
   */
  static async invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
      cacheService.delete(userId, { prefix: CACHE_PREFIXES.USER }),
      cacheService.delete(`${userId}_collection`, { prefix: CACHE_PREFIXES.COLLECTION }),
      cacheService.delete(userId, { prefix: CACHE_PREFIXES.ACHIEVEMENTS }),
    ]);
  }
}

/**
 * Card-related caching utilities
 */
export class CardCache {
  /**
   * Cache all cards data
   */
  static async cacheAllCards(cards: any[]): Promise<boolean> {
    return cacheService.set(
      'all',
      cards,
      {
        prefix: CACHE_PREFIXES.CARD,
        ttl: CACHE_TTL.VERY_LONG,
      }
    );
  }

  /**
   * Get all cached cards
   */
  static async getAllCards(): Promise<any[] | null> {
    return cacheService.get('all', {
      prefix: CACHE_PREFIXES.CARD,
    });
  }

  /**
   * Cache individual card data
   */
  static async cacheCard(cardId: string, cardData: any): Promise<boolean> {
    return cacheService.set(
      cardId,
      cardData,
      {
        prefix: CACHE_PREFIXES.CARD,
        ttl: CACHE_TTL.VERY_LONG,
      }
    );
  }

  /**
   * Get cached card data
   */
  static async getCard(cardId: string): Promise<any | null> {
    return cacheService.get(cardId, {
      prefix: CACHE_PREFIXES.CARD,
    });
  }

  /**
   * Cache multiple cards at once
   */
  static async cacheMultipleCards(cards: { id: string; data: any }[]): Promise<boolean> {
    const cardMap: Record<string, any> = {};
    cards.forEach(({ id, data }) => {
      cardMap[id] = data;
    });

    return cacheService.mset(cardMap, {
      prefix: CACHE_PREFIXES.CARD,
      ttl: CACHE_TTL.VERY_LONG,
    });
  }

  /**
   * Get multiple cached cards
   */
  static async getMultipleCards(cardIds: string[]): Promise<(any | null)[]> {
    return cacheService.mget(cardIds, {
      prefix: CACHE_PREFIXES.CARD,
    });
  }
}

/**
 * Deck-related caching utilities
 */
export class DeckCache {
  /**
   * Cache user deck
   */
  static async cacheUserDeck(userId: string, deckId: string, deckData: any): Promise<boolean> {
    return cacheService.set(
      `${userId}_${deckId}`,
      deckData,
      {
        prefix: CACHE_PREFIXES.DECK,
        ttl: CACHE_TTL.MEDIUM,
      }
    );
  }

  /**
   * Get cached user deck
   */
  static async getUserDeck(userId: string, deckId: string): Promise<any | null> {
    return cacheService.get(`${userId}_${deckId}`, {
      prefix: CACHE_PREFIXES.DECK,
    });
  }

  /**
   * Cache user's all decks
   */
  static async cacheUserDecks(userId: string, decks: any[]): Promise<boolean> {
    return cacheService.set(
      `${userId}_all`,
      decks,
      {
        prefix: CACHE_PREFIXES.DECK,
        ttl: CACHE_TTL.MEDIUM,
      }
    );
  }

  /**
   * Get cached user's all decks
   */
  static async getUserDecks(userId: string): Promise<any[] | null> {
    return cacheService.get(`${userId}_all`, {
      prefix: CACHE_PREFIXES.DECK,
    });
  }

  /**
   * Invalidate user deck cache
   */
  static async invalidateUserDeckCache(userId: string, deckId?: string): Promise<void> {
    if (deckId) {
      await cacheService.delete(`${userId}_${deckId}`, { prefix: CACHE_PREFIXES.DECK });
    }
    // Always invalidate the "all decks" cache
    await cacheService.delete(`${userId}_all`, { prefix: CACHE_PREFIXES.DECK });
  }
}

/**
 * Game and Match-related caching utilities
 */
export class GameCache {
  /**
   * Cache active match data
   */
  static async cacheMatch(matchId: string, matchData: any): Promise<boolean> {
    return cacheService.set(
      matchId,
      matchData,
      {
        prefix: CACHE_PREFIXES.MATCH,
        ttl: CACHE_TTL.SHORT, // Matches change frequently
      }
    );
  }

  /**
   * Get cached match data
   */
  static async getMatch(matchId: string): Promise<any | null> {
    return cacheService.get(matchId, {
      prefix: CACHE_PREFIXES.MATCH,
    });
  }

  /**
   * Cache user's match history
   */
  static async cacheUserMatchHistory(userId: string, matches: any[]): Promise<boolean> {
    return cacheService.set(
      `${userId}_history`,
      matches,
      {
        prefix: CACHE_PREFIXES.MATCH,
        ttl: CACHE_TTL.MEDIUM,
      }
    );
  }

  /**
   * Get cached user's match history
   */
  static async getUserMatchHistory(userId: string): Promise<any[] | null> {
    return cacheService.get(`${userId}_history`, {
      prefix: CACHE_PREFIXES.MATCH,
    });
  }

  /**
   * Cache user session data
   */
  static async cacheUserSession(userId: string, sessionData: any): Promise<boolean> {
    return cacheService.set(
      userId,
      sessionData,
      {
        prefix: CACHE_PREFIXES.SESSION,
        ttl: CACHE_TTL.LONG,
      }
    );
  }

  /**
   * Get cached user session
   */
  static async getUserSession(userId: string): Promise<any | null> {
    return cacheService.get(userId, {
      prefix: CACHE_PREFIXES.SESSION,
    });
  }

  /**
   * Clear match cache
   */
  static async invalidateMatch(matchId: string): Promise<void> {
    await cacheService.delete(matchId, { prefix: CACHE_PREFIXES.MATCH });
  }
}

/**
 * Statistics and Leaderboard caching utilities
 */
export class StatsCache {
  /**
   * Cache user statistics
   */
  static async cacheUserStats(userId: string, stats: any): Promise<boolean> {
    return cacheService.set(
      userId,
      stats,
      {
        prefix: CACHE_PREFIXES.STATS,
        ttl: CACHE_TTL.MEDIUM,
      }
    );
  }

  /**
   * Get cached user statistics
   */
  static async getUserStats(userId: string): Promise<any | null> {
    return cacheService.get(userId, {
      prefix: CACHE_PREFIXES.STATS,
    });
  }

  /**
   * Cache global leaderboard
   */
  static async cacheLeaderboard(type: string, leaderboard: any[]): Promise<boolean> {
    return cacheService.set(
      type,
      leaderboard,
      {
        prefix: CACHE_PREFIXES.LEADERBOARD,
        ttl: CACHE_TTL.MEDIUM,
      }
    );
  }

  /**
   * Get cached leaderboard
   */
  static async getLeaderboard(type: string): Promise<any[] | null> {
    return cacheService.get(type, {
      prefix: CACHE_PREFIXES.LEADERBOARD,
    });
  }

  /**
   * Increment user stat counter
   */
  static async incrementUserStat(userId: string, statName: string): Promise<number> {
    return cacheService.increment(
      `${userId}_${statName}`,
      {
        prefix: CACHE_PREFIXES.STATS,
        ttl: CACHE_TTL.LONG,
      }
    );
  }

  /**
   * Invalidate user statistics
   */
  static async invalidateUserStats(userId: string): Promise<void> {
    await cacheService.delete(userId, { prefix: CACHE_PREFIXES.STATS });
    // Also invalidate leaderboards as they may be affected
    await cacheService.deletePattern(`${CACHE_PREFIXES.LEADERBOARD}*`);
  }
}

/**
 * Cache warming utilities
 */
export class CacheWarmer {
  /**
   * Warm up essential caches on server startup
   */
  static async warmEssentialCaches(): Promise<void> {
    logger.info('🔥 Starting cache warming process...');

    try {
      // This could be expanded to warm up frequently accessed data
      logger.info('✅ Cache warming completed');
    } catch (error) {
      logger.error('❌ Cache warming failed:', error);
    }
  }

  /**
   * Pre-populate card cache (called during startup)
   */
  static async warmCardCache(cards: any[]): Promise<void> {
    try {
      await CardCache.cacheAllCards(cards);
      
      // Cache individual cards as well for faster access
      const cardMap: { id: string; data: any }[] = cards.map(card => ({ id: card.id, data: card }));
      await CardCache.cacheMultipleCards(cardMap);
      
      logger.info(`🎴 Card cache warmed with ${cards.length} cards`);
    } catch (error) {
      logger.error('Failed to warm card cache:', error);
    }
  }
}

/**
 * Cache wrapper utility for data fetching with automatic caching
 */
export class CacheWrapper {
  /**
   * Generic cache wrapper for database queries
   */
  static async wrapDatabaseQuery<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    options: {
      prefix?: string;
      ttl?: number;
    } = {}
  ): Promise<T> {
    return cacheService.wrap<T>(cacheKey, fetcher, options);
  }

  /**
   * Cache wrapper with invalidation pattern
   */
  static async wrapWithInvalidation<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    _invalidationPattern: string, // Prefixed with underscore to indicate intentional non-use
    options: {
      prefix?: string;
      ttl?: number;
    } = {}
  ): Promise<T> {
    const data = await cacheService.get<T>(cacheKey, options);
    
    if (data !== null) {
      return data;
    }

    // Data not in cache, fetch it
    const freshData = await fetcher();
    
    // Store in cache
    await cacheService.set(cacheKey, freshData, options);
    
    return freshData;
  }
}

// Export all cache utilities
export {
  cacheService,
  CACHE_PREFIXES,
  CACHE_TTL,
};
