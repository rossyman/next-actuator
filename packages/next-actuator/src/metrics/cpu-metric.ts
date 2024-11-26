import type { Metric } from '../types/metric'

const cpuUsage = process.cpuUsage()

export const cpuMetric: Metric = {
  description: 'Total CPU usage',
  baseUnit: 'microseconds',
  dimensions: {
    user: {
      value: async () => cpuUsage.user,
      description: 'CPU time spent in user mode'
    },
    system: {
      value: async () => cpuUsage.system,
      description: 'CPU time spent in system mode'
    }
  }
}
