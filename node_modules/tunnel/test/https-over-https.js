var http = require('http');
var https = require('https');
var net = require('net');
var fs = require('fs');
var path = require('path');
var should = require('should');
var tunnel = require('../index.js');

function readPem(file) {
  return fs.readFileSync(path.join('test/keys', file + '.pem'));
}

var serverKey = readPem('server1-key');
var serverCert = readPem('server1-cert');
var serverCA = readPem('ca1-cert');
var proxyKey = readPem('proxy1-key');
var proxyCert = readPem('proxy1-cert');
var proxyCA = readPem('ca2-cert');
var client1Key = readPem('client1-key');
var client1Cert = readPem('client1-cert');
var client1CA = readPem('ca3-cert');
var client2Key = readPem('client2-key');
var client2Cert = readPem('client2-cert');
var client2CA = readPem('ca4-cert');

describe('HTTPS over HTTPS', function() {
  it('should finish without error', function(done) {
    var serverPort = 3006;
    var proxyPort = 3007;
    var poolSize = 3;
    var N = 5;
    var serverConnect = 0;
    var proxyConnect = 0;
    var clientConnect = 0;
    var server;
    var proxy;
    var agent;

    server = https.createServer({
      key: serverKey,
      cert: serverCert,
      ca: [client1CA],
      requestCert: true,
      rejectUnauthorized: true
    }, function(req, res) {
      tunnel.debug('SERVER: got request');
      ++serverConnect;
      res.writeHead(200);
      res.end('Hello' + req.url);
      tunnel.debug('SERVER: sending response');
    });
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
      proxy.on('upgrade', onConnect); // for v0.6
      proxy.on('connect', onConnect); // for v0.7 or later

      function onConnect(req, clientSocket, head) {
        tunnel.debug('PROXY: got CONNECT request');
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
          // workaround, see joyent/node#2524
          serverSocket.on('end', function() {
            clientSocket.end();
          });
        });
      }
      proxy.listen(proxyPort, setupClient);
    }

    function setupClient() {
      agent = tunnel.httpsOverHttps({
        maxSockets: poolSize,
        // client certification for origin server
        key: client1Key,
        cert: client1Cert,
        ca: [serverCA],
        rejectUnauthroized: true,
        proxy: {
          port: proxyPort,
          // client certification for proxy
          key: client2Key,
          cert: client2Cert,
          ca: [proxyCA],
          rejectUnauthroized: true
        }
      });

      for (var i = 0; i < N; ++i) {
        doClientRequest(i);
      }

      function doClientRequest(i) {
        tunnel.debug('CLIENT: Making HTTPS request (%d)', i);
        var req = https.get({
          port: serverPort,
          path: '/' + i,
          agent: agent
        }, function(res) {
          tunnel.debug('CLIENT: got HTTPS response (%d)', i);
          res.setEncoding('utf8');
          res.on('data', function(data) {
            data.should.equal('Hello/' + i);
          });
          res.on('end', function() {
            ++clientConnect;
            if (clientConnect === N) {
              proxy.close();
              server.close();
            }
          });
        });
      }
    }

    server.on('close', function() {
      serverConnect.should.equal(N);
      proxyConnect.should.equal(poolSize);
      clientConnect.should.equal(N);

      var name = 'localhost:' + serverPort;
      agent.sockets.should.be.empty;
      agent.requests.should.be.empty;
  
      done();
    });
  });
});
