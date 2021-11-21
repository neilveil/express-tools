import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import express from 'express'

import cache from '../utils/cache'

const ET_LOGS = process.env.ET_LOGS === 'yes' ? true : false
const ET_DEBUG = process.env.ET_DEBUG === 'yes' ? true : false
const ET_SID = process.env.ET_SID || ''

const NODE_ENV = process.env.NODE_ENV

const ET_PERSISTENT_ID = process.env.ET_PERSISTENT_ID === 'yes' && NODE_ENV !== 'et-test' ? true : false

let id = ET_PERSISTENT_ID ? cache.get('id') || 0 : 0
let running = false

const RPS_DURATION = 1000 // milliseconds

let requestsToCalcRPS: number[] = []

const startRPSupdateLoop = () =>
  NODE_ENV !== 'et-test' &&
  setInterval(() => {
    const rpsDurationTS = new Date().getTime() - RPS_DURATION
    requestsToCalcRPS = requestsToCalcRPS.filter(ts => ts > rpsDurationTS)
  }, RPS_DURATION)

let totalRequestsServed = 0
let avgResponseSize = 0
let avgProcessionTime = 0

const getRPS = (): number => requestsToCalcRPS.length
const getAvgResponseSize = (): number => parseInt(avgResponseSize.toString())
const getAvgProcessionTime = (): number => parseInt(avgProcessionTime.toString())
const getTotalRequestsServed = (): number => totalRequestsServed

type requestLog = [id: number, method: string, path: string, ip: string]

type responseLog =
  | [id: number, httpCode: number, code: string | number, message: string, rs: number, pt: number] // success | error
  | [id: number, httpCode: number, redirect: string, pt: number] // file, redirect
  | [id: number, httpCode: number, template: string, rs: number, pt: number] // template

const print = (type: 'REQ' | 'SCS' | 'ERR' | 'FIL' | 'TPL' | 'RDR', content: requestLog | responseLog) => {
  const prefix: any = [type, new Date().toISOString()]

  if (ET_SID) prefix.push(ET_SID)

  const log =
    prefix.map((x: any) => (x === undefined ? '-' : x)).join(' | ') +
    ' :: ' +
    content.map((x: any) => (x === undefined ? '-' : x)).join(' | ')

  if (ET_LOGS) {
    switch (type) {
      // Blue
      case 'REQ':
        console.log(chalk.blueBright(log))
        break
      // Green
      case 'SCS':
        console.log(chalk.greenBright(log))
        break
      // Green
      case 'TPL':
        console.log(chalk.greenBright(log))
        break
      // Green
      case 'FIL':
        console.log(chalk.greenBright(log))
        break
      // Red
      case 'ERR':
        console.log(chalk.redBright(log))
        break
      // Cyan
      case 'RDR':
        console.log(chalk.cyanBright(log))
        break
    }
  }
}

const init = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (!running) {
    startRPSupdateLoop()
    running = true
  }

  if (NODE_ENV !== 'et-test') requestsToCalcRPS.push(new Date().getTime())

  totalRequestsServed++
  id++
  if (ET_PERSISTENT_ID) cache.set('id', id)

  const xForwardedFor = req.headers['x-forwarded-for']

  req.IP = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor || req.socket.remoteAddress || ''

  if (req.IP === '::1') req.IP = '127.0.0.1'

  req.id = id
  req.ts = new Date()

  const log: requestLog = [req.id, req.method, req.path, req.IP]

  print('REQ', log)

  next()
}

interface params {
  req: express.Request
  res: express.Response
  code?: number | string
  httpCode?: number
  success?: boolean
  message?: string
  path?: string
  error?: Error
  payload?: any
}

interface response {
  id: number
  sid?: string
  code: number | string
  message: string
  payload: any
}

const success = (params: params): void => responseHandler(params, 'success')
const error = (params: params): void => responseHandler(params, 'error')
const file = (params: params): void => responseHandler(params, 'file')
const template = (params: params): void => responseHandler(params, 'template')
const redirect = (params: params): void => responseHandler(params, 'redirect')

const setIfUndefined = (value: any, alt: any) => (value === undefined ? alt : value)

