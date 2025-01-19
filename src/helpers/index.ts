import chalk from 'chalk'
import fs from 'fs'
import os from 'os'
import path from 'path'

const getLocalIPList = () => {
  const ipList = Object.values(os.networkInterfaces())
    .map(x => (x && x[0] ? x[0].address : null))
    .filter(ip =>
      /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(
        ip || ''
      )
    )

  if (ipList.includes('127.0.0.1')) ipList.unshift('localhost')

  return ipList
}

export const printStartLogs = (port: number) => {
  const seperator = '\n-x-x-x-x-x-\n'
  const ipList = getLocalIPList()

  console.log(seperator)
  console.log(chalk.bgWhite.black('  Express Tools  '))
  console.log(seperator)
  console.log(chalk.green(`Server started at: ` + new Date().toISOString() + '\n'))
  ipList.map(ip => console.log(`Server running on: ` + chalk.blueBright(`${`http://${ip}:${port}`}`)))
  console.log(seperator)
}

export const loadENV = () => {
  const envPath = path.join(process.cwd(), process.env.ET_ENVF || '.env')

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
  else if (process.env.ET_ENVF) {
    console.error(chalk.redBright(`"${envPath}" file not found!`))
    process.exit(1)
  }
}
