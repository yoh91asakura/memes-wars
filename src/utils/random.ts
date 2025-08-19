// Random Utilities - RNG utilities for game mechanics

export interface RandomSeed {
  state: number;
}

export class SeededRandom {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
  }

  // Linear congruential generator for predictable randomness
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 0x100000000;
    return this.seed / 0x100000000;
  }

  // Random integer between min and max (inclusive)
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Random float between min and max
  float(min: number = 0, max: number = 1): number {
    return this.next() * (max - min) + min;
  }

  // Random boolean with probability
  boolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  // Choose random element from array
  choice<T>(array: T[]): T {
    return array[this.int(0, array.length - 1)];
  }

  // Choose multiple random elements from array (without replacement)
  choices<T>(array: T[], count: number): T[] {
    const shuffled = [...array];
    const result: T[] = [];
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const index = this.int(0, shuffled.length - 1 - i);
      result.push(shuffled[index]);
      // Move selected element to the end
      [shuffled[index], shuffled[shuffled.length - 1 - i]] = [shuffled[shuffled.length - 1 - i], shuffled[index]];
    }
    
    return result;
  }

  // Shuffle array in place
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Weighted random selection
  weighted<T>(items: Array<{ item: T; weight: number }>): T {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const random = this.float(0, totalWeight);
    
    let currentWeight = 0;
    for (const item of items) {
      currentWeight += item.weight;
      if (random <= currentWeight) {
        return item.item;
      }
    }
    
    return items[items.length - 1].item;
  }

  // Generate UUID
  uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = this.int(0, 15);
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Get current seed for save/restore
  getSeed(): number {
    return this.seed;
  }

  // Set seed for reproducible sequences
  setSeed(seed: number): void {
    this.seed = seed;
  }
}

// Noise functions for procedural generation
export class NoiseGenerator {
  constructor(_seed?: number) {}

  // Simple 1D noise
  noise1D(x: number, frequency: number = 1, amplitude: number = 1): number {
    const scaled = x * frequency;
    const i = Math.floor(scaled);
    const f = scaled - i;
    
    const a = this.randomAt(i);
    const b = this.randomAt(i + 1);
    
    // Smooth interpolation
    const u = this.fade(f);
    return this.lerp(a, b, u) * amplitude;
  }

  // Simple 2D noise
  noise2D(x: number, y: number, frequency: number = 1, amplitude: number = 1): number {
    const scaledX = x * frequency;
    const scaledY = y * frequency;
    
    const ix = Math.floor(scaledX);
    const iy = Math.floor(scaledY);
    const fx = scaledX - ix;
    const fy = scaledY - iy;
    
    const a = this.randomAt2D(ix, iy);
    const b = this.randomAt2D(ix + 1, iy);
    const c = this.randomAt2D(ix, iy + 1);
    const d = this.randomAt2D(ix + 1, iy + 1);
    
    const u = this.fade(fx);
    const v = this.fade(fy);
    
    const i1 = this.lerp(a, b, u);
    const i2 = this.lerp(c, d, u);
    
    return this.lerp(i1, i2, v) * amplitude;
  }

  // Fractal noise (octaves)
  fractalNoise2D(
    x: number, 
    y: number, 
    octaves: number = 4, 
    frequency: number = 1, 
    amplitude: number = 1,
    lacunarity: number = 2,
    persistence: number = 0.5
  ): number {
    let value = 0;
    let currentAmplitude = amplitude;
    let currentFrequency = frequency;
    
    for (let i = 0; i < octaves; i++) {
      value += this.noise2D(x, y, currentFrequency, currentAmplitude);
      currentAmplitude *= persistence;
      currentFrequency *= lacunarity;
    }
    
    return value;
  }

  private randomAt(x: number): number {
    // Simple hash function for consistent random values at coordinates
    let hash = Math.imul(x, 0x9E3779B9);
    hash = hash ^ (hash >>> 16);
    hash = Math.imul(hash, 0x85EBCA6B);
    hash = hash ^ (hash >>> 13);
    hash = Math.imul(hash, 0xC2B2AE35);
    hash = hash ^ (hash >>> 16);
    return (hash & 0x7FFFFFFF) / 0x7FFFFFFF;
  }

  private randomAt2D(x: number, y: number): number {
    let hash = Math.imul(x, 0x9E3779B9) ^ Math.imul(y, 0x85EBCA6B);
    hash = hash ^ (hash >>> 16);
    hash = Math.imul(hash, 0x85EBCA6B);
    hash = hash ^ (hash >>> 13);
    hash = Math.imul(hash, 0xC2B2AE35);
    hash = hash ^ (hash >>> 16);
    return (hash & 0x7FFFFFFF) / 0x7FFFFFFF;
  }

  private fade(t: number): number {
    // 6t^5 - 15t^4 + 10t^3
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }
}

// Game-specific random utilities
export class GameRandom {
  private rng: SeededRandom;

  constructor(seed?: number) {
    this.rng = new SeededRandom(seed);
  }

  // Card rarity roll with configurable probabilities
  rollCardRarity(probabilities: Record<string, number> = {
    common: 50,
    uncommon: 25,
    rare: 15,
    epic: 7,
    legendary: 2.5,
    mythic: 0.4,
    cosmic: 0.09,
    divine: 0.01,
    infinity: 0.001
  }): string {
    const items = Object.entries(probabilities).map(([rarity, weight]) => ({
      item: rarity,
      weight
    }));
    
    return this.rng.weighted(items);
  }