const responseHandler = (params: params, responseType: 'success' | 'error' | 'redirect' | 'file' | 'template') => {
  if (ET_DEBUG && params.error?.stack) console.log(chalk.redBright(params.error?.stack))

  if (params.req.dead) return
  params.req.dead = true

  const id = params.req.id

  const payload = params.payload === undefined ? {} : params.payload

  const responseSize = size(params.payload)

  const processingTime = new Date().getTime() - params.req.ts?.getTime()

  avgProcessionTime = (avgProcessionTime * (totalRequestsServed - 1) + responseSize) / totalRequestsServed
  avgResponseSize = (avgResponseSize * (totalRequestsServed - 1) + responseSize) / totalRequestsServed

  let response: Partial<response> = {},
    httpCode: number,
    message = '',
    _path: string,
    code: string | number,
    log: responseLog,
    filePath: string

  if (ET_SID) response.sid = ET_SID

  switch (responseType) {
    case 'success':
      httpCode = setIfUndefined(params.httpCode, 200)

      code = setIfUndefined(params.code, 'OK')

      if (typeof params.message === 'string') message = params.message

      response = {
        id,
        code,
        message,
        payload
      }

      params.res.status(httpCode).json(response).end()

      log = [id, httpCode, code, message || '-', responseSize, processingTime]
      print('SCS', log)

      break

    case 'error':
      httpCode = setIfUndefined(params.httpCode, 500)

      code = setIfUndefined(params.code, 'ERROR')

      if (params.message && typeof params.message === 'string') message = params.message
      else if (params.error instanceof Error) message = params.error.message

      response = {
        id,
        code,
        message,
        payload
      }

      if (ET_SID) response.sid = ET_SID

      params.res.status(httpCode).json(response).end()

      log = [id, httpCode, code, message || '-', responseSize, processingTime]
      print('ERR', log)

      break

    case 'file':
      httpCode = params.httpCode || 200

      if (!params.path) throw new Error(`Path in file type response can not be empty`)

      filePath = path.resolve(params.path)

      if (!fs.existsSync(params.path)) throw new Error(`File not found: ${filePath}`)

      params.res.status(httpCode).sendFile(filePath)

      log = [id, httpCode, params.path, processingTime]
      print('FIL', log)

      break

    case 'template':
      httpCode = params.httpCode || 200

      if (!params.path) throw new Error(`Path in template type response can not be empty`)

      params.res.status(httpCode).render(params.path, params.payload)

      log = [id, httpCode, params.path, responseSize, processingTime]
      print('TPL', log)

      break

    case 'redirect':
      httpCode = params.httpCode || 302

      _path = setIfUndefined(params.path, '/')

      params.res.status(302).redirect(_path)

      log = [id, httpCode, _path, processingTime]
      print('RDR', log)

      break
  }
}

const size = (obj: any) => {
  let bytes = 0
  const sizeOf = (obj: any) => {
    if (obj !== null && obj !== undefined) {
      switch (typeof obj) {
        case 'number':
          bytes += 8
          break
        case 'string':
          bytes += obj.length * 2
          break
        case 'boolean':
          bytes += 4
          break
        case 'object':
          // eslint-disable-next-line
          let objClass = Object.prototype.toString.call(obj).slice(8, -1)
          if (objClass === 'Object' || objClass === 'Array') {
            for (const key in obj) {
              // eslint-disable-next-line
              if (!obj.hasOwnProperty(key)) continue
              sizeOf(obj[key])
            }
          } else bytes += obj.toString().length * 2
          break
      }
    }
    return bytes
  }
  return sizeOf(obj)
}

export default {
  init,
  success,
  file,
  template,
  error,
  redirect,
  getRPS,
  getAvgResponseSize,
  getAvgProcessionTime,
  getTotalRequestsServed
}

// Request format
//  "Key | Timestamp | Request id | ?SID :: Method | Path | IP"
// "REQ | 2021-07-22T11:05:39.987Z | a7ae7f560e71 | 1 :: GET | /user/auth | 48.55.42.21"

// Response format
// "Key | Timestamp | Request id | ?SID :: HTTP code | Code | Messasge | Response size | Processing time"
// "SCS | 2021-07-22T11:05:39.987Z | a7ae7f560e71 | 1 :: 200 | OK | Successfully created | 224 | 118"
// "ERR | 2021-07-22T11:05:39.987Z | a7ae7f560e71 | 1 :: 500 | ERROR | User not found! | 224 | 118"
// "Key | Timestamp | Request id | ?SID :: HTTP code | Redirect URL | Processing time"
// "RDR | 2021-07-22T11:05:39.987Z | a7ae7f560e71 | 1 :: 302 | https://redirect.com" | 118

// Server id
// a7ae7f560e71
