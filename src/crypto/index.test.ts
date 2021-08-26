import { encrypt, decrypt } from './index'

const decrypted = 'Hey there!'
const encrypted = 'r+vuu$lPR+phfVGvd4B6+VjzgcJJTPJhVCvG97QbB8c='

describe('Crypto', () => {
  test('Encrypt', () => {
    expect(encrypt(decrypted)).toEqual(encrypted)
  })

  test('Decrypt', () => {
    expect(decrypt(encrypted)).toEqual(decrypted)
  })
})
