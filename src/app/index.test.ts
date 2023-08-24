import supertest from 'supertest'

import app from './index'

test('Create app', async () => await supertest(app()))
