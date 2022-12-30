class FilterBy {
  constructor(level) {
    this.level_ = level
  }

  static logLevel(level) {
    if (
      level === undefined ||
      (level != undefined &&
        !['debug', 'error', 'info', 'warning'].includes(level))
    ) {
      throw Error(
        `Please pass valid log level. Valid log levels are 'debug', 'error', 'info' and 'warning'. Received: ${level}`
      )
    }

    return new FilterBy(level)
  }

  getLevel() {
    return this.level_
  }
}

// PUBLIC API

module.exports = {
  FilterBy,
}
