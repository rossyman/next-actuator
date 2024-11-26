import { map } from 'lodash-es'
import type { NextRequest } from 'next/server'
import type { NextActuatorConfig } from '../types/next-actuator-config'
import type { ValueOf } from '../types/value-of'

const evaluateComponent = async (req: NextRequest, name: string, component: ValueOf<NextActuatorConfig['components']>) => {
  const status = await component
    .status(req)
    .then((res) => (typeof res === 'boolean' ? res : res < 400) ? 'UP' : 'DOWN')
    .catch(() => 'DOWN')
  return [ name, { status, details: component.details } ] as const
}

export const handleHealth = async (req: NextRequest, config: NextActuatorConfig): Promise<Response> => {

  const results = await Promise
    .all(map(config.components, (component, name) => evaluateComponent(req, name, component)))

  const hasNormalDown = results.some(([name, result]) =>
    result.status === 'DOWN' && config.components[name].strategy !== 'DEGRADED'
  )

  const hasDegradedDown = results.some(([name, result]) =>
    result.status === 'DOWN' && config.components[name].strategy === 'DEGRADED'
  )

  const status = hasNormalDown ? 'DOWN' : hasDegradedDown ? 'DEGRADED' : 'UP'

  const res = {
    status,
    ...(results.length > 0 && { components: Object.fromEntries(results) })
  }

  return Response.json(res, { status: 200 })
}
