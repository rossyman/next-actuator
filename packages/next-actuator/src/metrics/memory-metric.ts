import type { Metric } from '../types/metric'

const memoryUsage = process.memoryUsage()

export const memoryMetric: Metric = {
  description: 'Total memory used',
  baseUnit: 'bytes',
  dimensions: {
    heap: {
      value: async () => memoryUsage.heapUsed,
      description: 'Heap memory usage'
    },
    external: {
      value: async () => memoryUsage.external,
      description: 'Memory used by C++ objects bound to JavaScript'
    },
    arrayBuffers: {
      value: async () => memoryUsage.arrayBuffers,
      description: 'Memory used by array buffers'
    }
  }
}
