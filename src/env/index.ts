import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

const load = () => {
  const envPath = path.join(process.cwd(), process.env.ENVF || '.env')

  const envExists = fs.existsSync(envPath) && fs.statSync(envPath).isFile()

  if (envExists)
    fs.readFileSync(envPath, { encoding: 'utf8' })
      .split('\n')
      .filter(x => !x.startsWith('#') && x.trim() && x.includes('='))
      .forEach(x => {
        const key = x.split('=')[0].trim()
        const value = x.split('=').slice(1).join('=').trim()
        process.env[key] = value
      })
  else if (process.env.ENVF) {
    console.error(chalk.redBright(`"${envPath}" file not found!`))
    process.exit(1)
  }
}

load()

const env = (key: string, defaultValue?: any) => process.env[key] || defaultValue || ''
env.refresh = load

export default env
