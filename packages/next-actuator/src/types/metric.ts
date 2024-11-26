type BaseMetric = {
  /**
   * A description of the metric
   */
  description: string
  /**
   * The unit that the metric is represented in
   */
  baseUnit: string
}

type DimensionalMetric = BaseMetric & {
  /**
   * A collection of dimensions representing the aggregated metric value
   */
  dimensions: Record<string, {
    /**
     * The value of the dimension
     */
    value: () => Promise<number>
    /**
     * A description of the dimension
     */
    description: string
  }>
}

type SingularMetric = BaseMetric & {
  /**
   * The value of a metric
   */
  value: () => Promise<number>
}

export type Metric = DimensionalMetric | SingularMetric

export const isDimensionalMetric = (metric: Metric): metric is DimensionalMetric =>
  'dimensions' in metric
