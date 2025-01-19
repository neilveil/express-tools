import { z } from 'zod'

export const fetch = {
  args: z.object({
    id: z.number()
  }),
  res: z.object({
    id: z.number(),
    name: z.string()
  })
}

export const userContext = z.object({
  id: z.number()
})
