import axios from 'axios'
import express from 'express'

import _r from '../response'
import _md5 from '../md5'

const NODE_ENV = process.env.NODE_ENV
const ET_AUTH_URL = process.env.ET_AUTH_URL
const ET_AUTH_TOKEN = process.env.ET_AUTH_TOKEN

const authTokenHash = _md5(ET_AUTH_TOKEN || '')

const main = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> => {
  try {
    const authorization = req.headers.authorization || ''

    if (!authorization) throw new Error()

    // password => md5('et-test')
    if (NODE_ENV === 'et-test' && authorization === '3a2e220599e52604367646b8a5a7dedf') return next()
    else if (ET_AUTH_TOKEN && authTokenHash === authorization) return next()
    else if (ET_AUTH_URL) {
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
  } catch (error: any) {
    return _r.error({ req, res, code: 'UNAUTHORIZED', message: 'Unauthorized user', error, httpCode: 401 })
  }
}

export default main
