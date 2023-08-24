import tdb from './index'

describe('TDB', () => {
  test(`Init, Get, Set, Clear`, () => {
    tdb.init()

    tdb.set('abc', 'xyz')
    expect(tdb.get('abc')).toEqual('xyz')

    tdb.clear('abc')
    expect(tdb.get('abc')).toEqual(undefined)

    tdb.clear()
    expect(JSON.stringify(tdb.get())).toEqual('{}')
  })
})
