'use client';

if (typeof window !== 'undefined' && window.performance && typeof window.performance.measure === 'function') {
  const originalMeasure = window.performance.measure.bind(window.performance);
  window.performance.measure = function (
    measureName: string,
    startOrMeasureOptions?: string | PerformanceMeasureOptions,
    endMark?: string,
  ) {
    try {
      if (typeof startOrMeasureOptions === 'object' && startOrMeasureOptions !== null) {
        if (typeof startOrMeasureOptions.end === 'number' && startOrMeasureOptions.end < 0) {
          startOrMeasureOptions = { ...startOrMeasureOptions, end: 0 };
        }
        if (typeof startOrMeasureOptions.start === 'number' && startOrMeasureOptions.start < 0) {
          startOrMeasureOptions = { ...startOrMeasureOptions, start: 0 };
        }
      }
      return originalMeasure(measureName, startOrMeasureOptions as any, endMark);
    } catch (e: any) {
      // Gracefully prevent browser crash when end/start timestamps are negative
      if (e?.message?.includes('cannot be negative') || e?.name === 'TypeError') {
        return undefined as any;
      }
      throw e;
    }
  };
}

export function PerformancePolyfill() {
  return null;
}

