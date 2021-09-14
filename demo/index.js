const { server, _r, _md5, _encrypt, _decrypt } = require('express-tools')

const port = process.env.PORT

const app = server(port)

app.set('views', '.')

app.use('/api', require('./api'))

app.get('/success', (req, res) => _r.json({ req, res, payload: { a: 1 } }))
app.get('/redirect', (req, res) => _r.redirect({ req, res, path: '/success' }))
app.get('/error', (req, res) => _r.error({ req, res }))
app.get('/template', (req, res) => _r.template({ req, res, path: 'demo' }))
app.get('/file', (req, res) => _r.file({ req, res, path: 'demo.ejs' }))

app.use('*', (req, res) => _r.error({ req, res, httpCode: 404, message: 'Page not found' }))

// Encrypt/Decrypt example
console.log('ENC/DEC', _decrypt(_encrypt('Hello!')))

// MD5 hashing example
console.log('MD5', _md5('Hello!'))
