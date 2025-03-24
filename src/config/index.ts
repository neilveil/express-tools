import { Request } from 'express'

interface config {
  logs: {
    request: boolean
    response: boolean
    error: boolean
  }
  idPrefix: string
  responseDelay: number
  gracefulShutdown: boolean
  validator: 'ajv' | 'joi' | 'zod'
  contextParser: (req: Request) => any
}

export const config: config = {
  logs: {
    request: true,
    response: true,
    error: true
  },
  responseDelay: 0,
  gracefulShutdown: false,
  idPrefix: '',
  validator: 'zod',
  contextParser: () => {}
}
