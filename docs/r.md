# Express Tools request/response handler

## Request

Format

```bash
REQ | Timestamp | {ET_ID_PREFIX} Request ID :: Method | Path | IP

REQ | 2023-08-24T07:16:23.652Z | 1 :: GET | /user/auth | 48.55.42.21
```

> ET_ID_PREFIX from .env

## Response

Format

```bash
Key | Timestamp | Request ID :: HTTP Code | Code | Messasge | Response Size | Processing Time

SCS | 2023-08-24T07:16:23.652Z | 1 :: 200 | OK | Successfully created | 24 | 64
ERR | 2023-08-24T07:16:23.652Z | 1 :: 500 | ERROR | User not found! | 24 | 64
RDR | 2023-08-24T07:16:23.652Z | 1 :: 302 | - | https://redirect.com" | - | 64
TPL | 2023-08-24T07:16:23.652Z | 1 :: 200 | - | page/product/info | 24 | 64
```

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
  error // Optional, error object
})
```

**File response**

```js
_r.file({
  req, // Required
  res, // Required
  httpCode: 200, // Optional, default: 200
  path: 'download/file.txt' // Required, file path w.r.t project root
})
```

**Template response**

```js
_r.template({
  req, // Required
  res, // Required
  httpCode: 200, // Optional, default: 200
  path: 'pages/home', // Required, template path w.r.t template directory, "app.set('views', 'templates')"
  payload: {} // Optional, default: {}, Set data to be in template
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

> There is one more key `skip` in all response types which can be passed to just log response. In that case you are handling the response by yourself.
