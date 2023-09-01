import compression from 'compression'
import cors from 'cors'
import express, { Application, NextFunction, Request, Response } from 'express'
import _env from '../env'
import _validate from '../validate'
import $joi from 'joi'

import response from '../response'
import path from 'path'

const ET_DELAY = parseInt(_env('ET_DELAY', '0'))
const ET_VIEWS_DIR = _env('ET_VIEWS_DIR')
const ET_STATIC_DIR = _env('ET_STATIC_DIR')
const ET_STATIC_ROOT = _env('ET_STATIC_ROOT')
const ET_AUTO_INIT_R = _env('ET_AUTO_INIT_R')

export default (): Application => {
  const app: Application = express()

  if (process.env.NODE_ENV !== 'test') {
    console.log('\n-x-x-x-x-x-\n')
    console.log(new Date().toISOString().substring(0, 19).replace('T', ' '))
    console.log('\n-x-x-x-x-x-\n')
  }

  app.use(cors())

  app.use(compression())

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Express tools middleware
  app.use((req, res, next) => {
    const _req: any = req
    _req.bind = {}
    res.setHeader('X-Powered-By', 'express-tools')
    next()
  })

  // Handle invalid json in post request
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if (error?.type === 'entity.parse.failed') {
      response.error({ req, res, error, httpCode: 400, code: 'INVALID_POST', message: 'Can not parse request!' })
    } else next()
  })

  if (ET_DELAY) app.use((req, res, next) => setTimeout(next, ET_DELAY))

  // Init response module
  if (ET_AUTO_INIT_R !== 'no') app.use(response.init)

  // Views middleware
  if (ET_VIEWS_DIR) {
    app.set('view engine', 'ejs')
    app.set('views', path.resolve(ET_VIEWS_DIR))
  }

  // Static middleware
  if (ET_STATIC_DIR) {
    const staticOptions = {
      setHeaders: (res: any, path: any, stat: any) => {
        response.success({ req: res.req, res, skip: true, size: stat.size, isStatic: true })
      },
      redirect: false,
      index: false
    }

    if (ET_STATIC_ROOT) app.use(ET_STATIC_ROOT, express.static(path.resolve(ET_STATIC_DIR), staticOptions))
    else app.use(express.static(path.resolve(ET_STATIC_DIR), staticOptions))
  }

  if (process.env.NODE_ENV === 'test') {
    app.get('/express-tools-success', (req, res) => response.success({ req, res }))
    app.get('/express-tools-error', (req, res) => response.error({ req, res }))
    app.get('/express-tools-redirect', (req, res) => response.redirect({ req, res, path: '/express-tools-success' }))
    app.get(
      '/express-tools-validate-joi',
      (req, res, next) =>
        _validate.joi(req, res, next, {
          name: $joi.string().length(4)
        }),
      (req, res) => response.success({ req, res })
    )
    app.get(
      '/express-tools-validate-ajv',
      (req, res, next) =>
        _validate.ajv(req, res, next, {
          type: 'object',
          additionalProperties: false,
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 4 }
          }
        }),
      (req, res) => response.success({ req, res })
    )
  }

  return app
}
