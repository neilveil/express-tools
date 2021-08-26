import compression from 'compression'
import cors from 'cors'
import express from 'express'

import core, { haltCheck } from '../core'
import response from '../response'

const NODE_ENV = process.env.NODE_ENV
const SFE_CORE_KEY = process.env.SFE_CORE_KEY || (NODE_ENV === 'sfe-test' ? 'core' : '')

export default (): express.Application => {
  const SFE_DELAY = parseInt(process.env.SFE_DELAY || '0')
  const SFE_STATIC = process.env.SFE_STATIC

  const app: express.Application = express()

  if (NODE_ENV !== 'sfe-test') {
    console.log('\n-x-x-x-x-x-\n')
    console.log(new Date().toISOString().substr(0, 19).replace('T', ' '))
    console.log('\n-x-x-x-x-x-\n')
  }

  app.use(cors())

  app.use(compression())

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  if (SFE_STATIC) app.use(express.static(SFE_STATIC))

  // eslint-disable-next-line
  app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) =>
    res.sendStatus(400)
  )

  app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'fast-express')
    req.bind = {}
    next()
  })

  app.use(response.init)

  if (SFE_DELAY) app.use((req, res, next) => setTimeout(next, SFE_DELAY))

  if (SFE_CORE_KEY) app.use('/' + SFE_CORE_KEY, core)

  app.use(haltCheck)

  if (NODE_ENV === 'sfe-test') {
    app.use('/fast-express-success', (req, res) => response.json({ req, res }))
    app.use('/fast-express-error', (req, res) => response.error({ req, res }))
    app.use('/fast-express-redirect', (req, res) => response.redirect({ req, res }))
  }

  return app
}
