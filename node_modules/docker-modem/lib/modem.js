function parseJSON(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}

var querystring = require('querystring'),
  http = require('./http'),
  fs = require('fs'),
  path = require('path'),
  url = require('url'),
  stream = require('readable-stream'),
  HttpDuplex = require('./http_duplex'),
  debug = require('debug')('modem'),
  util = require('util'),
  splitca = require('split-ca'),
  JSONStream = require('JSONStream'),
  isWin = require('os').type() === 'Windows_NT';

var defaultOpts = function() {
  var split;
  var opts = {};

  if (!process.env.DOCKER_HOST) {
    // Windows socket path: //./pipe/docker_engine ( Windows 10 )
    // Linux & Darwin socket path: /var/run/docker.sock
    opts.socketPath = isWin ? '//./pipe/docker_engine' : '/var/run/docker.sock';
  } else if (process.env.DOCKER_HOST.indexOf('unix://') === 0) {
    // Strip off unix://, fall back to default of /var/run/docker.sock if
    // unix:// was passed without a path
    opts.socketPath = process.env.DOCKER_HOST.substring(7) || '/var/run/docker.sock';
  } else {
    split = /(?:tcp:\/\/)?(.*?):([0-9]+)/g.exec(process.env.DOCKER_HOST);

    if (!split || split.length !== 3) {
      throw new Error('DOCKER_HOST env variable should be something like tcp://localhost:1234');
    }

    opts.port = split[2];

    if (process.env.DOCKER_TLS_VERIFY === '1' || opts.port === '2376') {
      opts.protocol = 'https';
    } else {
      opts.protocol = 'http';
    }

    opts.host = split[1];

    if (process.env.DOCKER_CERT_PATH) {
      opts.ca = splitca(path.join(process.env.DOCKER_CERT_PATH, 'ca.pem'));
      opts.cert = fs.readFileSync(path.join(process.env.DOCKER_CERT_PATH, 'cert.pem'));
      opts.key = fs.readFileSync(path.join(process.env.DOCKER_CERT_PATH, 'key.pem'));
    }

    if (process.env.DOCKER_CLIENT_TIMEOUT) {
      opts.timeout = parseInt(process.env.DOCKER_CLIENT_TIMEOUT, 10);
    }
  }

  return opts;
};

var Modem = function(opts) {
  if (!opts) {
    opts = defaultOpts();
  }

  this.socketPath = opts.socketPath;
  this.host = opts.host;
  this.port = opts.port;
  this.version = opts.version;
  this.key = opts.key;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.timeout = opts.timeout;
  this.checkServerIdentity = opts.checkServerIdentity;

  if (this.key && this.cert && this.ca) {
    this.protocol = 'https';
  }
  this.protocol = opts.protocol || this.protocol || 'http';
};

Modem.prototype.dial = function(options, callback) {
  var opts, address, data;
  var self = this;

  if (options.options) {
    opts = options.options;
  }

  // Prevent credentials from showing up in URL
  if (opts && opts.authconfig) {
    delete opts.authconfig;
  }

  if (this.version) {
    options.path = '/' + this.version + options.path;
  }

  if (this.host) {
    var parsed = url.parse(self.host);
    address = url.format({
      'protocol': parsed.protocol || self.protocol,
      'hostname': parsed.hostname || self.host,
      'port': self.port
    });
    address = url.resolve(address, options.path);
  } else {
    address = options.path;
  }

  if (options.path.indexOf('?') !== -1) {
    if (opts && Object.keys(opts).length > 0) {
      address += this.buildQuerystring(opts._query || opts);
    } else {
      address = address.substring(0, address.length - 1);
    }
  }

  var optionsf = {
    path: address,
    method: options.method,
    headers: options.headers || {},
    key: self.key,
    cert: self.cert,
    ca: self.ca
  };

  if (this.checkServerIdentity) {
    optionsf.checkServerIdentity = this.checkServerIdentity;
  }

  if (options.authconfig) {
    optionsf.headers['X-Registry-Auth'] = options.authconfig.key || options.authconfig.base64 ||
      new Buffer(JSON.stringify(options.authconfig)).toString('base64');
  }

  if (options.registryconfig) {
    optionsf.headers['X-Registry-Config'] = options.registryconfig.base64 ||
      new Buffer(JSON.stringify(options.registryconfig)).toString('base64');
  }

  if (options.file) {
    if (typeof options.file === 'string') {
      data = fs.createReadStream(path.resolve(options.file));
    } else {
      data = options.file;
    }
    optionsf.headers['Content-Type'] = 'application/tar';
  } else if (opts && options.method === 'POST') {
    data = JSON.stringify(opts._body || opts);
    if(options.allowEmpty) {
      optionsf.headers['Content-Type'] = 'application/json';
    } else {
      if (data !== '{}' && data !== '""') {
        optionsf.headers['Content-Type'] = 'application/json';
      } else {
        data = undefined;
      }
    }
  }

  if (typeof data === "string") {
    optionsf.headers['Content-Length'] = Buffer.byteLength(data);
  } else if (Buffer.isBuffer(data) === true) {
    optionsf.headers['Content-Length'] = data.length;
  } else if (optionsf.method === 'PUT' || options.hijack || options.openStdin) {
    optionsf.headers['Transfer-Encoding'] = 'chunked';
  }

  if (options.hijack) {
    optionsf.headers.Connection = 'Upgrade';
    optionsf.headers.Upgrade = 'tcp';
  }

  if (this.socketPath) {
    optionsf.socketPath = this.socketPath;
  } else {
    var urlp = url.parse(address);
    optionsf.hostname = urlp.hostname;
    optionsf.port = urlp.port;
    optionsf.path = urlp.path;
  }

  this.buildRequest(optionsf, options, data, callback);
};

