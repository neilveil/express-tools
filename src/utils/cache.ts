import fs from 'fs'

const SFE_SID = process.env.SFE_SID || ''

const filepath = (SFE_SID ? `.${SFE_SID}` : '') + '.sfe'

const defaultData = {
  id: 0
}

const get = (key?: string): any => {
  if (!fs.existsSync(filepath)) fs.writeFileSync(filepath, JSON.stringify(defaultData))

  const content = JSON.parse(fs.readFileSync(filepath).toString() || '{}')
  if (key) return content[key]
  else return content
}

// eslint-disable-next-line
const set = (key: string, value: any): void => {
  const content = get()
  content[key] = value
  fs.writeFileSync(filepath, JSON.stringify(content))
}

export default { get, set }
