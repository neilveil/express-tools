import crypto from 'crypto'

export default (content: string): string => crypto.createHash('md5').update(content).digest('hex')
