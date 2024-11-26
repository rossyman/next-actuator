import type { NextRequest } from 'next/server'

export type Component = {
  /**
   * Return the status of a component, either as a boolean or HTTP status code
   * @param req The request being received by Next.js
   */
  status: (req: NextRequest) => Promise<number | boolean>
  /**
   * How outages should be aggregated
   */
  strategy?: 'DEGRADED' | 'DOWN'
  /**
   * Any extra metadata you wish to include alongside the component status
   */
  details: Record<string, unknown>
}
