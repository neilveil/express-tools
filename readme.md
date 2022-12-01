# Express Tools

Scalable & secure API server with statistics, status control, response handler module, logging, validations, integrated modules & multi-environment setup, fully compatible with nodeJS/nodeJS-alpine docker image.

## Docs

- [Environment](./docs/env.md)
- [Configuration](./docs/config.md)
- [Response](./docs/response.md)
- [Logs](./docs/logs.md)
- [Core API](./docs/api.md)

## Features

### Server statistics

- Request per second
- Total requests server
- Average response size
- Average request processing time

### Server status control

- Current server status
- Start/stop server
- Local/global auth

### Response handler

- Success
- Error
- Redirect
- Template

### Logs

- Request/Response logging
- Full error stack logging

### Validation

- Invalid request rejection
- Empty request validation
- Request validator

### Misc

- Multi-env control
- Compatible with alpine nodejs docker image
- Highly stable module with integrated automated testing flow

## Core

- server
- app

## Modules

- Request ($axios)
- Express ($express)
- Validation ($ajv, $joi)

## Helpers

- Encryption (_encrypt, _decrypt)
- Hashing (_md5)
- Response (_r)
- Validation (_validate, EMPTY_REQUEST)
- Express tools auth (_eta)

## Usage

```js
const {
  server,
  _r,
  _validate,
  $joi,
  _md5,
  _encrypt,
  _decrypt,
  _eta
} = require('express-tools')

const port = process.env.PORT

const app = server(port)


app.get(
  // Route
  '/test',

  // API validation with Joi example
  (req, res, next) =>
    _validate.joi(req, res, next, {
      name: $joi.string().min(3).required()
    }),

  // Controller
  (req, res) => _r.success({ req, res, message: 'Hey there!' })
)

app.get(
  // Secure route
  '/eta',

  // Express tools auth
  _eta,

  // Controller
  (req, res) => _r.success({ req, res, message: 'Hey there!' })
)

app.use('*', (req, res) =>
  _r.error({ req, res, httpCode: 404, message: 'Page not found' })
)

// Encrypt/Decrypt example
console.log(_decrypt(_encrypt('Hello!')))

// MD5 hashing example
console.log(_md5('Hello!'))
```

## Usage

Add `.env` file

```
PORT = 8080
```

Setup routes

```js
const { server, _r } = require('express-tools')

const port = process.env.PORT

const app = server(port)

app.get(
  // Route
  '/test',
  // Controller
  (req, res) => {
    // API logic here..
    _r.success({ req, res, message: 'This is a test route!' })
  }
)

app.use('*', (req, res) =>
  _r.error({ req, res, httpCode: 404, message: 'Page not found' })
)
```

Validate request with [Joi](https://joi.dev/)

```js
app.get(
  // Route
  '/joi',
  // Validator
  (req, res, next) => _validate.joi(req, res, next, { name: $joi.string().min(3).required() }),
  // Controller
  (req, res) => _r.success({ req, res })
)
```

Validate request with [Ajv](https://ajv.js.org/)

```js
app.get(
  // Route
  '/ajv',
  // Validator
  (req, res, next) =>
    _validate.ajv(req, res, next, {
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 3 }
      }
    }),
  // Controller
  (req, res) => _r.success({ req, res })
)
```
