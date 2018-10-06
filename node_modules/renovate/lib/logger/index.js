const is = require('@sindresorhus/is');
const bunyan = require('bunyan');
const PrettyStdout = require('./pretty-stdout').RenovateStream;
const configSerializer = require('./config-serializer');
const errSerializer = require('./err-serializer');

let bunyanLogger;
let meta = {};

function initLogger() {
  const stdout = {
    name: 'stdout',
    level: process.env.LOG_LEVEL || 'info',
    stream: process.stdout,
  };

  if (process.env.LOG_FORMAT !== 'json') {
    const prettyStdOut = new PrettyStdout();
    prettyStdOut.pipe(process.stdout);
    stdout.type = 'raw';
    stdout.stream = prettyStdOut;
  }

  bunyanLogger = bunyan.createLogger({
    name: 'renovate',
    serializers: {
      body: configSerializer,
      config: configSerializer,
      err: errSerializer,
    },
    streams: [stdout],
  });

  global.logger = {};

  const logFunctions = [
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal',
    'child',
  ];
  logFunctions.forEach(x => {
    global.logger[x] = (p1, p2) => {
      global.renovateError = global.renovateError || x === 'error';
      if (p2) {
        // meta and msg provided
        return bunyanLogger[x]({ ...meta, ...p1 }, p2);
      }
      if (is.string(p1)) {
        // only message provided
        return bunyanLogger[x](meta, p1);
      }
      // only meta provided
      return bunyanLogger[x]({ ...meta, ...p1 });
    };
  });
  global.logger.master = bunyanLogger;
  global.logger.addStream = stream => {
    bunyanLogger.addStream(stream);
  };
  global.logger.levels = (stream, level) => {
    bunyanLogger.levels(stream, level);
  };

  // setMeta overrides existing meta
  global.logger.setMeta = function setMeta(obj) {
    meta = { ...obj };
  };
}

module.exports = {
  initLogger,
};
