var http = require('http');
var https = require('https');
var net = require('net');
var fs = require('fs');
var path = require('path');
var should = require('should');
var tunnel = require('../index');

function readPem(file) {
  return fs.readFileSync(path.join('test/keys', file + '.pem'));
}

var serverKey = readPem('server2-key');
var serverCert = readPem('server2-cert');
var serverCA = readPem('ca1-cert');
var proxyKey = readPem('proxy2-key');
var proxyCert = readPem('proxy2-cert');
var proxyCA = readPem('ca2-cert');
var client1Key = readPem('client1-key');
var client1Cert = readPem('client1-cert');
var client1CA = readPem('ca3-cert');
var client2Key = readPem('client2-key');
var client2Cert = readPem('client2-cert');
var client2CA = readPem('ca4-cert');

describe('HTTPS over HTTPS authentication failed', function() {
  it('should finish without error', function(done) {
    var serverPort = 3008;
    var proxyPort = 3009;
    var serverConnect = 0;
    var proxyConnect = 0;
    var clientRequest = 0;
    var clientConnect = 0;
    var clientError = 0;
    var server;
    var proxy;

    server = https.createServer({
      key: serverKey,
      cert: serverCert,
      ca: [client1CA],
      requestCert: true,
      rejectUnauthorized: true
    }, function(req, res) {
      tunnel.debug('SERVER: got request', req.url);
      ++serverConnect;
      req.on('data', function(data) {
      });
      req.on('end', function() {
        res.writeHead(200);
        res.end('Hello, ' + serverConnect);
        tunnel.debug('SERVER: sending response');
      });
      req.resume();
    });
    //server.addContext('server2', {
    //  key: serverKey,
    //  cert: serverCert,
    //  ca: [client1CA],
    //});
    server.listen(serverPort, setupProxy);

    function setupProxy() {
      proxy = https.createServer({
        key: proxyKey,
        cert: proxyCert,
        ca: [client2CA],
        requestCert: true,
        rejectUnauthorized: true
      }, function(req, res) {
        should.fail();
      });
      //proxy.addContext('proxy2', {
      //  key: proxyKey,
      //  cert: proxyCert,
      //  ca: [client2CA],
      //});
      proxy.on('upgrade', onConnect); // for v0.6
      proxy.on('connect', onConnect); // for v0.7 or later

      function onConnect(req, clientSocket, head) {
        req.method.should.equal('CONNECT');
        req.url.should.equal('localhost:' + serverPort);
        req.headers.should.not.have.property('transfer-encoding');
        ++proxyConnect;

        var serverSocket = net.connect(serverPort, function() {
          tunnel.debug('PROXY: replying to client CONNECT request');
          clientSocket.write('HTTP/1.1 200 Connection established\r\n\r\n');
          clientSocket.pipe(serverSocket);
          serverSocket.write(head);
          serverSocket.pipe(clientSocket);
          // workaround, see #2524
          serverSocket.on('end', function() {
            clientSocket.end();
          });
        });
      }
      proxy.listen(proxyPort, setupClient);
    }

    function setupClient() {
      function doRequest(name, options, host) {
        tunnel.debug('CLIENT: Making HTTPS request (%s)', name);
        ++clientRequest;
        var agent = tunnel.httpsOverHttps(options);
        var req = https.get({
          host: 'localhost',
          port: serverPort,
          path: '/' + encodeURIComponent(name),
          headers: {
            host: host ? host : 'localhost',
          },
          rejectUnauthorized: true,
          agent: agent
        }, function(res) {
          tunnel.debug('CLIENT: got HTTPS response (%s)', name);
          ++clientConnect;
          res.on('data', function(data) {
          });
          res.on('end', function() {
            req.emit('finish');
          });
          res.resume();
        });
        req.on('error', function(err) {
          tunnel.debug('CLIENT: failed HTTP response (%s)', name, err);
          ++clientError;
          req.emit('finish');
        });
        req.on('finish', function() {
          if (clientConnect + clientError === clientRequest) {
            proxy.close();
            server.close();
          }
        });
      }

      doRequest('no cert origin nor proxy', { // invalid
        maxSockets: 1,
        ca: [serverCA],
        rejectUnauthorized: true,
        // no certificate for origin server
        proxy: {
          port: proxyPort,
          ca: [proxyCA],
          rejectUnauthorized: true,
          headers: {
            host: 'proxy2'
          }
          // no certificate for proxy
        }
      }, 'server2');

      doRequest('no cert proxy', { // invalid
        maxSockets: 1,
        ca: [serverCA],
        rejectUnauthorized: true,
        // client certification for origin server
        key: client1Key,
        cert: client1Cert,
        proxy: {
          port: proxyPort,
          ca: [proxyCA],
          rejectUnauthorized: true,
          headers: {
            host: 'proxy2'
          }
          // no certificate for proxy
        }
      }, 'server2');

      doRequest('no cert origin', { // invalid
        maxSockets: 1,
        ca: [serverCA],
        rejectUnauthorized: true,
        // no certificate for origin server
        proxy: {
          port: proxyPort,
          servername: 'proxy2',
          ca: [proxyCA],
          rejectUnauthorized: true,
          headers: {
            host: 'proxy2'
          },
          // client certification for proxy
          key: client2Key,
          cert: client2Cert
        }
      }, 'server2');

      doRequest('invalid proxy server name', { // invalid
        maxSockets: 1,
        ca: [serverCA],
        rejectUnauthorized: true,
        // client certification for origin server
        key: client1Key,
        cert: client1Cert,
        proxy: {
          port: proxyPort,
          ca: [proxyCA],
          rejectUnauthorized: true,
          // client certification for proxy
          key: client2Key,
          cert: client2Cert,
        }
      }, 'server2');

      doRequest('invalid origin server name', { // invalid
        maxSockets: 1,
        ca: [serverCA],
        rejectUnauthorized: true,
        // client certification for origin server
        key: client1Key,
        cert: client1Cert,
        proxy: {
          port: proxyPort,
          servername: 'proxy2',
          ca: [proxyCA],
          rejectUnauthorized: true,
          headers: {
            host: 'proxy2'
          },
          // client certification for proxy
          key: client2Key,
          cert: client2Cert
        }
      });

      doRequest('valid', { // valid
        maxSockets: 1,
        ca: [serverCA],
        rejectUnauthorized: true,
        // client certification for origin server
        key: client1Key,
        cert: client1Cert,
        proxy: {
          port: proxyPort,
          servername: 'proxy2',
          ca: [proxyCA],
          rejectUnauthorized: true,
          headers: {
            host: 'proxy2'
          },
          // client certification for proxy
          key: client2Key,
          cert: client2Cert
        }
      }, 'server2');
    }

    server.on('close', function() {
      serverConnect.should.equal(1);
      proxyConnect.should.equal(3);
      clientConnect.should.equal(1);
      clientError.should.equal(5);

      done();
    });
  });
});
