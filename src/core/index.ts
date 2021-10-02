import express from 'express'

import _r from '../response'
import { EMPTY_REQUEST } from '../validate'
import auth from '../utils/auth'

const router = express.Router()

let HALT_OPERATIONS = false

router.post('/auth', EMPTY_REQUEST, auth, (req: express.Request, res: express.Response) =>
  _r.success({ req, res, code: 'AUTHORIZED' })
)

router.post('/start', EMPTY_REQUEST, auth, (req: express.Request, res: express.Response) => {
  HALT_OPERATIONS = false
  _r.success({ req, res })
})

router.post('/stop', EMPTY_REQUEST, auth, (req: express.Request, res: express.Response) => {
  HALT_OPERATIONS = true
  _r.success({ req, res })
})

router.get('/stats', EMPTY_REQUEST, auth, (req: express.Request, res: express.Response) =>
  _r.success({
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

router.use('/status', EMPTY_REQUEST, haltCheck, (req: express.Request, res: express.Response) =>
  _r.success({ req, res })
)

router.use('/mirror', haltCheck, (req: express.Request, res: express.Response) =>
  _r.success({
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
