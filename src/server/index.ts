import { Application } from 'express'
import { Server } from 'http'
import { printStartLogs } from '../helpers'

export default (app: Application, port = 8080): Server => {
  return app.listen(port, () => printStartLogs(port))
}
