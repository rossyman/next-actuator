import { sum } from 'es-toolkit'
import { notFound } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { isDimensionalMetric, type Metric } from '../types/metric'

const createMetric = (name: string, description: string, baseUnit: string, value: number, availableDimensions: string[]) => ({
  name,
  description,
  baseUnit,
  measurements: [ { statistic: 'VALUE', value } ],
  availableDimensions
})

const evaluateMetric = async (name: string, metric: Metric, dimension: string | null) => {

  if (!isDimensionalMetric(metric)) {
    return createMetric(name, metric.description, metric.baseUnit, await metric.value(), [])
  }

  if (!dimension) {
    const aggregatePromises = Object.values(metric.dimensions).map(dimension => dimension.value())
    const aggregateValue = sum(await Promise.all(aggregatePromises))
    return createMetric(name, metric.description, metric.baseUnit, aggregateValue, Object.keys(metric.dimensions))
  }

  const foundDimension = metric.dimensions[dimension]

  if (foundDimension) {
    return createMetric(name, foundDimension.description, metric.baseUnit, await foundDimension.value(), [])
  }

  notFound()
}

export const handleMetric = (name: string, metric: Metric) => {
  return async (req: NextRequest): Promise<Response> => {
    const dimension = req.nextUrl.searchParams.get('dimension')
    return Response.json(await evaluateMetric(name, metric, dimension), { status: 200 })
  }
}
