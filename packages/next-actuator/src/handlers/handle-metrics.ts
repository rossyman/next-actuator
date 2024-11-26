import type { NextRequest } from 'next/server'
import type { NextActuatorConfig } from '../types/next-actuator-config'

export const handleMetrics = async (_: NextRequest, config: NextActuatorConfig): Promise<Response> => {
  const names = Object.keys(config.metrics)
  return Response.json({ names }, { status: 200 })
}
