import { Request } from 'express'

interface config {
  logs: {
    request: boolean
    requestData: boolean
    response: boolean
    error: boolean
  }
  idPrefix: string
  delay: number
  validator: 'ajv' | 'joi' | 'zod'
  contextParser: (req: Request) => any
}

export const config: config = {
  logs: {
    request: true,
    requestData: false,
    response: true,
    error: true
  },
  delay: 0,
  idPrefix: '',
  validator: 'zod',
  contextParser: () => {}
}
