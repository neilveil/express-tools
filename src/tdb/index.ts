import fs from 'fs'
import path from 'path'
import _env from '../env'

const tdbFilePath = path.resolve(_env('ET_TDB_FILE', '.tdb.json'))

type key = number | string
type value = any

const _tdbFileExists = () => fs.existsSync(tdbFilePath) && fs.statSync(tdbFilePath).isFile()

const init = () => {
  if (!fs.existsSync(tdbFilePath)) fs.writeFileSync(tdbFilePath, '{}')
}

const get = (key?: key, defaultValue?: any) => {
  if (!_tdbFileExists()) return

  const content = fs.readFileSync(tdbFilePath).toString()

  const parsedContent = JSON.parse(content)

  return (key ? parsedContent[key] : parsedContent) || defaultValue
}

const set = (key: key, value?: value) => {
  if (!_tdbFileExists()) return

  const tdb = get()

  tdb[key] = value

  fs.writeFileSync(tdbFilePath, JSON.stringify(tdb))
}

const clear = (key?: key) => {
  if (!_tdbFileExists()) return

  const tdb = get()

  if (key) delete tdb[key]

  fs.writeFileSync(tdbFilePath, JSON.stringify(key ? tdb : {}))
}

export default { init, get, set, clear }
