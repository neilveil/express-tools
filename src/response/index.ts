import chalk from 'chalk'
import { Request, Response, NextFunction } from 'express'
import _env from '../env'

const ET_LOGS = _env('ET_LOGS') === 'yes'
const ET_DEBUG = _env('ET_DEBUG') === 'yes'
const ET_ID_PREFIX = _env('ET_ID_PREFIX', '')

const RPS_DURATION = 1000 // milliseconds

let requestsToCalcRPS: number[] = []

const startRPSupdateLoop = () => {
  if (process.env.NODE_ENV !== 'test')
    setInterval(() => {
      const rpsDurationTS = new Date().getTime() - RPS_DURATION
      requestsToCalcRPS = requestsToCalcRPS.filter(ts => ts > rpsDurationTS)
    }, RPS_DURATION)
}

let totalRequestsServed = 0
let avgResponseSize = 0
let avgProcessionTime = 0

const getRPS = (): number => requestsToCalcRPS.length - 1
const getAvgResponseSize = (): number => parseInt(avgResponseSize.toString())
const getAvgProcessionTime = (): number => parseInt(avgProcessionTime.toString())
const getTotalRequestsServed = (): number => totalRequestsServed

type requestLog = [id: number, method: string, path: string, ip: string]

type responseLog = [
  id: number,
  httpCode: number,
  code: '-' | string | number,
  message: '-' | string,
  rs: '-' | number,
  pt: number
]

// Request format
//  Key | Timestamp | Request ID :: Method | Path | IP
// REQ | 2021-07-22T11:05:39.987Z | 1 :: GET | /user/auth | 48.55.42.21

// Response format
// Key | Timestamp | Request ID :: HTTP code | Code | Messasge | Response size | Processing time
// SCS | 2021-07-22T11:05:39.987Z | 1 :: 200 | OK | Successfully created | 224 | 118
// ERR | 2021-07-22T11:05:39.987Z | 1 :: 500 | ERROR | User not found! | 224 | 118
// RDR | 2021-07-22T11:05:39.987Z | 1 :: 302 | - | https://redirect.com" | - | 118
// TPL | 2021-07-22T11:05:39.987Z | 1 :: 200 | - | page/product/info | 224 | 118

const print = (type: 'REQ' | 'SCS' | 'ERR' | 'TPL' | 'RDR', content: requestLog | responseLog) => {
  if (!ET_LOGS) return

  const prefix: any = [type, new Date().toISOString()]

  const cleanContent = content.map((x: any) => (['', undefined].includes(x) ? '-' : x))

  const log = prefix.join(' | ') + ' :: ' + ET_ID_PREFIX + cleanContent.join(' | ')

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

let running = false
let id = 0

const init = (req: Request, res: Response, next: NextFunction): void => {
  if (!running) {
    startRPSupdateLoop()
    running = true
  }

  requestsToCalcRPS.push(new Date().getTime())

  totalRequestsServed++
  id++

  const xForwardedFor = req.headers['x-forwarded-for']

  const _req: any = req

  _req.IP = Array.isArray(xForwardedFor)
    ? xForwardedFor[0]
    : (xForwardedFor || '').split(', ')[0] || req.socket.remoteAddress || ''

  if (_req.IP === '::1') _req.IP = '127.0.0.1'

  _req.id = id
  _req.ts = new Date()

  const log: requestLog = [_req.id, req.method, req.path, _req.IP]

  print('REQ', log)

  next()
}

interface params {
  req: Request
  res: Response
  code?: number | string
  httpCode?: number
  success?: boolean
  message?: string
  path?: string
  error?: any
  payload?: any
  skip?: boolean
}

interface response {
  id: number
  code: number | string
  message: string
  payload: any
}

const success = (params: params): void => responseHandler(params, 'success')
const error = (params: params): void => responseHandler(params, 'error')
const template = (params: params): void => responseHandler(params, 'template')
const redirect = (params: params): void => responseHandler(params, 'redirect')

const setIfUndefined = (value: any, alt: any) => (value === undefined ? alt : value)

const responseHandler = (params: params, responseType: 'success' | 'error' | 'redirect' | 'template' | 'custom') => {
  if (ET_DEBUG && params.error) console.error(params.error)

  const _req: any = params.req

  if (_req.dead) return console.log(chalk.redBright(`!!! Dead request !!! ${_req.id} !!!`))
  _req.dead = true

  const id = _req.id

  const payload = params.payload === undefined ? {} : params.payload

  const responseSize = size(params.payload)
  avgResponseSize = (avgResponseSize * (totalRequestsServed - 1) + responseSize) / totalRequestsServed

  const processingTime = new Date().getTime() - _req.ts?.getTime()
  avgProcessionTime = (avgProcessionTime * (totalRequestsServed - 1) + processingTime) / totalRequestsServed

  let response: Partial<response> = {},
    httpCode: number,
    message = '',
    _path: string,
    code: string | number,
    log: responseLog

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

      if (!params.skip) params.res.status(httpCode).json(response).end()

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

      if (!params.skip) params.res.status(httpCode).json(response).end()

      log = [id, httpCode, code, message || '-', responseSize, processingTime]
      print('ERR', log)

      break

    case 'template':
      httpCode = params.httpCode || 200

      if (!params.path) throw new Error(`Path in template type response can not be empty`)

      if (!params.skip) params.res.status(httpCode).render(params.path, params.payload)

      log = [id, httpCode, '-', params.path, responseSize, processingTime]
      print('TPL', log)

      break

    case 'redirect':
      httpCode = params.httpCode || 302

      _path = setIfUndefined(params.path, '/')

      if (!params.skip) params.res.status(302).redirect(_path)

      log = [id, httpCode, '-', _path, '-', processingTime]
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
  template,
  error,
  redirect,

  getRPS,
  getAvgResponseSize,
  getAvgProcessionTime,
  getTotalRequestsServed
}
