import joi from 'joi'
import ajv from 'ajv'
import express from 'express'

import _r from '../response'
import chalk from 'chalk'

const ajvi = new ajv()

const main = {
  joi: (req: express.Request, res: express.Response, next: express.NextFunction, object: any = {}): void => {
    try {
      if (
        (req.method === 'GET' && Object.keys(req.body).length) ||
        (req.method === 'POST' && Object.keys(req.query).length)
      )
        return _r.error({ req, res, message: 'Use either query string or body' })

      const schema: any = {}

      for (const key in object) schema[key] = object[key]

      const { error, value } = joi.object(schema).validate(req.method === 'GET' ? req.query : req.body, {
        allowUnknown: false,
        presence: 'required'
      })

      if (error) return _r.error({ req, res, httpCode: 400, code: 'VALIDATION_ERROR', error })

      const _req: any = req
      _req.bind.args = value

      next()
    } catch (error) {
      console.error(chalk.redBright(error))
    }
  },
  ajv: (req: express.Request, res: express.Response, next: express.NextFunction, schema: any = {}): void => {
    try {
      if (
        (req.method === 'GET' && Object.keys(req.body).length) ||
        (req.method === 'POST' && Object.keys(req.query).length)
      )
        return _r.error({ req, res, message: 'Use either query string or body' })

      const validator = ajvi.compile(schema)

      const value = req.method === 'GET' ? req.query : req.body

      validator(value)

      const errors = validator.errors

      if (errors)
        return _r.error({
          req,
          res,
          httpCode: 400,
          code: 'VALIDATION_ERROR',
          error: new Error(`${errors[0].schemaPath} ${errors[0].message}`)
        })

      const _req: any = req
      _req.bind.args = value

      next()
    } catch (error) {
      console.error(chalk.redBright(error))
    }
  }
}

export const EMPTY_REQUEST = (req: express.Request, res: express.Response, next: express.NextFunction): void =>
  main.joi(req, res, next, {})

export default main
