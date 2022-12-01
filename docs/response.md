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
