declare namespace Express {
  interface Request {
    dead: boolean
    id: number
    IP: string
    ts: Date
    bind: {
      args?: any
    }
  }
}
