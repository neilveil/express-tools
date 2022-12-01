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

## Commong gitignore file

```
*.et

*.env
!.template.env

node_modules
```
