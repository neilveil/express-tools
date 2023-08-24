import supertest from 'supertest'
import server from '../server'

const app = server()
const request = supertest(app)

afterAll(done => {
  const _app: any = app
  _app.close(done)
})

describe('Response handler', () => {
  test('Success response JOI', async () => {
    const response = await request.get('/express-tools-validate-joi?name=neil')
    expect(response.body.code).toEqual('OK')
  })
  test('Error response JOI', async () => {
    const response = await request.get('/express-tools-validate-joi')
    expect(response.body.code).toEqual('VALIDATION_ERROR')
  })
  test('Success response AJV', async () => {
    const response = await request.get('/express-tools-validate-ajv?name=neil')
    expect(response.body.code).toEqual('OK')
  })
  test('Error response AJV', async () => {
    const response = await request.get('/express-tools-validate-ajv')
    expect(response.body.code).toEqual('VALIDATION_ERROR')
  })
})
