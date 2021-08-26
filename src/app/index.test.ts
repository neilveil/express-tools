import request from 'supertest'

import app from './index'

test('Create express app with middlewares', async () => await request(app()))
