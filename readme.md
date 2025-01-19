# Express Tools - The Server Wizard 🚀

[![Downloads](https://img.shields.io/npm/dm/express-tools.svg)](https://www.npmjs.com/package/express-tools) [![Version](https://img.shields.io/npm/v/express-tools.svg)](https://www.npmjs.com/package/express-tools)

**Strictly typed, production-ready, no-configuration server.**

Express Tools allows you to build a **conventional API server** or a **strictly typed server** using **Typed Bridge**. It simplifies server development with minimal setup, making it easier to maintain type safety across the backend and frontend.

## 🌟 Key Features

- **API Server**: Production ready API server with 0 configuration.
- **Typed Bridge**: Strictly typed server functions tightly coupled with front-end.

## 📦 Installation

Install Express Tools via npm:

```bash
npm i express-tools
```

## Build API Server

API server components:

- Express App: `const app = createApp()`
- Server: `const server = startServer(app, 8080)`
- Controller: `_c(async (args, context) => {})`
- Validator: Request handler `_v({})`
- Context middleware: `etConfig.logs.contextParser = (req: Request) => { return {} }`

### Create express app & start server

```ts
import { createApp, startServer } from 'express-tools'

const app = createApp()
const server = startServer(app, 8080)
```

Test server: `http://localhost:8080/health`

### Add new route

```ts
import { _c } from 'express-tools'

app.post(
  // Route
  '/demo',
  // Controller
  _c(async (args: { id: number }) => {
    console.log(args.id)
    return { id: args.id, name: 'Express Tools' }
  })
)
```

### Validate request with `zod`

```ts
import { _c, $z } from 'express-tools'

const demoRequest = { id: $z.number().min(1) }

app.post(
  // Route
  '/demo',
  // Validator
  _v({ id: $z.number().min(1) }),
  // Controller
  _c(async (args: { id: number }) => {
    return { id: args.id, name: 'Express Tools' }
  })
)
```

Use `ajv` or `joi` validator

```ts
// AJV
import { $a } from 'express-tools'
etConfig.validator = 'ajv'

// Joi
import { $j } from 'express-tools'
etConfig.validator = 'joi'
```

### Add context middleware

```ts
import { etConfig } from 'express-tools'

type context = {
  name: string
  authorization: string
}

etConfig.contextParser = (req: Request): context => {
  const headers = req.headers
  return { name: 'Express Tools', authorization: headers.authorization || 'NO_AUTH' }
}

app.post(
  // Route
  '/demo',
  // Validator
  _v({ id: $z.number().min(1) }),
  // Controller
  _c(async (args: { id: number }, context: context) => {
    return { id: args.id, name: context.name }
  })
)
```

## Build Typed Bridge

Typed Bridge components:

- Bridge file: Main bridge file from which types are exported for front-end.
- Paths: Server function path like `user.fetch`, similar to routes.
- Server functions: Actual server function which holds the business logic, similar to controller.
- Context parser: To provide context from request to server functions.
- Arguments: Server function arguments.
- Context: Server function context parsed with context parser.

### Create express app & start server

`server.ts`

```ts
import { createApp, startServer } from 'express-tools'

const app = createApp()
const server = startServer(app, 8080)
```

### Create Bridge

`bridge/index.ts`

```ts
import * as user from './user.bridge'

export default {
  'user.fetch': user.fetch,
  'user.update': user.update
}
```

`bridge/user.bridge.ts`

```ts
export const fetch = async (
  args: { id: number },
  context: { name: string; authorization: string }
): { id: number; name: string } => {
  return { id: args.id, name: 'Express Tools' }
}

export const update = async () => {}
```

`server.ts`

```ts
import { createBridge } from 'express-tools'

app.use('/bridge', createBridge(bridge))
```

### Call Typed Bridge functions from front-end

Generate typed bridge file

`package.json`

```json
{
  "scripts": {
    "gen-typed-bridge": "express-tools gen-typed-bridge --src ./src/bridge/index.ts --dest ./typedBridge.ts --host 'http://localhost:8080'"
  }
}
```

Import generated `typedBridge.ts` file in front-end & call server functions.

```ts
import typedBridge from './typedBridge'

..

const user = await typedBridge['user.fetch']({ id: 1 })
```

> Generated Typed Bridge file can also be hosted publicly as it's doesn't contains any code, only the server functions schema. Every time front-end server started, it can be automatically synced using tools like [clone-kit](https://www.npmjs.com/package/clone-kit).

## Express Tools config

```ts
import { etConfig } from 'express-tools'

etConfig.logs.request = true // Enable request logging
etConfig.logs.requestData = false // Enable request data logging, request query & body
etConfig.logs.response = true // Enable response logging
etConfig.logs.error = true // Enable error logging

etConfig.logs.idPrefix = '' // Request id prefix (useful in tracing request in microservice architecture)
etConfig.logs.delay = 0 // Custom delay in milliseconds
etConfig.logs.validator = 'zod' // Validator to use inside `_v`
etConfig.logs.contextParser = (req: Request) => {} // Middleware to add context with the request
```

## Developer

Developed & maintained by [neilveil](https://github.com/neilveil). Give a star to support my work.
