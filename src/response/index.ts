import chalk from 'chalk'
import express from 'express'

import cache from '../utils/cache'

const SFE_LOGS = process.env.SFE_LOGS === 'yes' ? true : false
const SFE_DEBUG = process.env.SFE_DEBUG === 'yes' ? true : false
const SFE_SID = process.env.SFE_SID || ''

const NODE_ENV = process.env.NODE_ENV

const SFE_PERSISTENT_ID = process.env.SFE_PERSISTENT_ID === 'yes' && NODE_ENV !== 'sfe-test' ? true : false

let id = SFE_PERSISTENT_ID ? cache.get('id') || 0 : 0
let running = false

const RPS_DURATION = 1000 // milliseconds

let requestsToCalcRPS: number[] = []

const startRPSupdateLoop = () =>
  NODE_ENV !== 'sfe-test' &&
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
  | [id: number, httpCode: number, code: string | number, message: string, rs: number, pt: number]
  | [id: number, httpCode: number, redirect: string]

const print = (type: 'REQ' | 'JSN' | 'ERR' | 'RDR', content: requestLog | responseLog) => {
  const prefix: any = [type, new Date().toISOString()]

  if (SFE_SID) prefix.push(SFE_SID)

  const log =
    prefix.map((x: any) => (x === undefined ? '-' : x)).join(' | ') +
    ' :: ' +
    content.map((x: any) => (x === undefined ? '-' : x)).join(' | ')

  if (SFE_LOGS) {
    switch (type) {
      case 'REQ':
        console.log(chalk.blueBright(log))
        break
      case 'JSN':
        console.log(chalk.greenBright(log))
        break
      case 'ERR':
        console.log(chalk.redBright(log))
        break
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

  if (NODE_ENV !== 'sfe-test') requestsToCalcRPS.push(new Date().getTime())

  totalRequestsServed++
  id++
  if (SFE_PERSISTENT_ID) cache.set('id', id)

  req.IP = Array.isArray(req.headers['x-forwarded-for'])
    ? req.headers['x-forwarded-for'][0]
    : req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''

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
  redirect?: string
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

const json = (params: params): void => responseHandler(params, 'json')
const error = (params: params): void => responseHandler(params, 'error')
const redirect = (params: params): void => responseHandler(params, 'redirect')

const setIfUndefined = (value: any, alt: any) => (value === undefined ? alt : value)

const responseHandler = (params: params, responseType: 'json' | 'error' | 'redirect') => {
  if (params.req.dead) return
  params.req.dead = true

  const id = params.req.id

  const payload = params.payload || {}

  const responseSize = size(params.payload)

  const processionTime = new Date().getTime() - params.req.ts?.getTime()

  avgProcessionTime = (avgProcessionTime * (totalRequestsServed - 1) + responseSize) / totalRequestsServed
  avgResponseSize = (avgResponseSize * (totalRequestsServed - 1) + responseSize) / totalRequestsServed

  params.res.type('application/json')

  let response: response,
    httpCode: number,
    message = '',
    redirect: string,
    code: string | number,
    log: responseLog

  switch (responseType) {
    case 'json':
      httpCode = setIfUndefined(params.httpCode, 200)

      code = setIfUndefined(params.code, 'OK')

      if (typeof params.message === 'string') message = params.message

      response = {
        id,
        code,
        message,
        payload
      }

      if (SFE_SID) response.sid = SFE_SID

      params.res.status(httpCode).json(response).end()

      log = [id, httpCode, code, message || '-', responseSize, processionTime]
      print('JSN', log)

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

      if (SFE_SID) response.sid = SFE_SID

      params.res.status(httpCode).json(response).end()

      log = [id, httpCode, code, message || '-', responseSize, processionTime]
      print('ERR', log)

      if (SFE_DEBUG && params.error?.stack) console.log(chalk.redBright(params.error?.stack))

      break

    case 'redirect':
      httpCode = params.httpCode || 302

      redirect = setIfUndefined(params.redirect, '/')

      params.res.status(302).redirect(redirect)

      log = [id, httpCode, redirect]
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
  json,
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
// "JSN | 2021-07-22T11:05:39.987Z | a7ae7f560e71 | 1 :: 200 | OK | Successfully created | 224 | 118"
// "ERR | 2021-07-22T11:05:39.987Z | a7ae7f560e71 | 1 :: 500 | ERROR | User not found! | 224 | 118"
// "Key | Timestamp | Request id | ?SID :: HTTP code | Redirect URL | Processing time"
// "RDR | 2021-07-22T11:05:39.987Z | a7ae7f560e71 | 1 :: 302 | https://redirect.com" | 118

// Server id
// a7ae7f560e71
