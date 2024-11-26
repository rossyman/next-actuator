import type { NextRequest } from 'next/server'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { NextActuatorConfig } from '../types/next-actuator-config'

export const handleInfo = async (_: NextRequest, config: NextActuatorConfig): Promise<Response> => {

  const res = {
    build: await readFile(join(process.cwd(), '.next', 'BUILD_ID'), 'utf-8').catch(() => undefined),
    ...(config.info ? await config.info() : {})
  }

  return Response.json(res, { status: 200 })
}
