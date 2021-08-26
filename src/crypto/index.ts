import crypto from 'crypto'

const ET_ENC_KEY = process.env.ET_ENC_KEY || ''
const ET_ENC_IV = process.env.ET_ENC_IV || ''
const NODE_ENV = process.env.NODE_ENV

const _resize = (data: string, size: number, fill = 'X') =>
  data.substr(0, size) + fill.repeat(size - data.substr(0, size).length)

const isEnabled = (ET_ENC_KEY && ET_ENC_IV) || NODE_ENV === 'sfe-test' ? true : false

const KEY = _resize(ET_ENC_KEY, 32)
const IV = _resize(ET_ENC_IV, 16)

const stop = () => {
  console.error('Please set ET_ENC_KEY & ET_ENC_IV env variables first to use SFE encryption!')
  process.exit(1)
}

const encrypt = (data: Buffer | string): string => {
  if (!isEnabled) stop()

  if (typeof data === 'string') data = Buffer.from(data, 'binary')

  const dataString = data.toString('base64')

  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, IV)
  const encd = cipher.update(dataString, 'binary', 'base64') + cipher.final('base64')

  return encd
    .split('')
    .map(x => (x === '/' ? '$' : x))
    .join('')
}

const decrypt = (data: string, stringify = true): Buffer | string => {
  data = data
    .split('')
    .map(x => (x === '$' ? '/' : x))
    .join('')

  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV)

  if (stringify)
    return Buffer.from(decipher.update(data, 'base64', 'binary') + decipher.final('binary'), 'base64').toString()
  else return Buffer.from(decipher.update(data, 'base64', 'binary') + decipher.final('binary'), 'base64')
}

export { encrypt, decrypt }
