# Next Actuator

Next actuator provides a suite of production-ready observability endpoints to monitor and audit the health, metrics, and
general status of your application. The library is loosely inspired by Spring Actuator.

## Installation

```bash
  npm install next-actuator
  bun add next-actuator
  pnpm add next-actuator
  yarn add next-actuator
```

## Usage

### Route handler

Create a new route handler, nominally at `/app/api/actuator/[...actuator]/route.ts`, and re-export the `GET` function
returned by `createNextActuator()`.

```typescript
import { createNextActuator } from 'next-actuator'

const { GET } = createNextActuator()

export { GET }
```

## API Reference

| Endpoint                             | Configure          | Description                                        |
|:-------------------------------------|:-------------------|:---------------------------------------------------|
| `/health`                            | `endpoints.health` | Displays application and component statuses        |
| `/info`                              | `endpoints.info`   | Displays build and metadata information            |
| `/metrics`                           | `endpoint.metrics` | Displays a list of all available metrics           |
| `/metrics/<metric>`                  |                    | Displays aggregate information about a metric      |
| `/metrics/<metric>?dimension=<name>` |                    | Displays information about a dimension of a metric |

## Configuration

| **Property**        | **Type**                                 | **Description**                                                         | **Default**          |
|---------------------|------------------------------------------|-------------------------------------------------------------------------|----------------------|
| `disabled`          | `boolean`                                | Whether to disable all endpoints, useful for disabling per-environment. | `false`              |
| `endpoints.health`  | `string \| false`                        | Configure the health endpoint or disable it.                            | `'/health'`          |
| `endpoints.metrics` | `string \| false`                        | Configure the metrics endpoint or disable it.                           | `'/metrics'`         |
| `endpoints.info`    | `string \| false`                        | Configure the info endpoint or disable it.                              | `'/info'`            |
| `components`        | `Record<string, Component>`              | Register your application components.                                   |                      |
| `metrics`           | `Record<string, Metric>`                 | Register your custom metrics.                                           | See included metrics |
| `info`              | `() => Promise<Record<string, unknown>>` | Application details, nominally elements from `package.json` and git     |                      |

## Health

### Create a component

Components represent a segment of your apps general availability. If one of these components were to go down, then the
functionality of your application would be greatly degraded. By default, an outage returns a `'DEGRADED'` response.

There may be some instances in which you cannot recover from an external provider outage. Therefore, you can configure
the aggregate status by providing `strategy: 'DOWN'` to ensure your app is marked as `'DOWN'` during this period.

| **Property** | **Type**                                           | **Description**                                                            |
|--------------|----------------------------------------------------|----------------------------------------------------------------------------|
| `status`     | `(req: NextRequest) => Promise<number \| boolean>` | Return the status of a component, either as a boolean or HTTP status code. |
| `strategy`   | `'DEGRADED' \| 'DOWN'`                             | Tells the actuator how it should handle aggregating outage statuses        |
| `details`    | `Record<string, unknown>`                          | Any extra metadata you wish to include alongside the component status.     |

### Usage

```typescript
import { createNextActuator, type Component } from 'next-actuator'

const api: Component = {
  status: async () => fetch('https://api.acme.org').then(res => res.status),
  details: {
    description: 'Our application\'s external API',
    endpoint: 'https://api.acme.org'
  }
}

const { GET } = createNextActuator({
  components: {
    api
  }
})

export { GET }
```

### Sample response

```json
{
  "status": "UP",
  "components": {
    "api": {
      "status": "UP",
      "details": {
        "description": "Our application's external API",
        "endpoint": "https://api.acme.org"
      }
    }
  }
}
```

## Metrics

### Included metrics

By default, we collect some metrics that may be useful for auditing your app, namely: `memory.used`, `cpu.used` and
`uptime`.

### Create a Metric

Metrics come in two different shapes. You can either supply a straightforward singular metric, or a dimensional metric.

Dimensional metrics are aggregated, but an optional search parameter can be supplied to the metrics endpoint in order to
filter.

