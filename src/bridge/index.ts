import { Request, Response } from 'express'
import { config } from '../config'

export default (bridge: any): any =>
  async (req: Request, res: Response) => {
    try {
      const path = req.path.split('/').pop() || ''
      const args = req.body

      if (!path) throw new Error('Bridge not found!')

      const controller = bridge[path]
      const { next, context } = config.contextParser(req, res)

      if (next) res.json(await controller(args, context))
    } catch (error: any) {
      if (config.validator === 'zod' && Array.isArray(error.errors)) {
        const keyPath = error.errors[0].path.join('/')
        const errorMessage = (keyPath ? keyPath + ': ' : '') + error.errors[0].message
        return res.status(400).json({ error: errorMessage })
      }

      if (config.logs.error) console.error(error)

      return res.status(500).json({ error: error.message })
    }
  }
