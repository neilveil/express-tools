import * as modules from './index'

describe('Integrated modules exported', () => {
  test('Axios exported', () => {
    // eslint-disable-next-line
    ;[
      '$ajv',
      '$axios',
      '$chalk',
      '$joi',
      '$express',
      '_decrypt',
      '_encrypt',
      '_md5',
      '_app',
      '_env',
      '_r',
      '_tdb',
      '_validate',
      'EMPTY_REQUEST',
      'server'
    ].forEach(x => expect(x in modules).toEqual(true))
  })
})
