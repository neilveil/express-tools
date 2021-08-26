import os from 'os'
import express from 'express'

import _app from '../app'
import chalk from 'chalk'

const NODE_ENV = process.env.NODE_ENV

export default (port = 8080): express.Application => {
  const app = _app()

  app.listen(port, () =>
    Object.values(os.networkInterfaces())
      .map(x => (x && x[0] ? x[0].address : null))
      .filter(ip =>
        /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(
          ip || ''
        )
      )
      .map(ip => 'http://' + (ip === '127.0.0.1' ? 'localhost' : ip))
      .map(ip => {
        if (NODE_ENV !== 'sfe-test') console.log(`Server running on ${chalk.underline(ip + ':' + port)}`)
      })
  )

  return app
}
