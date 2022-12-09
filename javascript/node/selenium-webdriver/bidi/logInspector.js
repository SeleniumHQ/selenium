const BIDI = require('./bidi')

const LOG_LEVEL = {
  DEBUG: 'debug',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
}

class LogInspector {
  bidi
  ws

  constructor (driver, browsingContextIds) {
    this.debug = []
    this.error = []
    this.info = []
    this.warn = []
    this._driver = driver
    this._browsingContextIds = browsingContextIds
  }

  async init () {
    this.bidi = await this._driver.getBidi()
    // TODO this.bidi should have bidi instance need to remove connect once api is done
    await this.bidi.connect()
    await this.bidi.subscribe('log.entryAdded', this._browsingContextIds)
  }

  async listen () {
    this.ws = await this.bidi.socket

    this.ws.on('message', event => {
      const data = JSON.parse(Buffer.from(event.toString()))
      console.log(data)
      switch (data.params.level) {
        case LOG_LEVEL.INFO:
          this.info.push(data.params)
          break

        case LOG_LEVEL.DEBUG:
          this.debug.push(data.params)
          break

        case LOG_LEVEL.ERROR:
          this.error.push(data.params)
          break

        case LOG_LEVEL.WARNING:
          this.warn.push(data.params)
          break

        default:
        // Unknown websocket message type
      }
    })
  }

  // TODO below are used to check,will be replaced by spec methods as described in doc
  get infoLogs () {
    return this.info
  }

  get debugLogs () {
    return this.debug
  }

  get errorLogs () {
    return this.error
  }

  get warnLogs () {
    return this.warn
  }

}

let instance = undefined

async function getInstance (driver, browsingContextIds) {

  if (instance === undefined) {
    instance = new LogInspector(driver, browsingContextIds)
    await instance.init()
    await instance.listen()
    Object.freeze(instance)
  }
  return instance
}

module.exports = getInstance
