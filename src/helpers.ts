import os from 'os'

const getLocalIPList = () =>
  Object.values(os.networkInterfaces())
    .map(x => (x && x[0] ? x[0].address : null))
    .filter(ip =>
      /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(
        ip || ''
      )
    )

const getServerHostList = (port: number) => {
  const ipList = getLocalIPList()
  if (ipList.includes('127.0.0.1')) ipList.unshift('localhost')
  return ipList.map(ip => `http://${ip}:${port}`)
}

export { getLocalIPList, getServerHostList }
