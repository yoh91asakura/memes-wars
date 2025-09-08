// Test setup for Vitest
// Global test configuration and mocks

import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(() => null),
};

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(() => null),
};

// Setup global mocks
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
  
  // Mock window.location
  Object.defineProperty(window, 'location', {
    value: {
      origin: 'http://localhost:3000',
      href: 'http://localhost:3000',
      pathname: '/',
    },
    writable: true,
  });

  // Mock performance API
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
    },
  });

  // Mock requestAnimationFrame
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 16);
  });

  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    clearTimeout(id);
  });
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  sessionStorageMock.getItem.mockReturnValue(null);
});

// Global cleanup
afterAll(() => {
  vi.restoreAllMocks();
});

// Helper to mock RNG for deterministic tests
export const mockRandom = (values: number[]) => {
  let index = 0;
  vi.spyOn(Math, 'random').mockImplementation(() => {
    return values[index++ % values.length];
  });
};

// Helper to mock Date.now for time-based tests
export const mockTime = (timestamp: number) => {
  vi.spyOn(Date, 'now').mockReturnValue(timestamp);
};

// Helper to advance time in tests
export const advanceTime = (ms: number) => {
  vi.advanceTimersByTime(ms);
};