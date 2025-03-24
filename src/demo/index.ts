import { $z, _c, _v, createApp, createBridge, etConfig, Request, startServer } from '@/index'
import api from './api'
import bridge from './bridge'

etConfig.logs.request = true
etConfig.contextParser = (req: Request) => {
  return req.originalUrl
}

const app = createApp()
startServer(app, 8080)

app.use('/bridge', createBridge(bridge))

app.use('/api', api)

app.get(
  '/test/:name',
  _v({ a: $z.string() }),
  _c(async (args, context) => {
    console.log(args, context)
    return args
  })
)

app.get(
  // Route
  '/demo',
  // Validator
  _v({ id: $z.string() }),
  // Controller
  _c(async (args: { id: number }) => {
    return { id: args.id, name: 'Express Tools' }
  })
)

type context = {
  name: string
  authorization: string
}

etConfig.contextParser = (req: Request): context => {
  const headers = req.headers
  return { name: 'Express Tools', authorization: headers.authorization || 'NO_AUTH' }
}

app.post(
  // Route
  '/demo',
  // Validator
  _v({ id: $z.number().min(1) }),
  // Controller
  _c(async (args: { id: number }, context: context) => {
    return { id: args.id, name: context.name }
  })
)
