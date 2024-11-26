import type { Metric } from '../types/metric'

export const uptimeMetric: Metric = {
  description: 'Application uptime',
  baseUnit: 'seconds',
  value: async () => process.uptime()
}
