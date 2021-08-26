import md5 from './index'

test('md5', () => {
  expect(md5('Hey there!')).toBe('12f7adab78f9cf87a161ade5e24142d7')
})
