import { encrypt, decrypt, md5 } from './index'

const data = 'Hey there!'
const key1 = 'key-1'
const key2 = 'key-2'

describe('Crypto', () => {
  test('Encrypt & Decrypt', () => {
    const enc1 = encrypt(data, key1)
    const enc2 = encrypt(data, key2)

    expect(enc1.length).toBeGreaterThan(0)
    expect(enc1).not.toEqual(enc2)

    const dec1 = decrypt(enc1, key1)
    const dec2 = decrypt(enc2, key2)

    expect(dec1).toEqual(data)
    expect(dec1).toEqual(dec2)
  })

  test('MD5', () => {
    expect(md5('Hey there!')).toBe('12f7adab78f9cf87a161ade5e24142d7')
  })
})
