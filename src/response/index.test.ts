import request from '../utils/request'

describe('Response handler', () => {
  test('Success response', async () => {
    const res = await request({
      path: '/fast-express-success'
    })
    expect(res.body).toMatchObject({ id: 1, code: 'OK', message: '', payload: {} })
  })

  test('Error response', async () => {
    const res = await request({
      path: '/fast-express-error'
    })
    expect(res.body).toMatchObject({ id: 2, code: 'ERROR', message: '', payload: {} })
  })

  test('Redirect response', async () => {
    const res = await request({
      path: '/fast-express-redirect'
    })
    expect(res.status).toEqual(302)
  })
})
