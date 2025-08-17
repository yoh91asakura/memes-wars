/**
 * Performance Monitor - Real-time performance tracking for 60 FPS combat
 * Tracks FPS, memory usage, and frame timing
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
  updateTime: number;
  entityCount: number;
  projectileCount: number;
  droppedFrames: number;
}

export interface PerformanceThresholds {
  maxFrameTime: number;
  maxMemoryUsage: number;
  minFPS: number;
  maxRenderTime: number;
  maxUpdateTime: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    renderTime: 0,
    updateTime: 0,
    entityCount: 0,
    projectileCount: 0,
    droppedFrames: 0
  };

  private thresholds: PerformanceThresholds = {
    maxFrameTime: 16.67, // 60 FPS
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    minFPS: 55,
    maxRenderTime: 8,
    maxUpdateTime: 8
  };

  private frameHistory: number[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private lastFPSUpdate: number = 0;

  // Performance alerts
  private alerts: Map<string, number> = new Map();
  private listeners: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    if (typeof window !== 'undefined' && window.performance) {
      this.startMonitoring();
    }
  }

  /**
   * Record frame timing
   */
  recordFrame(frameTime: number): void {
    this.metrics.frameTime = frameTime;
    this.frameHistory.push(frameTime);
    
    // Keep only last 60 frames
    if (this.frameHistory.length > 60) {
      this.frameHistory.shift();
    }

    // Calculate FPS
    this.calculateFPS();

    // Check for dropped frames
    if (frameTime > this.thresholds.maxFrameTime) {
      this.metrics.droppedFrames++;
    }

    // Update memory usage
    this.updateMemoryUsage();

    // Check thresholds
    this.checkThresholds();
  }

  /**
   * Record render time
   */
  recordRenderTime(renderTime: number): void {
    this.metrics.renderTime = renderTime;
  }

  /**
   * Record update time
   */
  recordUpdateTime(updateTime: number): void {
    this.metrics.updateTime = updateTime;
  }

  /**
   * Update entity and projectile counts
   */
  updateCounts(entityCount: number, projectileCount: number): void {
    this.metrics.entityCount = entityCount;
    this.metrics.projectileCount = projectileCount;
  }

  /**
   * Calculate current FPS
   */
  private calculateFPS(): void {
    const now = performance.now();
    
    if (now - this.lastFPSUpdate >= 1000) {
      this.metrics.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFPSUpdate = now;
    } else {
      this.frameCount++;
    }
  }

  /**
   * Update memory usage
   */
  private updateMemoryUsage(): void {
    if (typeof window !== 'undefined' && (window as any).performance && (window as any).performance.memory) {
      this.metrics.memoryUsage = (window as any).performance.memory.usedJSHeapSize;
    }
  }

  /**
   * Check performance thresholds and trigger alerts
   */
  private checkThresholds(): void {
    const now = Date.now();
    
    // FPS threshold
    if (this.metrics.fps < this.thresholds.minFPS) {
      this.triggerAlert('low_fps', now);
    }

    // Memory threshold
    if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      this.triggerAlert('high_memory', now);
    }

    // Frame time threshold
    if (this.metrics.frameTime > this.thresholds.maxFrameTime) {
      this.triggerAlert('high_frame_time', now);
    }

    // Render time threshold
    if (this.metrics.renderTime > this.thresholds.maxRenderTime) {
      this.triggerAlert('high_render_time', now);
    }

    // Update time threshold
    if (this.metrics.updateTime > this.thresholds.maxUpdateTime) {
      this.triggerAlert('high_update_time', now);
    }
  }

  /**
   * Trigger performance alert
   */
  private triggerAlert(type: string, timestamp: number): void {
    const lastAlert = this.alerts.get(type);
    
    // Debounce alerts (max 1 per second)
    if (!lastAlert || timestamp - lastAlert > 1000) {
      this.alerts.set(type, timestamp);
      this.notifyListeners();
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance report
   */
  getReport(): {
    metrics: PerformanceMetrics;
    recommendations: string[];
    isHealthy: boolean;
  } {
    const recommendations: string[] = [];
    let isHealthy = true;

    // Check FPS
    if (this.metrics.fps < this.thresholds.minFPS) {
      recommendations.push('Frame rate is low - consider reducing visual complexity');
      isHealthy = false;
    }

    // Check memory
    if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      recommendations.push('Memory usage is high - consider reducing object pool size');
      isHealthy = false;
    }

    // Check entity count
    if (this.metrics.entityCount > 100) {
      recommendations.push('High entity count - consider culling distant entities');
    }

    // Check projectile count
    if (this.metrics.projectileCount > this.thresholds.maxMemoryUsage / 1000) {
      recommendations.push('High projectile count - consider projectile pooling');
    }

    return {
      metrics: this.getMetrics(),
      recommendations,
      isHealthy
    };
  }

  /**
   * Set performance thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Add performance listener
   */
  addListener(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of performance updates
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getMetrics()));
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    this.lastFrameTime = performance.now();
    this.lastFPSUpdate = performance.now();
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      renderTime: 0,
      updateTime: 0,
      entityCount: 0,
      projectileCount: 0,
      droppedFrames: 0
    };
    
    this.frameHistory = [];
    this.frameCount = 0;
    this.alerts.clear();
  }

  /**
   * Get frame time statistics
   */
  getFrameTimeStats(): {
    average: number;
    min: number;
    max: number;
    percentiles: {
      p50: number;
      p95: number;
      p99: number;
    };
  } {
    if (this.frameHistory.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        percentiles: { p50: 0, p95: 0, p99: 0 }
      };
    }

    const sorted = [...this.frameHistory].sort((a, b) => a - b);
    const average = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    
    return {
      average,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      percentiles: {
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)]
      }
    };
  }

  /**
   * Export performance data
   */
  exportData(): {
    metrics: PerformanceMetrics;
    frameHistory: number[];
    thresholds: PerformanceThresholds;
    timestamp: number;
  } {
    return {
      metrics: this.getMetrics(),
      frameHistory: [...this.frameHistory],
      thresholds: { ...this.thresholds },
      timestamp: Date.now()
    };
  }
}