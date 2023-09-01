# Express Tools - The Server Wizard

[![Downloads](https://img.shields.io/npm/dm/express-tools.svg)](https://www.npmjs.com/package/express-tools) [![Version](https://img.shields.io/npm/v/express-tools.svg)](https://www.npmjs.com/package/express-tools)

Elevate your Express applications to new heights with Express Tools, a comprehensive framework designed to supercharge your backend development experience.

While [Express](https://expressjs.com/) remains renowned for its simplicity and minimalism, harnessing its full potential often demands meticulous configuration, especially when preparing for production deployment.

## Why Choose Express Tools?

**Streamlined Configuration**: Express Tools takes care of all essential middleware and error handler setup within Express, sparing you from the intricacies of initial configuration.

**Empowering Helpers**: Benefit from a rich array of dedicated helpers tailored for validations, responses, logging, encryption, caching, and more. These fundamental functionalities form the backbone of any robust backend server.

**Reliable Stability**: Core server functionalities should be consistently updated and rigorously tested before deployment. By utilizing Express Tools, you can focus on developing your application, secure in the knowledge that configuration complexities are expertly handled.

Experience the Efficiency - Start Your Server in Just Two Lines:

```js
const server = require('express-tools')
server()
```

## Docs

### [Environment](./docs/env.md)

No need to rely on some package to read environment variables from `.env` file.

```js
const { _env } = require('express-tools')
console.log(_env('MY_VAR'))
```

### Build API

```js
const { server, _r } = require('express-tools')
const app = server(8080)

app.get('/status', (req, res) => {
  _r.success({ req, res })
})

app.get('/api/my-api', (req, res) => {
  _r.success({ req, res, payload: { data: 'Hello there!' } })
})

app.use('*', (req, res) => {
  _r.error({ req, res, httpCode: 404, code: 'NOT_FOUND', message: 'Page not found!' })
})
```

### [Response module](./docs/r.md)

Get rid of uneven responses from the server.

**Success response**

```js
const { _r } = require('express-tools')

// Success response
app.get('/example-api', (req, res) => {
  _r.success({ req, res, payload: { data: 'Hello there!' }, message: '' })
})
```

Response

```json
{
  "id": 1,
  "code": "OK",
  "message": "",
  "payload": { "data": "Hello there!" }
}
```

To log request/response, set `ET_LOGS` environment variable to `yes` in the `.env` file

```js
ET_LOGS = yes
```

**Error response**

```js
// Error response
app.get('/example-error', (req, res) => {
  try {
    const a = {}
    a.b.c()
    _r.success({ req, res })
  } catch (error) {
    _r.error({ req, res, error, message: 'Some error occurred!' })
  }
})
```

To log complete error details, set the `ET_DEBUG` environment variable to `yes` in the `.env` file

```js
ET_DEBUG = yes
```

**Render views from `.ejs` templates**

Set views directory path in the `.env` file

```js
ET_VIEWS_DIR = ./views
```

```js
app.get('/example-render', (req, res) => {
  _r.render({ req, res, path: 'page/home', payload: { data: 'abc' } })
})
```

Project structure

```
/views
  /pages
    /home.ejs
.env
index.js
```

[EJS](https://ejs.co/) templating engine is used. Payload is passed to the template.

**Static files**

To serve static files from a directory, set static directory path variable in the `.env` file

```js
ET_STATIC_DIR = ./public
```

Project structure

```
/public
  /example.txt
.env
index.js
```

Example file will be available at `{HOST}/example.txt`

To append root path, set static root variable in the `.env` file

```js
ET_STATIC_ROOT = /static
```

Now the example file will be available at `{HOST}/static/example.txt`

**Redirect response**

```js
app.get('/example-redirect', (req, res) => {
  _r.redirect({ req, res, path: '/redirect-to-path' })
})
```

**Dead request**

Express Tools itself handles dead requests, the error you get when you try to send the response when it's already sent once. Even though the error is handled by Express Tools still it logs the error in the console with the request ID to detect the API causing the problem.

```js
app.get('/dead', (req, res) => {
  _r.success({ req, res })
  _r.success({ req, res }) // <- This should log the error, as response is already sent!
})
```

### Request validation

Using [Joi](https://joi.dev/)

```js
app.get(
  // Route
  '/joi',

  // Validator
  (req, res, next) => {
    return _validate.joi(req, res, next, {
      name: $joi.string().min(3).required()
    })
  },

  // Controller
  (req, res) => {
    return _r.success({ req, res })
  }
)
```

Using [AJV](https://ajv.js.org/)

```js
app.get(
  // Route
  '/ajv',

  // Validator
  (req, res, next) => {
    return _validate.ajv(req, res, next, {
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 3 }
      }
    })
  },

  // Controller
  (req, res) => {
    return _r.success({ req, res })
  }
)
```

- Use Joi if you want simplicity.
- Use AJV if you want stability.
- ET automatically rejects invalid requests

To ensure an empty request is received from the server `EMPTY_REQUEST` helper can be used.

```js
app.get('/empty', EMPTY_REQUEST, (req, res) => _r.success({ req, res }))
```

Reading validated data in the controller

```js
;(req, res) => {
  const name = req.bind.name
  console.log(name)

  _r.success({ req, res })
}
```

### Tiny DB

Store data on the server with TDB

```js
const { _tdb } = require('express-tools')

// Initialize
_tdb.init()

// Set `abc`
_tdb.set('abc', 'xyz')

// Read key `abc`
console.log(_tdb.get('abc'))

// Clear key `abc`
_tdb.clear('abc')

// Clear all data
_tdb.clear()
```

TDB saves all the data in `.tdb.json`. To use a custom file set the file name in env variable `ET_TDB_FILE`.

### Server insights

- Request per second
- Total requests server
- Average response size
- Average request processing time

```js
const { _r } = require('express-tools')

console.log({
  rps: _r.getRPS(), // Requests per second
  totalRequestsServed: _r.getTotalRequestsServed()
  avgProcessionTime: _r.getAvgProcessionTime(),
  avgResponseSize: _r.getAvgResponseSize(),
})
```

### Encryption & hashing

```js
// Encrypt/Decrypt example
const encryptedText = _encrypt('Hello!', 'my-secure-key')
const decryptedText = _decrypt(encryptedText, 'my-secure-key')

// MD5 hashing example
console.log(_md5('Hello!'))
```

### Templating

Express Tools support [EJS](https://ejs.co/) templating out of the box with render type response.

```js
_r.render({ req, res, path: 'page/home', payload: { data: 'abc' } })
```

> Do not forget to set `ET_VIEWS_DIR` variable in the `.env` file, check response module usage above for more details.

## Misc

- Set `ET_DELAY` env variable to add a custom delay (in milliseconds) in response. It is generally used in testing.

- To Append request/response logs ID with a custom text, set the custom text in `ET_ID_PREFIX` env variable. Generally used in microservice architecture to detect the particular server from which the request is sent.

- To manually initialize response module set `ET_AUTO_INIT_R = no`. It's used when requests are handled & returned by your middleware before response module. To initialize response module, `app.use(_r.init)`

## Exported modules

- Request (`$axios`)
- Express (`$express`)
- Validation (`$ajv`, `$joi`)
- Chalk (`$chalk`)

## All Express Tools `.env` variables

```py
# Server port
ET_PORT=8080

# Log request/response
ET_LOGS=yes
# Log complete errors
ET_DEBUG=yes

# Static directory
ET_VIEWS_DIR=./views

# Static files directory
ET_STATIC_DIR=./public
# Static files root
ET_STATIC_ROOT=/static

# Mic
ET_DELAY=
ET_ID_PREFIX=
ET_AUTO_INIT_R=
```

## Demo project

Check the demo proejct build with `express-tools` present in `demo` directory.

## Developer

Developed & maintained by [neilveil](https://github.com/neilveil). Give a star to support my work.
