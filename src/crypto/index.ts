import crypto from 'crypto'

const _resize = (data: string, size: number, fill = 'X') =>
  data.substring(0, size) + fill.repeat(size - data.substring(0, size).length)

const _genKeyIv = (data: string) => {
  data = _resize(data, 48)
  const _key = data.substring(0, 32)
  const _iv = data.substring(32, 48)
  return { _key, _iv }
}

const encrypt = (data: string, key: string): string => {
  const { _key, _iv } = _genKeyIv(key)

  const dataBuffer = Buffer.from(data, 'binary')

  const dataB64 = dataBuffer.toString('base64')

  const cipher = crypto.createCipheriv('aes-256-cbc', _key, _iv)
  const result = cipher.update(dataB64, 'binary', 'base64') + cipher.final('base64')

  return result
}

const decrypt = (data: string, key: string): string => {
  const { _key, _iv } = _genKeyIv(key)

  const decipher = crypto.createDecipheriv('aes-256-cbc', _key, _iv)

  return Buffer.from(decipher.update(data, 'base64', 'binary') + decipher.final('binary'), 'base64').toString()
}

const md5 = (content: string): string => crypto.createHash('md5').update(content).digest('hex')

export { encrypt, decrypt, md5 }