Modem.prototype.buildRequest = function(options, context, data, callback) {
  var self = this;
  var req = http[self.protocol].request(options, function() {});

  debug('Sending: %s', util.inspect(options, {
    showHidden: true,
    depth: null
  }));

  if (self.timeout) {
    req.on('socket', function(socket) {
      socket.setTimeout(self.timeout);
      socket.on('timeout', function() {
        debug('Timeout of %s ms exceeded', self.timeout);
        req.abort();
      });
    });
  }

  if (context.hijack === true) {
    req.on('upgrade', function(res, sock, head) {
      return callback(null, sock);
    });
  }

  req.on('response', function(res) {
    if (context.isStream === true) {
      self.buildPayload(null, context.isStream, context.statusCodes, context.openStdin, req, res, null, callback);
    } else {
      var chunks = '';
      res.on('data', function(chunk) {
        chunks += chunk;
      });

      res.on('end', function() {
        debug('Received: %s', chunks);

        var json = parseJSON(chunks) || chunks;
        self.buildPayload(null, context.isStream, context.statusCodes, false, req, res, json, callback);
      });
    }
  });

  req.on('error', function(error) {
    self.buildPayload(error, context.isStream, context.statusCodes, false, {}, {}, null, callback);
  });

  if (typeof data === "string" || Buffer.isBuffer(data)) {
    req.write(data);
  } else if (data) {
    data.pipe(req);
  }

  if (!context.hijack && !context.openStdin && (typeof data === "string" || data === undefined || Buffer.isBuffer(data))) {
    req.end();
  }
};

Modem.prototype.buildPayload = function(err, isStream, statusCodes, openStdin, req, res, json, cb) {
  if (err) return cb(err, null);

  if (statusCodes[res.statusCode] !== true) {
    getCause(isStream, res, json, function(err, cause) {
      var msg = new Error(
        '(HTTP code ' + res.statusCode + ') ' +
        (statusCodes[res.statusCode] || 'unexpected') + ' - ' +
        (cause.message || cause) + ' '
      );
      msg.reason = statusCodes[res.statusCode];
      msg.statusCode = res.statusCode;
      msg.json = json;
      cb(msg, null);
    });
  } else {
    if (openStdin) {
      cb(null, new HttpDuplex(req, res));
    } else if (isStream) {
      cb(null, res);
    } else {
      cb(null, json);
    }
  }

  function getCause(isStream, res, json, callback) {
    var chunks = '';
    if (isStream) {
      res.on('data', function(chunk) {
        chunks += chunk;
      });
      res.on('end', function() {
        callback(null, parseJSON(chunks) || chunks);
      });
    } else {
      callback(null, json);
    }
  }
};

Modem.prototype.demuxStream = function(stream, stdout, stderr) {
  var header = null;

  stream.on('readable', function() {
    header = header || stream.read(8);
    while (header !== null) {
      var type = header.readUInt8(0);
      var payload = stream.read(header.readUInt32BE(4));
      if (payload === null) break;
      if (type == 2) {
        stderr.write(payload);
      } else {
        stdout.write(payload);
      }
      header = stream.read(8);
    }
  });
};

Modem.prototype.followProgress = function(stream, onFinished, onProgress) {
  var parser = JSONStream.parse(),
    output = [];

  parser.on('data', onStreamEvent);
  parser.on('error', onStreamError);
  parser.on('end', onStreamEnd);

  stream.pipe(parser);

  function onStreamEvent(evt) {
    if (!(evt instanceof Object)) {
      evt = {};
    }

    output.push(evt);

    if (evt.error) {
      return onStreamError(evt.error);
    }

    if (onProgress) {
      onProgress(evt);
    }
  }

  function onStreamError(err) {
    parser.removeListener('data', onStreamEvent);
    parser.removeListener('error', onStreamError);
    parser.removeListener('end', onStreamEnd);
    onFinished(err, output);
  }

  function onStreamEnd() {
    onFinished(null, output);
  }
};

Modem.prototype.buildQuerystring = function(opts) {
  var clone = {};

  // serialize map values as JSON strings, else querystring truncates.
  Object.keys(opts).map(function(key, i) {
    clone[key] = (opts[key] && typeof opts[key] === 'object' && key !== 't') ?
      JSON.stringify(opts[key]) : opts[key];
  });

  return querystring.stringify(clone);
};

module.exports = Modem;