  // Critical hit calculation
  rollCriticalHit(critChance: number = 0.1, critMultiplier: number = 2): { isCrit: boolean; multiplier: number } {
    const isCrit = this.rng.boolean(critChance);
    return {
      isCrit,
      multiplier: isCrit ? critMultiplier : 1
    };
  }

  // Damage variance
  rollDamage(baseDamage: number, variance: number = 0.1): number {
    const min = baseDamage * (1 - variance);
    const max = baseDamage * (1 + variance);
    return this.rng.float(min, max);
  }

  // Status effect duration with variance
  rollEffectDuration(baseDuration: number, variance: number = 0.2): number {
    const min = baseDuration * (1 - variance);
    const max = baseDuration * (1 + variance);
    return this.rng.float(min, max);
  }

  // Projectile spread pattern
  generateSpreadPattern(count: number, spread: number): number[] {
    const angles: number[] = [];
    const baseAngle = -spread / 2;
    const angleStep = count > 1 ? spread / (count - 1) : 0;
    
    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (angleStep * i);
      // Add slight random variance
      const variance = this.rng.float(-spread * 0.1, spread * 0.1);
      angles.push(angle + variance);
    }
    
    return angles;
  }

  // Spawn position with safe distance from other objects
  generateSpawnPosition(
    bounds: { width: number; height: number },
    obstacles: Array<{ x: number; y: number; radius: number }> = [],
    minDistance: number = 50,
    maxAttempts: number = 100
  ): { x: number; y: number } | null {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const position = {
        x: this.rng.float(minDistance, bounds.width - minDistance),
        y: this.rng.float(minDistance, bounds.height - minDistance)
      };
      
      const isSafe = obstacles.every(obstacle => {
        const distance = Math.sqrt(
          Math.pow(position.x - obstacle.x, 2) + 
          Math.pow(position.y - obstacle.y, 2)
        );
        return distance >= (minDistance + obstacle.radius);
      });
      
      if (isSafe) {
        return position;
      }
    }
    
    return null; // Couldn't find safe position
  }

  // Random card selection with luck factor
  selectRandomCards<T>(
    cards: T[],
    count: number,
    luckFactor: number = 1,
    rarityWeights?: Map<string, number>
  ): T[] {
    if (luckFactor === 1 && !rarityWeights) {
      return this.rng.choices(cards, count);
    }
    
    // Apply luck factor by multiple rolls
    const candidates: T[] = [];
    const rollCount = Math.max(1, Math.floor(luckFactor));
    
    for (let i = 0; i < count; i++) {
      const options: T[] = [];
      
      for (let roll = 0; roll < rollCount; roll++) {
        const candidate = this.rng.choice(cards);
        options.push(candidate);
      }
      
      // Select best option based on rarity if weights provided
      if (rarityWeights && options.length > 1) {
        const best = options.reduce((prev, current) => {
          const prevWeight = rarityWeights.get((prev as any).rarity) || 1;
          const currentWeight = rarityWeights.get((current as any).rarity) || 1;
          return currentWeight > prevWeight ? current : prev;
        });
        candidates.push(best);
      } else {
        candidates.push(this.rng.choice(options));
      }
    }
    
    return candidates;
  }

  // Exponential backoff for retry mechanisms
  calculateBackoffDelay(attempt: number, baseDelay: number = 1000, maxDelay: number = 30000): number {
    const delay = baseDelay * Math.pow(2, attempt);
    const jitter = this.rng.float(0.8, 1.2); // ±20% jitter
    return Math.min(delay * jitter, maxDelay);
  }

  // Random walk for AI movement
  generateRandomWalk(
    startPosition: { x: number; y: number },
    steps: number,
    stepSize: number = 10
  ): Array<{ x: number; y: number }> {
    const path: Array<{ x: number; y: number }> = [{ ...startPosition }];
    let currentPos = { ...startPosition };
    
    for (let i = 0; i < steps; i++) {
      const angle = this.rng.float(0, Math.PI * 2);
      const distance = this.rng.float(stepSize * 0.5, stepSize);
      
      currentPos = {
        x: currentPos.x + Math.cos(angle) * distance,
        y: currentPos.y + Math.sin(angle) * distance
      };
      
      path.push({ ...currentPos });
    }
    
    return path;
  }

  // Get current seed for save/load
  getSeed(): number {
    return this.rng.getSeed();
  }

  // Set seed for reproducible gameplay
  setSeed(seed: number): void {
    this.rng.setSeed(seed);
  }
}

// Probability utilities
export class ProbabilityUtils {
  // Calculate chance of event happening at least once in n trials
  static atLeastOnce(probability: number, trials: number): number {
    return 1 - Math.pow(1 - probability, trials);
  }

  // Calculate expected value
  static expectedValue(outcomes: Array<{ value: number; probability: number }>): number {
    return outcomes.reduce((sum, outcome) => sum + (outcome.value * outcome.probability), 0);
  }

  // Normal distribution approximation (Box-Muller transform)
  static normalRandom(mean: number = 0, standardDeviation: number = 1): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * standardDeviation + mean;
  }

  // Poisson distribution for event timing
  static poissonRandom(lambda: number): number {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    
    return k - 1;
  }
}

// Global instances
export const gameRandom = new GameRandom();
export const noiseGenerator = new NoiseGenerator();