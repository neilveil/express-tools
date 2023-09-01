// Replace '../build/index' with 'express-tools'
import { server, _r, _md5, _encrypt, _decrypt, _validate, $joi, _env, EMPTY_REQUEST } from '../build/index'
import api from './api'

const app = server(_env('PORT'))

// GET: http://localhost:8080/success
app.get('/success', (req, res) => _r.success({ req, res, payload: { a: 1 } }))

// GET: http://localhost:8080/error
app.get('/error', (req, res) => {
  try {
    const a: any = {}
    a.b.c()
    _r.success({ req, res })
  } catch (error) {
    _r.error({ req, res, error, message: 'Some error occurred!' })
  }
})

// GET: http://localhost:8080/render
app.get('/render', (req, res) => _r.render({ req, res, path: 'demo', payload: { data: 'abc' } }))

// GET: http://localhost:8080/redirect
app.get('/redirect', (req, res) => _r.redirect({ req, res, path: '/success' }))

// GET: http://localhost:8080/skip
app.get('/skip', (req, res) => {
  res.sendStatus(200)
  _r.success({ req, res, code: 'OK', message: 'Testing response!', skip: true })
})

// GET: http://localhost:8080/dead
app.get('/dead', (req, res) => {
  _r.success({ req, res })
  _r.success({ req, res })
})

// GET: http://localhost:8080/stats
app.get('/stats', (req, res) => {
  const stats = {
    avgProcessionTime: _r.getAvgProcessionTime(),
    avgResponseSize: _r.getAvgResponseSize(),
    rps: _r.getRPS(),
    totalRequestsServed: _r.getTotalRequestsServed()
  }

  console.log(stats)

  _r.success({ req, res, payload: stats })
})

// Success - GET: http://localhost:8080/joi?name=abc
// Error - GET: http://localhost:8080/joi?name=ab
app.get(
  '/joi',
  (req, res, next) =>
    _validate.joi(req, res, next, {
      name: $joi.string().min(3).required()
    }),
  (req, res) => {
    const _req: any = req
    const name = _req.bind.name

    console.log(name)

    _r.success({ req, res })
  }
)

// Success - GET: http://localhost:8080/ajv?name=abc
// Error - GET: http://localhost:8080/ajv?name=ab
app.get(
  '/ajv',
  (req, res, next) =>
    _validate.ajv(req, res, next, {
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 3 }
      }
    }),
  (req, res) => _r.success({ req, res })
)

// Success - GET: http://localhost:8080/empty
// Error - GET: http://localhost:8080/empty?name=ab
app.get('/empty', EMPTY_REQUEST, (req, res) => _r.success({ req, res }))

app.use('/api', api)

app.use('*', (req, res) => _r.error({ req, res, httpCode: 404, message: 'Page not found' }))

// Encrypt/Decrypt example
const key = 'my-secure-key'
console.log('ENC/DEC', _decrypt(_encrypt('Hello!', key), key))

// MD5 hashing example
console.log('MD5', _md5('Hello!'))

console.log() // Next line
