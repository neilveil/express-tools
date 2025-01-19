import ajv from 'ajv'
import { NextFunction, Request, Response } from 'express'
import joi from 'joi'
import zod from 'zod'
import { etConfig } from '..'

const _ajv = new ajv()

const validators = {
  joi: (schemaObject: any = {}, data: any = {}): any => {
    const { error, value } = joi.object(...schemaObject).validate(data, {
      allowUnknown: false,
      presence: 'required'
    })

    if (error) throw new Error('Validation error!')

    return value
  },
  ajv: (schemaObject: any = {}, data: any = {}): any => {
    const validator = _ajv.compile(schemaObject)
    validator(data)

    const errors = validator.errors

    if (errors) throw new Error(`${errors[0].schemaPath} ${errors[0].message}`)
  },
  zod: (schemaObject: any = {}, data: any = {}): any => {
    try {
      return zod.object(schemaObject).strict().parse(data)
    } catch (error: any) {
      const keyPath = error.errors[0].path.join('/')
      throw new Error((keyPath ? keyPath + ': ' : '') + error.errors[0].message)
    }
  }
}

export const validator = (schema: any) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatorModule: 'joi' | 'ajv' | 'zod' = etConfig.validator

    const data = req.method === 'GET' ? req.query : req.body

    if (
      (req.method === 'GET' && Object.keys(req.body).length) ||
      (req.method === 'POST' && Object.keys(req.query).length)
    )
      throw new Error('Use either query string or body!')

    let args = {}

    switch (validatorModule) {
      case 'ajv':
        args = validators['ajv'](schema, data)
        break

      case 'joi':
        args = validators['joi'](schema, data)
        break

      case 'zod':
        args = validators['zod'](schema, data)
        break
    }

    const _req: any = req
    _req.bind.args = args

    if (req.method === 'GET') req.query = args
    else req.body = args

    next()
  } catch (error: any) {
    res.status(400).send(error.message)
  }
}

export const EMPTY_REQUEST = validator({})
