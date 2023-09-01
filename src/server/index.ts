import { Application } from 'express'

import chalk from 'chalk'
import _app from '../app'
import { getServerHostList } from '../helpers'
import _env from '../env'

const _port = parseInt(_env('ET_PORT')) || 8080

export default (port: number = _port, callback?: () => void): Application => {
  const app = _app()

  const server = app.listen(port, () => {
    getServerHostList(port).map(host => {
      if (process.env.NODE_ENV !== 'test') console.log(`Server running on ${chalk.underline(host)}`)
    })

    if (callback) callback()
  })

  const __app: any = app
  __app.close = (callback?: () => void) =>
    server.close(() => {
      if (callback) callback()
    })

  return app
}
