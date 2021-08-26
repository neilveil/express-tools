import request from '../utils/request'

const authorization = '3a2e220599e52604367646b8a5a7dedf'

describe('API', () => {
  describe('Core', () => {
    test('Check status', async () => {
      const res = await request({ path: '/core/status' })
      expect(res.statusCode).toEqual(200)
    })

    test('Mirror', async () => {
      const res = await request({ path: '/core/mirror', headers: { 1: 1 }, query: { 2: 2 }, body: { 3: 3 } })
      expect(res.statusCode).toEqual(200)
      expect(['method', 'headers', 'query', 'data', 'ip']).toEqual(
        expect.arrayContaining(Object.keys(res.body.payload))
      )
    })

    test('Auth error', async () => {
      const res = await request({ method: 'post', path: '/core/auth' })
      expect(res.statusCode).toEqual(401)
    })

    test('Auth success', async () => {
      const res = await request({
        method: 'post',
        path: '/core/auth',
        headers: { authorization }
      })
      expect(res.statusCode).toEqual(200)
    })

    test('Stop server', async () => {
      const res = await request({
        method: 'post',
        path: '/core/stop',
        headers: { authorization }
      })
      expect(res.statusCode).toEqual(200)
    })

    test('Start server', async () => {
      const res = await request({
        method: 'post',
        path: '/core/start',
        headers: { authorization }
      })
      expect(res.statusCode).toEqual(200)
    })

    test('Server stats', async () => {
      const res = await request({
        method: 'post',
        path: '/core/stats',
        headers: { authorization }
      })

      expect(res.statusCode).toEqual(200)
      expect(res.body.payload).toHaveProperty('rps')
      expect(res.body.payload).toHaveProperty('avgResponseSize')
      expect(res.body.payload).toHaveProperty('avgProcessionTime')
      expect(res.body.payload).toHaveProperty('totalRequestsServed')
    })
  })
})
