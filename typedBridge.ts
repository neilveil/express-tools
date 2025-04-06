/* eslint-disable @typescript-eslint/no-unused-vars */
import * as zod from 'zod'
import { z } from 'zod'
declare const userContext: z.ZodObject<
  {
    id: z.ZodNumber
  },
  'strip',
  z.ZodTypeAny,
  {
    id: number
  },
  {
    id: number
  }
>
declare const _default: {
  'user.fetch': (
    args: zod.TypeOf<
      zod.ZodObject<
        {
          id: zod.ZodNumber
        },
        'strip',
        zod.ZodTypeAny,
        {
          id: number
        },
        {
          id: number
        }
      >
    >
  ) => Promise<
    zod.TypeOf<
      zod.ZodObject<
        {
          id: zod.ZodNumber
          name: zod.ZodString
        },
        'strip',
        zod.ZodTypeAny,
        {
          id: number
          name: string
        },
        {
          id: number
          name: string
        }
      >
    >
  >
}

type typedBridgeConfig = {
  host: string
  headers: { [key: string]: string }
  onResponse: (res: Response) => void
}

export const typedBridgeConfig: typedBridgeConfig = {
  host: '',
  headers: { 'Content-Type': 'application/json' },
  onResponse: (res: Response) => {}
}

export const typedBridge = new Proxy(
  {},
  {
    get(_, methodName: string) {
      return async (args: any) => {
        const response = await fetch(
          typedBridgeConfig.host + (typedBridgeConfig.host.endsWith('/') ? '' : '/') + methodName,
          {
            method: 'POST',
            headers: typedBridgeConfig.headers,
            body: JSON.stringify(args)
          }
        )

        typedBridgeConfig.onResponse(response)

        if (response.status !== 200) throw new Error('typed-bridge server error!')
        return response.json()
      }
    }
  }
) as typeof _default

export default typedBridge
