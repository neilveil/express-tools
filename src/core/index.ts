import axios from 'axios'
import express from 'express'

import _r from '../response'
import _md5 from '../md5'
import { EMPTY_REQUEST } from '../validate'

const NODE_ENV = process.env.NODE_ENV
const ET_AUTH_TOKEN = process.env.ET_AUTH_TOKEN
const ET_AUTH_URL = process.env.ET_AUTH_URL

const router = express.Router()

let HALT_OPERATIONS = false
const authTokenHash = _md5(ET_AUTH_TOKEN || '')

const auth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authorization = req.headers.authorization || ''

    if (!authorization) throw new Error()

    // password => md5('et-test')
    if (NODE_ENV === 'et-test' && authorization === '3a2e220599e52604367646b8a5a7dedf') return next()

    if (ET_AUTH_TOKEN && authTokenHash === authorization) return next()

    if (ET_AUTH_URL) {
      const authAPI = await axios({
        method: 'post',
        url: ET_AUTH_URL,
        headers: {
          authorization
        }
      })

      if (authAPI.status === 200) return next()
    }

    throw new Error()
  } catch (error) {
    return _r.error({ req, res, code: 'UNAUTHORIZED', message: 'Unauthorized user', error, httpCode: 401 })
  }
}

router.post('/auth', EMPTY_REQUEST, auth, (req: express.Request, res: express.Response) =>
  _r.json({ req, res, code: 'AUTHORIZED' })
)

router.post('/start', EMPTY_REQUEST, auth, (req: express.Request, res: express.Response) => {
  HALT_OPERATIONS = false
  _r.json({ req, res })
})

router.post('/stop', EMPTY_REQUEST, auth, (req: express.Request, res: express.Response) => {
  HALT_OPERATIONS = true
  _r.json({ req, res })
})

router.get('/stats', EMPTY_REQUEST, auth, (req: express.Request, res: express.Response) =>
  _r.json({
    req,
    res,
    payload: {
      rps: _r.getRPS(),
      avgResponseSize: _r.getAvgResponseSize(),
      avgProcessionTime: _r.getAvgProcessionTime(),
      totalRequestsServed: _r.getTotalRequestsServed()
    }
  })
)

export const haltCheck = (req: express.Request, res: express.Response, next: express.NextFunction): any =>
  HALT_OPERATIONS ? res.status(599).send('Network connect timeout error') : next()

router.use('/status', EMPTY_REQUEST, haltCheck, (req: express.Request, res: express.Response) => _r.json({ req, res }))

router.use('/mirror', haltCheck, (req: express.Request, res: express.Response) =>
  _r.json({
    req,
    res,
    payload: {
      ip: req.IP,
      method: req.method,
      headers: req.headers,
      query: req.query,
      data: req.body
    }
  })
)

export default router
