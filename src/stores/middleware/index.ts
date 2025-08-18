// Store Middleware - Centralized state management utilities
// Provides debugging, persistence, and logging capabilities for all stores

import { StateStorage } from 'zustand/middleware';

// Debug middleware for development
export const storeLogger = (name: string) => (config: any) => (set: any, get: any, api: any) =>
  config(
    (...args: any[]) => {
      console.log(`[${name}] State update:`, args);
      set(...args);
      console.log(`[${name}] New state:`, get());
    },
    get,
    api
  );

// Enhanced persistence with error handling
export const createStorePersistence = (name: string, storage?: StateStorage) => ({
  name,
  storage: storage || {
    getItem: (name: string) => {
      try {
        return Promise.resolve(localStorage.getItem(name));
      } catch (error) {
        console.warn(`Failed to get ${name} from storage:`, error);
        return Promise.resolve(null);
      }
    },
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value);
        return Promise.resolve();
      } catch (error) {
        console.warn(`Failed to set ${name} in storage:`, error);
        return Promise.resolve();
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
        return Promise.resolve();
      } catch (error) {
        console.warn(`Failed to remove ${name} from storage:`, error);
        return Promise.resolve();
      }
    }
  },
  partialize: (state: any) => {
    // Only persist necessary state, exclude derived values
    const { 
      // Exclude these computed/temporary values from persistence
      getFilteredCards, 
      getCollectionStats, 
      getCardsByRarity,
      hasCard,
      getCardCount,
      ...persistableState 
    } = state;
    return persistableState;
  },
  onRehydrateStorage: (name: string) => (state: any, error: any) => {
    if (error) {
      console.error(`Failed to rehydrate ${name} store:`, error);
    } else {
      console.log(`Successfully rehydrated ${name} store`);
    }
  }
});

// State debugger for development
export const storeDebugger = (name: string) => (config: any) => (set: any, get: any, api: any) => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Attach store to window for debugging
    (window as any)[`${name}Store`] = { get, set, api };
  }
  
  return config(set, get, api);
};

// Combined middleware factory
export const createStoreMiddleware = (name: string, options?: {
  enableLogger?: boolean;
  enableDebugger?: boolean;
  enablePersistence?: boolean;
  storage?: StateStorage;
}) => {
  const {
    enableLogger = process.env.NODE_ENV === 'development',
    enableDebugger = process.env.NODE_ENV === 'development',
    enablePersistence = true,
    storage
  } = options || {};

  return {
    logger: enableLogger ? storeLogger(name) : undefined,
    debugger: enableDebugger ? storeDebugger(name) : undefined,
    persistence: enablePersistence ? createStorePersistence(name, storage) : undefined
  };
};