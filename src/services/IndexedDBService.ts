import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Card, CardCollection, CardFilter, CardImage, SyncStatus } from '../models/CardManagement';

export interface CardManagementDB extends DBSchema {
  cards: {
    key: string;
    value: Card;
    indexes: {
      'by-player': string;
      'by-rarity': string;
      'by-cost': number;
      'by-name': string;
    };
  };
  collections: {
    key: string;
    value: CardCollection;
    indexes: {
      'by-player': string;
      'by-updated': Date;
    };
  };
  filters: {
    key: string;
    value: CardFilter;
    indexes: {
      'by-player': string;
      'by-name': string;
      'by-active': boolean;
    };
  };
  images: {
    key: string;
    value: CardImage;
    indexes: {
      'by-card': string;
      'by-player': string;
      'by-upload-date': Date;
    };
  };
  syncStatus: {
    key: string;
    value: SyncStatus;
    indexes: {
      'by-entity': string;
      'by-status': string;
      'by-updated': Date;
    };
  };
  metadata: {
    key: string;
    value: {
      version: string;
      lastSync: Date;
      cacheSize: number;
      totalCards: number;
    };
  };
}

class IndexedDBService {
  private dbPromise: Promise<IDBPDatabase<CardManagementDB>>;
  private readonly DB_NAME = 'memes-wars-cards';
  private readonly DB_VERSION = 1;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase<CardManagementDB>> {
    return openDB<CardManagementDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading IndexedDB from ${oldVersion} to ${newVersion}`);

        // Cards store
        if (!db.objectStoreNames.contains('cards')) {
          const cardStore = db.createObjectStore('cards', { keyPath: 'id' });
          cardStore.createIndex('by-player', 'playerId');
          cardStore.createIndex('by-rarity', 'rarity');
          cardStore.createIndex('by-cost', 'cost');
          cardStore.createIndex('by-name', 'name');
        }

        // Collections store
        if (!db.objectStoreNames.contains('collections')) {
          const collectionStore = db.createObjectStore('collections', { keyPath: 'collectionId' });
          collectionStore.createIndex('by-player', 'playerId');
          collectionStore.createIndex('by-updated', 'metadata.lastUpdated');
        }

        // Filters store
        if (!db.objectStoreNames.contains('filters')) {
          const filterStore = db.createObjectStore('filters', { keyPath: 'id' });
          filterStore.createIndex('by-player', 'playerId');
          filterStore.createIndex('by-name', 'name');
          filterStore.createIndex('by-active', 'active');
        }

        // Images store
        if (!db.objectStoreNames.contains('images')) {
          const imageStore = db.createObjectStore('images', { keyPath: 'id' });
          imageStore.createIndex('by-card', 'cardId');
          imageStore.createIndex('by-player', 'playerId');
          imageStore.createIndex('by-upload-date', 'uploadDate');
        }

        // Sync status store
        if (!db.objectStoreNames.contains('syncStatus')) {
          const syncStore = db.createObjectStore('syncStatus', { keyPath: 'id' });
          syncStore.createIndex('by-entity', 'entityId');
          syncStore.createIndex('by-status', 'status');
          syncStore.createIndex('by-updated', 'lastAttempt');
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      },
      blocked() {
        console.warn('IndexedDB upgrade blocked - please close other tabs');
      },
      blocking() {
        console.warn('IndexedDB blocking other connections - will close');
      }
    });
  }

  async getCollection(playerId: string): Promise<CardCollection | null> {
    const db = await this.dbPromise;
    const collections = await db.getAllFromIndex('collections', 'by-player', playerId);
    return collections.length > 0 ? collections[0] : null;
  }

  async saveCollection(collection: CardCollection): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(['collections', 'cards'], 'readwrite');
    
    // Save collection
    await tx.objectStore('collections').put(collection);
    
    // Save all cards in collection
    const cardPromises = collection.cards.map(card => 
      tx.objectStore('cards').put(card)
    );
    
    await Promise.all([...cardPromises, tx.done]);
    
    // Update metadata
    await this.updateMetadata({
      totalCards: collection.cards.length,
      lastSync: new Date(),
      cacheSize: await this.calculateCacheSize()
    });
  }

  async getCards(playerId: string): Promise<Card[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('cards', 'by-player', playerId);
  }

  async saveCard(card: Card): Promise<void> {
    const db = await this.dbPromise;
    await db.put('cards', card);
  }

  async getFilters(playerId: string): Promise<CardFilter[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('filters', 'by-player', playerId);
  }

  async saveFilter(filter: CardFilter): Promise<void> {
    const db = await this.dbPromise;
    await db.put('filters', filter);
  }

  async deleteFilter(filterId: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('filters', filterId);
  }

  async getActiveFilters(playerId: string): Promise<CardFilter[]> {
    const db = await this.dbPromise;
    const allFilters = await db.getAllFromIndex('filters', 'by-player', playerId);
    return allFilters.filter(filter => filter.active);
  }

  async getCardImages(cardId: string): Promise<CardImage[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('images', 'by-card', cardId);
  }

  async saveCardImage(image: CardImage): Promise<void> {
    const db = await this.dbPromise;
    await db.put('images', image);
  }

  async deleteCardImage(imageId: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('images', imageId);
  }

  async getSyncStatus(entityId: string): Promise<SyncStatus | null> {
    const db = await this.dbPromise;
    const statuses = await db.getAllFromIndex('syncStatus', 'by-entity', entityId);
    return statuses.length > 0 ? statuses[0] : null;
  }

  async saveSyncStatus(status: SyncStatus): Promise<void> {
    const db = await this.dbPromise;
    await db.put('syncStatus', status);
  }

  async getPendingSyncItems(): Promise<SyncStatus[]> {
    const db = await this.dbPromise;
    const allStatuses = await db.getAll('syncStatus');
    return allStatuses.filter(status => 
      status.status === 'pending' || status.status === 'failed'
    );
  }

  async searchCards(playerId: string, searchTerm: string): Promise<Card[]> {
    const db = await this.dbPromise;
    const allCards = await db.getAllFromIndex('cards', 'by-player', playerId);
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allCards.filter(card => 
      card.name.toLowerCase().includes(lowerSearchTerm) ||
      card.description.toLowerCase().includes(lowerSearchTerm) ||
      card.abilities.some(ability => ability.toLowerCase().includes(lowerSearchTerm))
    );
  }

  async filterCards(playerId: string, filters: CardFilter[]): Promise<Card[]> {
    const db = await this.dbPromise;
    let cards = await db.getAllFromIndex('cards', 'by-player', playerId);

    for (const filter of filters.filter(f => f.active)) {
      const criteria = filter.criteria;

      // Filter by rarities
      if (criteria.rarities && criteria.rarities.length > 0) {
        cards = cards.filter(card => criteria.rarities!.includes(card.rarity));
      }

      // Filter by cost range
      if (criteria.costRange) {
        const { min, max } = criteria.costRange;
        cards = cards.filter(card => 
          card.cost >= (min ?? 0) && card.cost <= (max ?? Infinity)
        );
      }

      // Filter by types
      if (criteria.types && criteria.types.length > 0) {
        cards = cards.filter(card => criteria.types!.includes(card.type));
      }

      // Filter by text search
      if (criteria.textSearch) {
        const searchTerm = criteria.textSearch.toLowerCase();
        cards = cards.filter(card =>
          card.name.toLowerCase().includes(searchTerm) ||
          card.description.toLowerCase().includes(searchTerm) ||
          card.abilities.some(ability => ability.toLowerCase().includes(searchTerm))
        );
      }

      // Filter by custom tags
      if (criteria.customTags && criteria.customTags.length > 0) {
        cards = cards.filter(card => 
          card.collectionMetadata?.tags?.some(tag => 
            criteria.customTags!.includes(tag)
          )
        );
      }
    }

    return cards;
  }

  async clearCache(): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(['cards', 'collections', 'filters', 'images'], 'readwrite');
    
    await Promise.all([
      tx.objectStore('cards').clear(),
      tx.objectStore('collections').clear(),
      tx.objectStore('filters').clear(),
      tx.objectStore('images').clear(),
      tx.done
    ]);

    await this.updateMetadata({
      totalCards: 0,
      cacheSize: 0,
      lastSync: new Date()
    });
  }

  async calculateCacheSize(): Promise<number> {
    const db = await this.dbPromise;
    const tx = db.transaction(['cards', 'collections', 'filters', 'images'], 'readonly');
    
    const [cards, collections, filters, images] = await Promise.all([
      tx.objectStore('cards').getAll(),
      tx.objectStore('collections').getAll(),
      tx.objectStore('filters').getAll(),
      tx.objectStore('images').getAll()
    ]);

    // Rough estimate in bytes (JSON stringify approximation)
    const estimatedSize = 
      JSON.stringify(cards).length +
      JSON.stringify(collections).length +
      JSON.stringify(filters).length +
      JSON.stringify(images).length;

    return estimatedSize;
  }

  private async updateMetadata(updates: Partial<{
    version: string;
    lastSync: Date;
    cacheSize: number;
    totalCards: number;
  }>): Promise<void> {
    const db = await this.dbPromise;
    const currentMeta = await db.get('metadata', 'main') || {
      key: 'main',
      version: '1.0.0',
      lastSync: new Date(),
      cacheSize: 0,
      totalCards: 0
    };

    const updatedMeta = { ...currentMeta, ...updates };
    await db.put('metadata', updatedMeta);
  }

  async getMetadata(): Promise<{
    version: string;
    lastSync: Date;
    cacheSize: number;
    totalCards: number;
  } | null> {
    const db = await this.dbPromise;
    const meta = await db.get('metadata', 'main');
    return meta || null;
  }

  async close(): Promise<void> {
    const db = await this.dbPromise;
    db.close();
  }
}

export const indexedDBService = new IndexedDBService();
export default IndexedDBService;