import supertest from 'supertest'
import server from '../server'

const app = server()
const request = supertest(app)

afterAll(done => {
  const _app: any = app
  _app.close(done)
})

describe('Response handler', () => {
  test('Success response', async () => {
    const response = await request.get('/express-tools-success')
    expect(response.body).toMatchObject({ id: 1, code: 'OK', message: '', payload: {} })
  })

  test('Error response', async () => {
    const res = await request.get('/express-tools-error')
    expect(res.body).toMatchObject({ code: 'ERROR', message: '', payload: {} })
  })

  test('Redirect response', async () => {
    const res = await request.get('/express-tools-redirect')
    expect(res.status).toEqual(302)
  })
})