| **Property**  | **Type**                                                                | **Description**                                                      |
|---------------|-------------------------------------------------------------------------|----------------------------------------------------------------------|
| `description` | `string`                                                                | A description of the metric.                                         |
| `baseUnit`    | `string`                                                                | The unit that the metric is represented in.                          |
| `value`       | `() => Promise<number>`                                                 | The value of a metric.                                               |
| `dimensions`  | `Record<string, { value: () => Promise<number>, description: string }>` | A collection of dimensions representing the aggregated metric value. |

### Usage

```typescript
import { createNextActuator, type Metric } from 'next-actuator'

const complexSeconds: Metric = {
  description: 'Total time in seconds',
  baseUnit: 'seconds',
  dimensions: {
    first: {
      value: async () => 10,
      description: 'Some seconds'
    },
    second: {
      value: async () => 11,
      description: 'Some more seconds'
    }
  }
}

const simpleSeconds: Metric = {
  description: 'My super simple seconds metric',
  baseUnit: 'seconds',
  value: async () => 1
}

const { GET } = createNextActuator({
  metrics: {
    'complex.seconds': complexSeconds,
    'simple.seconds': simpleSeconds
  }
})

export { GET }
```

### Sample responses

#### `/metrics`

```json
{
  "names": [
    "memory.used",
    "cpu.used",
    "uptime",
    "complex.seconds",
    "simple.seconds"
  ]
}
```

#### `/metrics/{name}`

This request displays an aggregate view of all given dimensions (If present), or the returned value of the simple
metric.

```json
{
  "name": "complex.seconds",
  "description": "Total time in seconds",
  "baseUnit": "seconds",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 21
    }
  ],
  "availableDimensions": [
    "first",
    "second"
  ]
}
```

#### `/metrics/{name}?dimension={dimension}`

This request only displays information related to the filtered dimension

```json
{
  "name": "complex.seconds",
  "description": "Some seconds",
  "baseUnit": "seconds",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 10
    }
  ],
  "availableDimensions": [
  ]
}
```

## Info

The info endpoint by default returns the `BUILD_ID` generated by Next.js out of the box.
Read [these docs](https://nextjs.org/docs/app/api-reference/next-config-js/generateBuildId) to learn how to customise
your `BUILD_ID`.

Besides `BUILD_ID`, Next.js automatically strips a lot of the other files we could use to enrich the `/info`
endpoint (i.e.: `package.json` and `.git/`).

Therefore, if you want to include any of those extra details, you'll need to manually include them in the `/info`
response. The usage below outlines an example of how to do this with a combination of
[`properties-reader`](https://npmjs.com/package/properties-reader) and
[`node-git-info`](https://npmjs.com/package/node-git-info).

### Usage

```typescript
import { createNextActuator } from 'next-actuator'
import { name, version, description, author } from '@/package.json'
import { join } from 'node:path'
import propertiesReader from 'properties-reader'

const { GET } = createNextActuator({
  components: {
    internal,
    external
  },
  info: async () => {
    const gitInfo = propertiesReader(join(process.cwd(), 'git.properties'))
    return {
      application: {
        name,
        version,
        description,
        author
      },
      git: {
        time: gitInfo.get('git.commit.time'),
        branch: gitInfo.get('git.branch'),
        id: {
          full: gitInfo.getRaw('git.commit.id'),
          short: gitInfo.getRaw('git.commit.id.abbrev')
        },
        message: {
          full: gitInfo.get('git.commit.message.full'),
          short: gitInfo.get('git.commit.message.short')
        },
        author: {
          email: gitInfo.get('git.commit.user.email'),
          name: gitInfo.get('git.commit.user.name')
        }
      }
    }
  }
})

export { GET }
```

### Sample response

```json
{
  "build": "cc31f8f",
  "application": {
    "name": "next-actuator-app",
    "version": "0.0.0",
    "description": "A fully composable actuator implementation for Next.js projects",
    "author": "Ross MacPhee (https://ross.software)"
  },
  "git": {
    "time": "2024-11-26T12:00:00.000Z",
    "branch": "main",
    "id": {
      "full": "cc31f8f8838f24b9490660fa4f89470c9850be36",
      "short": "cc31f8f"
    },
    "message": {
      "full": "Initial commit",
      "short": "Initial commit"
    },
    "author": {
      "email": "r@acme.org",
      "name": "Ross MacPhee"
    }
  }
}
```
