// Contract tests setup
// Tests service interfaces and contracts in isolation

import { beforeAll, afterEach, afterAll, vi, type MockedFunction } from 'vitest';

// Contract test utilities
export interface MockConfig {
  returnValue?: any;
  mockImplementation?: (...args: any[]) => any;
  mockResolvedValue?: any;
  mockRejectedValue?: any;
}

export class ContractTestBuilder {
  private mocks: Map<string, MockedFunction<any>> = new Map();

  // Create a mock function with specified behavior
  createMock<T extends (...args: any[]) => any>(
    name: string,
    config: MockConfig = {}
  ): MockedFunction<T> {
    const mock = vi.fn() as MockedFunction<T>;
    
    if (config.returnValue !== undefined) {
      mock.mockReturnValue(config.returnValue);
    }
    if (config.mockImplementation) {
      mock.mockImplementation(config.mockImplementation);
    }
    if (config.mockResolvedValue !== undefined) {
      mock.mockResolvedValue(config.mockResolvedValue);
    }
    if (config.mockRejectedValue !== undefined) {
      mock.mockRejectedValue(config.mockRejectedValue);
    }

    this.mocks.set(name, mock);
    return mock;
  }

  // Get a previously created mock
  getMock<T extends (...args: any[]) => any>(name: string): MockedFunction<T> {
    const mock = this.mocks.get(name);
    if (!mock) {
      throw new Error(`Mock '${name}' not found. Create it first with createMock()`);
    }
    return mock as MockedFunction<T>;
  }

  // Clear all mocks
  clearAll(): void {
    this.mocks.forEach(mock => mock.mockClear());
  }

  // Reset all mocks
  resetAll(): void {
    this.mocks.forEach(mock => mock.mockReset());
  }

  // Restore all mocks
  restoreAll(): void {
    this.mocks.forEach(mock => mock.mockRestore());
    this.mocks.clear();
  }
}

// Global contract test builder
export const contractTestBuilder = new ContractTestBuilder();

// Contract test setup
beforeAll(() => {
  // Contract tests should be isolated and not depend on external state
  // No DOM APIs needed for pure contract testing
  
  // Mock console to avoid noise in contract tests
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// Clean up after each contract test
afterEach(() => {
  contractTestBuilder.clearAll();
  vi.clearAllMocks();
});

// Final cleanup
afterAll(() => {
  contractTestBuilder.restoreAll();
  vi.restoreAllMocks();
});

// Contract test helpers
export const createServiceContract = <T>(
  serviceName: string,
  methods: (keyof T)[]
): MockedFunction<any>[] => {
  return methods.map(method => 
    contractTestBuilder.createMock(`${serviceName}.${String(method)}`)
  );
};

// Validate that a service implements required methods
export const validateServiceContract = <T extends object>(
  service: T,
  requiredMethods: (keyof T)[]
): boolean => {
  return requiredMethods.every(method => {
    const prop = service[method];
    return typeof prop === 'function';
  });
};

// Type-safe contract assertion
export const assertContract = <T extends object>(
  service: T,
  contract: Record<keyof T, 'function' | 'object' | 'string' | 'number' | 'boolean'>
): void => {
  Object.entries(contract).forEach(([key, expectedType]) => {
    const actualType = typeof service[key as keyof T];
    if (actualType !== expectedType) {
      throw new Error(
        `Contract violation: ${key} expected ${expectedType}, got ${actualType}`
      );
    }
  });
};