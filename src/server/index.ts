import { printStartLogs } from '@/helpers'
import { Application } from 'express'
import { Server } from 'http'

export default (app: Application, port = 8080): Server => {
  return app.listen(port, () => printStartLogs(port))
}
