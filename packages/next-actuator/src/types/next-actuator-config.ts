import type { Component } from './component'
import type { Metric } from './metric'

export type NextActuatorConfig = {
  disabled: boolean
  endpoints: {
    health: string | false
    metrics: string | false
    info: string | false
  }
  components: Record<string, Component>
  metrics: Record<string, Metric>
  info?: () => Promise<Record<string, unknown>>
}
