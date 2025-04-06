import 'dotenv/config'

export { default as createApp } from './app'
export { default as createBridge } from './bridge'
export { config as etConfig } from './config'
export { default as startServer } from './server'

export { controller as _c } from './controller'
export { validator as _v, EMPTY_REQUEST } from './validator'

export { default as $a } from 'ajv'
export { default as $j } from 'joi'
export { default as $z } from 'zod'

export { Application, NextFunction, Request, Response, Router } from 'express'

export { default as express } from 'express'
