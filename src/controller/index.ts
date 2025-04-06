import { Request, Response } from 'express'
import { config } from '../config'

export const controller = (handler: (args: any, context?: any) => any) => async (req: Request, res: Response) => {
  try {
    const _req: any = req
    const args = _req.bind.args
    const context = config.contextParser(req, res)
    const payload = await handler(args, context)
    res.json(payload)
  } catch (error: any) {
    res.status(500).send(error.message)
  }
}
