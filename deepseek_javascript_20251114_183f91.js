class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
  }

  startMeasure(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  endMeasure(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      // Log if duration exceeds threshold
      if (metric.duration > 1000) { // 1 second threshold
        console.warn(`Performance warning: ${name} took ${metric.duration}ms`);
        
        // Send to analytics
        this.reportMetric(name, metric.duration);
      }
    }
  }

  reportMetric(name, duration) {
    // Send to your analytics service
    if (navigator.sendBeacon) {
      const data = new Blob([JSON.stringify({
        name,
        duration,
        url: window.location.href,
        timestamp: new Date().toISOString()
      })], { type: 'application/json' });
      
      navigator.sendBeacon('/api/analytics/performance', data);
    }
  }

  observeLargestContentfulPaint() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      console.log('LCP:', lastEntry.startTime);
      this.reportMetric('LCP', lastEntry.startTime);
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  observeFirstInputDelay() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        const delay = entry.processingStart - entry.startTime;
        console.log('FID:', delay);
        this.reportMetric('FID', delay);
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
  }
}

export const performanceMonitor = new PerformanceMonitor();