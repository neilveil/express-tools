import supertest from 'supertest'

import app from '../app'

interface requestArgs {
  method?: 'get' | 'post'
  path: string
  query?: any
  headers?: any
  body?: any
}

// prettier-ignore
export default async (args: requestArgs): Promise<supertest.Response> =>
  await (await await supertest(app()))[args.method || 'get'](args.path).set(args.headers||{}).query(args.query||{}).send(args.body||{})
