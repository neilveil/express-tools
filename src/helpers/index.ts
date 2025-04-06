import chalk from 'chalk'
import os from 'os'
import { etConfig } from '..'

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

const seperator = '\n-x-x-x-x-x-\n'

export const printStartLogs = (port: number) => {
  const ipList = getLocalIPList()

  console.log(seperator)
  console.log(chalk.bgWhite.black('  Express Tools  '))
  console.log(seperator)
  console.log(chalk.green(`Server started at: ` + new Date().toISOString() + '\n'))
  ipList.map(ip => console.log(`Server running on: ` + chalk.blueBright(`${`http://${ip}:${port}`}`)))
  console.log(seperator)
}

export const printStopLogs = () => {
  console.log(seperator)
  console.log(
    chalk.red(`Server${etConfig.gracefulShutdown ? ' gracefully ' : ' '}stopped at: ` + new Date().toISOString())
  )
  console.log(seperator)
}
