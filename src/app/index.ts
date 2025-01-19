import compression from 'compression'
import cors from 'cors'
import express, { Application } from 'express'
import chalk from 'chalk'
import { etConfig } from '..'

export default (): Application => {
  const app = express()

  // CORS
  app.use(cors())

  // Compression
  app.use(compression())

  // Body parser
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Express tools middleware
  let requestId = 1
  app.use((req, res, next) => {
    const _req: any = req

    const xForwardedFor = req.headers['x-forwarded-for']

    let ip = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : (xForwardedFor || '').split(', ')[0] || req.socket.remoteAddress || ''

    if (ip === '::1') ip = '127.0.0.1'

    // Bind data
    _req.bind = {
      id: 0,
      ts: Date.now(),
      args: {},
      ip
    }

    // Set express tools header
    res.setHeader('X-Powered-By', 'express-tools')

    let _requestId: string | number = requestId++
    _requestId = etConfig.idPrefix ? etConfig.idPrefix + _requestId : _requestId

    // Log request
    if (etConfig.logs.request) {
      console.log(
        chalk.blueBright(`REQ | ${new Date().toISOString()} | ${_requestId} :: ${req.method} | ${req.path} | ${ip}`)
      )

      // Log query
      if (etConfig.logs.requestData && Object.keys(req.query).length) console.log(`Query:`, req.query)

      // Log body
      if (etConfig.logs.requestData && Object.keys(req.body).length) console.log(`Body:`, req.body)
    }

    // Log response
    const startTime = Date.now()
    res.on('finish', () => {
      const log = `RES | ${new Date().toISOString()} | ${_requestId} :: ${res.statusCode} | ${Date.now() - startTime}`
      console.log(res.statusCode < 400 ? chalk.green(log) : chalk.red(log))
    })

    next()
  })

  // Handle invalid json in post request
  app.use((error: any, req: any, res: any, next: any) => {
    if (error?.type === 'entity.parse.failed') {
      res.status(400).send('Can not parse request!')
    } else next()
  })

  // Custom delay
  if (etConfig.delay)
    app.use((req, res, next) => {
      setTimeout(next, etConfig.delay)
    })

  // Server health
  app.use('/health', (req, res) => {
    res.sendStatus(200)
  })

  return app
}
