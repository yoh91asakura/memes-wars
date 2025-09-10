// Integration tests setup
// Tests service interactions and store integrations

import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// Store mock utilities for integration testing
export class StoreTestUtils {
  private originalStores: Map<string, any> = new Map();

  // Mock a Zustand store
  mockStore<T>(storeName: string, initialState: Partial<T>): void {
    // Store original for restoration
    this.originalStores.set(storeName, global[storeName as keyof typeof global]);
    
    // Create mock store
    const mockStore = {
      getState: vi.fn(() => initialState),
      setState: vi.fn((newState: Partial<T>) => {
        Object.assign(initialState, newState);
      }),
      subscribe: vi.fn(() => vi.fn()), // Return unsubscribe function
      destroy: vi.fn(),
    };

    // Mock the store globally
    vi.stubGlobal(storeName, mockStore);
  }

  // Reset all mocked stores
  resetStores(): void {
    this.originalStores.forEach((original, storeName) => {
      if (original) {
        vi.stubGlobal(storeName, original);
      } else {
        vi.unstubAllGlobals();
      }
    });
    this.originalStores.clear();
  }
}

// Global store test utilities
export const storeTestUtils = new StoreTestUtils();

// Service interaction helpers
export class ServiceInteractionBuilder {
  private services: Map<string, any> = new Map();
  private interactions: Array<{ service: string; method: string; args: any[]; result: any }> = [];

  // Register a service for interaction testing
  registerService(name: string, service: any): void {
    this.services.set(name, service);
  }

  // Record an interaction
  recordInteraction(serviceName: string, method: string, args: any[], result: any): void {
    this.interactions.push({ service: serviceName, method, args, result });
  }

  // Get interaction history
  getInteractionHistory(): Array<{ service: string; method: string; args: any[]; result: any }> {
    return [...this.interactions];
  }

  // Clear interaction history
  clearHistory(): void {
    this.interactions = [];
  }

  // Verify interaction sequence
  verifySequence(expectedSequence: Array<{ service: string; method: string }>): boolean {
    if (this.interactions.length !== expectedSequence.length) {
      return false;
    }

    return expectedSequence.every((expected, index) => {
      const actual = this.interactions[index];
      return actual.service === expected.service && actual.method === expected.method;
    });
  }
}

// Global service interaction builder
export const serviceInteractionBuilder = new ServiceInteractionBuilder();

// Integration test setup
beforeAll(() => {
  // Setup DOM environment for integration tests
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    },
    writable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    },
    writable: true,
  });

  // Mock performance API for timing tests
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
    },
  });

  // Mock requestAnimationFrame for animation-dependent services
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 16);
  });

  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    clearTimeout(id);
  });
});

// Clean up after each integration test
afterEach(() => {
  storeTestUtils.resetStores();
  serviceInteractionBuilder.clearHistory();
  vi.clearAllMocks();
});

// Final cleanup
afterAll(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Integration test helpers
export const waitForStateChange = async (
  getState: () => any,
  expectedValue: any,
  timeout: number = 1000
): Promise<void> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (getState() === expectedValue) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  throw new Error(`State did not change to expected value within ${timeout}ms`);
};

// Mock external service dependencies
export const mockExternalServices = () => {
  // Mock audio context for audio services
  const mockAudioContext = {
    createGain: vi.fn(() => ({
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createOscillator: vi.fn(() => ({
      frequency: { value: 440 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    destination: {},
  };

  vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));
  vi.stubGlobal('webkitAudioContext', vi.fn(() => mockAudioContext));

  // Mock intersection observer
  vi.stubGlobal('IntersectionObserver', vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })));

  // Mock resize observer
  vi.stubGlobal('ResizeObserver', vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })));
};