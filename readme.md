# Express Tools

Scalable & secure API server with statistics, status control, response handler, logging, validations, integrated modules & multi-environment setup, fully compatible with nodeJS/nodeJS-alpine docker image.

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
- Joi ($joi)

## Helpers

- Encryption (_encrypt, _decrypt)
- Hashing (_md5)
- Response (_r)
- Validation (_validate, EMPTY_REQUEST)

## Environment variables

`ENVF`

Defines which environment file you want to use. Default is `.env`.

---

`ET_LOGS` (yes | no) Default: no

Print request and response logs.

---

`ET_DEBUG` (yes | no) Default: no

Print full error stack on error response.

---

`ET_AUTH_TOKEN`

Token to access core APIs. Assume if your token is `ET_AUTH_TOKEN = test`, then you need to pass `098f6bcd4621d373cade4e832627b4f6` as `Authorization` header key. `md5('test') = '098f6bcd4621d373cade4e832627b4f6'`

---

`ET_AUTH_URL`

To authenticate server from other server. Authorization header is forwared to this url and it should return 200 for successful authentication.

---

`ET_CORE_KEY`

Key at which you want to host core APIs. If `ET_CORE_KEY = core` then your status API url will be `{host}/core/status`

---

`ET_PERSISTENT_ID` (yes | no) Default: no

Each response returned from the server has an unique integral ID. But it's stored in the memory, so when the server restarts it again starts from 1. So to persist it's value, it need to be stored on the server which creates a `.et` at root of the project.

---

`ET_SID`

All response ID will always be unique if `ET_PERSISTENT_ID` is `yes`, but if you are running multiple containers of your application then the request ID will again clash as all the servers will start the ID from 0. So to bind each response with an unique ID, a server ID need to attached with each response. And now using this information, server from which the response was served and the response can be uniquely tracked.

For e.g. while running multiple containers of your application with docker, container ID can be used as server ID which you find as `HOSTNAME` environment variable in your application. So to set server server ID you just need to do `process.env.ET_SID = process.env.HOSTNAME` at the top of your main enrty file of your application.

---

`ET_ENC_KEY`
`ET_ENC_IV`

Set these to use `_encrypt` & `_decrypt` helpers.

---

`ET_DELAY`

To add a custom delay in all request served from the server in milliseconds. Very helpful in development mode to test the impact of slow API response on the application.

## Commong gitignore file

```
*.et

*.env
!.dummy.env

node_modules
```

## Core API

```
ET_CORE_KEY = core
```

---

`/core/status`

To get Application status

---

`/core/mirror`

To test request received by server

---

`/core/stop`*

To temporarily stop server. To start the server again, start API need to be called. Server starts again if server is restarted.

---

`/core/start`*

To start server

---

`/core/stats`*

To get server statistics

---

> *Authentication required

## Example server

```js
const {
  server,
  _r,
  _validate,
  $joi,
  _md5,
  _encrypt,
  _decrypt,
} = require('express-tools')

const port = process.env.PORT

const app = server(port)

app.use(
  '/api/test',
  (req, res, next) =>
    // API validation with Joi example
    _validate(req, res, next, {
      name: $joi.string().min(3).required(),
    }),
  (req, res) => {
    _r.success({ req, res, message: 'Hey there!' })
  }
)

app.use('*', (req, res) =>
  _r.error({ req, res, httpCode: 404, message: 'Page not found' })
)

// Encrypt/Decrypt example
console.log(_decrypt(_encrypt('Hello!')))

// MD5 hashing example
console.log(_md5('Hello!'))
```

## Logs format

**Request**

`REQ | Timestamp | ?{Server ID} :: ID | Method | Path | IP`

**Success Response**

`SCS | Timestamp | ?{Server ID} :: ID | HTTP code | Code | Message | Response size | Response processing time`

**Error Response**

`ERR | Timestamp | ?{Server ID} :: ID | HTTP code | Code | Message | Response size | Response processing time`

**Template Response**

`TPL | Timestamp | ?{Server ID} :: ID | HTTP code | Template path | Response size | Response processing time`

**File Response**

`FIL | Timestamp | ?{Server ID} :: ID | HTTP code | File path | Response processing time`

**Redirect Response**

`RDR | Timestamp | ?{Server ID} :: ID | HTTP code | Redirect URL | Response processing time`

## Response helper

**Success response**

```js
_r.success({
  req, // Required
  res, // Required
  httpCode: 200, // Optional, default: 200
  code: 'CREATED', // Optional, default: 'OK'
  message: 'User successfully created', // Optional, default: ''
  payload: {} // Optional, default: {}
})
```

**Error response**

```js
_r.error({
  req, // Required
  res, // Required
  httpCode: 500, // Optional, default: 500
  code: 'DB_ERROR', // Optional, default: 'ERROR'
  message: 'DB error', // Optional, default: ''
  error, // Optional, error object
})
```

**File response**

```js
_r.file({
  req, // Required
  res, // Required
  httpCode: 200, // Optional, default: 200
  path: 'download/file.txt', // Required, file path w.r.t project root
})
```

**Template response**

```js
_r.template({
  req, // Required
  res, // Required
  httpCode: 200, // Optional, default: 200
  path: 'pages/home', // Required, template path w.r.t template directory, "app.set('views', 'templates')"
  payload: {} // Optional, default: {}
})
```

**Redirect response**

```js
_r.redirect({
  req, // Required
  res, // Required
  httpCode: 302, // Optional, default: 302
  redirect: 'https://example.com' // Required, redirect URL
})
```
