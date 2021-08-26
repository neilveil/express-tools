import joi from 'joi'
import express from 'express'

import _r from '../response'
import chalk from 'chalk'

const main = (req: express.Request, res: express.Response, next: express.NextFunction, object: any = {}): void => {
  try {
    if (
      (req.method === 'GET' && Object.keys(req.body).length) ||
      (req.method === 'POST' && Object.keys(req.query).length)
    )
      return _r.error({ req, res, message: 'Use either query string or body' })

    const schema: any = {}

    for (const key in object) schema[key] = object[key]

    const { error, value } = joi.object(schema).validate(req.method === 'GET' ? req.query : req.body, {
      allowUnknown: false
    })

    if (error) return _r.error({ req, res, code: 'VALIDATION_ERROR', error })

    req.bind.args = value

    next()
  } catch (error) {
    console.error(chalk.redBright(error))
  }
}

export const EMPTY_REQUEST = (req: express.Request, res: express.Response, next: express.NextFunction): void =>
  main(req, res, next, {})

export default main
