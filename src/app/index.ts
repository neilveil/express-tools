import compression from 'compression'
import cors from 'cors'
import express from 'express'

import core, { haltCheck } from '../core'
import response from '../response'

const NODE_ENV = process.env.NODE_ENV
const ET_DELAY = parseInt(process.env.ET_DELAY || '0')
const ET_CORE_KEY = process.env.ET_CORE_KEY || (NODE_ENV === 'et-test' ? 'core' : '')

export default (): express.Application => {
  const app: express.Application = express()

  if (NODE_ENV !== 'et-test') {
    console.log('\n-x-x-x-x-x-\n')
    console.log(new Date().toISOString().substr(0, 19).replace('T', ' '))
    console.log('\n-x-x-x-x-x-\n')
  }

  app.use(cors())

  app.use(compression())

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  app.set('view engine', 'ejs')

  // eslint-disable-next-line
  app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) =>
    res.sendStatus(400)
  )

  app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'express-tools')
    req.bind = {}
    next()
  })

  app.use(response.init)

  if (ET_DELAY) app.use((req, res, next) => setTimeout(next, ET_DELAY))

  if (ET_CORE_KEY) app.use('/' + ET_CORE_KEY, core)

  app.use(haltCheck)

  if (NODE_ENV === 'et-test') {
    app.use('/express-tools-success', (req, res) => response.json({ req, res }))
    app.use('/express-tools-error', (req, res) => response.error({ req, res }))
    app.use('/express-tools-redirect', (req, res) => response.redirect({ req, res }))
  }

  return app
}
