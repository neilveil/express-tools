import { $z } from '@/index'
import * as types from './types'

export const fetch = async (
  args: $z.infer<typeof types.fetch.args>,
  context: $z.infer<typeof types.userContext>
): Promise<$z.infer<typeof types.fetch.res>> => {
  types.fetch.args.parse(args)

  console.log('Context:', context)

  return { id: args.id, name: 'Neil' }
}
