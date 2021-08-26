import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

let ENVF = process.env.ENVF

if (ENVF === undefined) ENVF = '.env'
else if (!fs.existsSync(ENVF)) {
  console.error(chalk.redBright(`"${ENVF}" env file not found!`))
  process.exit(1)
}

const envPath = path.join(process.cwd(), ENVF)

fs.existsSync(envPath) &&
  fs
    .readFileSync(envPath, { encoding: 'utf8' })
    .split('\n')
    .filter(x => !x.startsWith('#'))
    .map(x => (process.env[x.split('=')[0].trim()] = x.split('=').slice(1).join('=').trim()))
