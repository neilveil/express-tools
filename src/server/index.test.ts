import supertest from 'supertest'
import server from './index'

const app = server()

afterAll(done => {
  const _app: any = app
  _app.close(done)
})

test('Create server', async () => await supertest(app))
