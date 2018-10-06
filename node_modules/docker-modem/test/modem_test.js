var assert = require('assert');
var Modem = require('../lib/modem');

describe('Modem', function() {
  beforeEach(function() {
    delete process.env.DOCKER_HOST;
  });

  it('should default to /var/run/docker.sock', function() {
    var modem = new Modem();
    assert.ok(modem.socketPath);
    assert.strictEqual(modem.socketPath, '/var/run/docker.sock');
  });

  it('should allow DOCKER_HOST=unix:///path/to/docker.sock', function() {
    process.env.DOCKER_HOST = 'unix:///tmp/docker.sock';

    var modem = new Modem();
    assert.ok(modem.socketPath);
    assert.strictEqual(modem.socketPath, '/tmp/docker.sock');
  });

  it('should interpret DOCKER_HOST=unix:// as /var/run/docker.sock', function() {
    process.env.DOCKER_HOST = 'unix://';

    var modem = new Modem();
    assert.ok(modem.socketPath);
    assert.strictEqual(modem.socketPath, '/var/run/docker.sock');
  });

  it('should interpret DOCKER_HOST=tcp://N.N.N.N:2376 as https', function() {
    process.env.DOCKER_HOST = 'tcp://192.168.59.103:2376';

    var modem = new Modem();
    assert.ok(modem.host);
    assert.ok(modem.port);
    assert.ok(modem.protocol);
    assert.strictEqual(modem.host, '192.168.59.103');
    assert.strictEqual(modem.port, '2376');
    assert.strictEqual(modem.protocol, 'https');
  });

  it('should interpret DOCKER_HOST=tcp://N.N.N.N:5555 as http', function() {
    delete process.env.DOCKER_TLS_VERIFY;
    process.env.DOCKER_HOST = 'tcp://192.168.59.105:5555';

    var modem = new Modem();
    assert.ok(modem.host);
    assert.ok(modem.port);
    assert.ok(modem.protocol);
    assert.strictEqual(modem.host, '192.168.59.105');
    assert.strictEqual(modem.port, '5555');
    assert.strictEqual(modem.protocol, 'http');
  });

  it('should interpret DOCKER_HOST=tcp://N.N.N.N:5555 as http', function() {
    process.env.DOCKER_TLS_VERIFY = '1';
    process.env.DOCKER_HOST = 'tcp://192.168.59.105:5555';

    var modem = new Modem();
    assert.ok(modem.host);
    assert.ok(modem.port);
    assert.ok(modem.protocol);
    assert.strictEqual(modem.host, '192.168.59.105');
    assert.strictEqual(modem.port, '5555');
    assert.strictEqual(modem.protocol, 'https');
  });

  it('should accept DOCKER_HOST=N.N.N.N:5555 as http', function() {
    delete process.env.DOCKER_TLS_VERIFY;
    process.env.DOCKER_HOST = '192.168.59.105:5555';

    var modem = new Modem();
    assert.ok(modem.host);
    assert.ok(modem.port);
    assert.ok(modem.protocol);
    assert.strictEqual(modem.host, '192.168.59.105');
    assert.strictEqual(modem.port, '5555');
    assert.strictEqual(modem.protocol, 'http');
  });

  it('should auto encode querystring option maps as JSON', function() {
    var modem = new Modem();

    var opts = {
      "limit": 12,
      "filters": {
        "label": ["staging", "env=green"]
      },
      "t": ["repo:latest", "repo:1.0.0"]
    };
    var control = 'limit=12&filters={"label"%3A["staging"%2C"env%3Dgreen"]}&t=repo%3Alatest&t=repo%3A1.0.0';
    var qs = modem.buildQuerystring(opts);
    assert.strictEqual(decodeURI(qs), control);
  });

  it('should parse DOCKER_CLIENT_TIMEOUT from environment', function() {
    process.env.DOCKER_HOST = '192.168.59.105:5555';
    process.env.DOCKER_CLIENT_TIMEOUT = 3000;

    var modem = new Modem();
    assert.strictEqual(modem.timeout, 3000);
  });

});
