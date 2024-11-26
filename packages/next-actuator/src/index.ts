import { merge } from 'lodash-es'
import { notFound } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { handleHealth } from './handlers/handle-health'
import { handleInfo } from './handlers/handle-info'
import { handleMetric } from './handlers/handle-metric'
import { handleMetrics } from './handlers/handle-metrics'
import { cpuMetric } from './metrics/cpu-metric'
import { memoryMetric } from './metrics/memory-metric'
import { uptimeMetric } from './metrics/uptime-metric'
import type { NextActuatorConfig } from './types/next-actuator-config'
import type { Optional } from './types/optional'

export type { NextActuatorConfig }
export type { Component } from './types/component'
export type { Metric } from './types/metric'

export const createNextActuator = (actuatorConfig?: Optional<NextActuatorConfig>) => {

  const config: NextActuatorConfig = merge(
    {
      disabled: false,
      components: {},
      excludeInfo: [],
      metrics: {
        'memory.used': memoryMetric,
        'cpu.used': cpuMetric,
        'uptime': uptimeMetric
      },
      endpoints: {
        health: '/health',
        metrics: '/metrics',
        info: '/info'
      }
    },
    actuatorConfig
  )

  const handlers: [string, (req: NextRequest, config: NextActuatorConfig) => Promise<Response>][] = []

  if (!config.disabled) {

    if (config.endpoints.health !== false) {
      handlers.push([ config.endpoints.health, handleHealth ])
    }

    if (config.endpoints.metrics !== false) {
      handlers.push([ config.endpoints.metrics, handleMetrics ])

      Object
        .entries(config.metrics)
        .forEach(([name, metric]) => handlers.push([ `${config.endpoints.metrics}/${name}`, handleMetric(name, metric) ]))
    }

    if (config.endpoints.info !== false) {
      handlers.push([ config.endpoints.info, handleInfo ])
    }
  }

  const GET = async (req: NextRequest) => {

    const path = req.nextUrl.pathname
    const handler = handlers.find(([endpoint]) => path.endsWith(endpoint))?.[1]

    if (handler) {
      return handler(req, config)
    }

    notFound()
  }

  return { GET }
}
