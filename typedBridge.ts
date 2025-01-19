/* eslint-disable @typescript-eslint/no-unused-vars */
import * as zod from 'zod';
import { z } from 'zod';
declare const userContext: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
declare const _default: {
    'user.fetch': (args: zod.TypeOf<zod.ZodObject<{
        id: zod.ZodNumber;
    }, "strip", zod.ZodTypeAny, {
        id: number;
    }, {
        id: number;
    }>>) => Promise<zod.TypeOf<zod.ZodObject<{
        id: zod.ZodNumber;
        name: zod.ZodString;
    }, "strip", zod.ZodTypeAny, {
        id: number;
        name: string;
    }, {
        id: number;
        name: string;
    }>>>;
};

export default new Proxy(
  {},
  {
    get(_, methodName: string) {
      return async (args: any) => {
        const response = await fetch('http://localhost:8080/bridge' + '/' + methodName, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args)
        })
        if (response.status !== 200) throw new Error('typed-bridge server error!')
        return response.json()
      }
    }
  }
) as typeof _default
