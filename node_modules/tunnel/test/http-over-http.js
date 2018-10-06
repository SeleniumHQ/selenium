var http = require('http');
var net = require('net');
var should = require('should');
var tunnel = require('../index');

describe('HTTP over HTTP', function() {
  it('should finish without error', function(done) {
    var serverPort = 3000;
    var proxyPort = 3001;
    var poolSize = 3;
    var N = 10;
    var serverConnect = 0;
    var proxyConnect = 0;
    var clientConnect = 0;
    var server;
    var proxy;
    var agent;
    
    server = http.createServer(function(req, res) {
      tunnel.debug('SERVER: got request');
      ++serverConnect;
      res.writeHead(200);
      res.end('Hello' + req.url);
      tunnel.debug('SERVER: sending response');
    });
    server.listen(serverPort, setupProxy);

    function setupProxy() {
      proxy = http.createServer(function(req, res) {
        should.fail();
      });
      proxy.on('upgrade', onConnect); // for v0.6
      proxy.on('connect', onConnect); // for v0.7 or later

      function onConnect(req, clientSocket, head) {
        tunnel.debug('PROXY: got CONNECT request');

        req.method.should.equal('CONNECT');
        req.url.should.equal('localhost:' + serverPort);
        req.headers.should.not.have.property('transfer-encoding');
        req.headers.should.have.property('proxy-authorization',
            'Basic ' + new Buffer('user:password').toString('base64'));
        ++proxyConnect;
    
        tunnel.debug('PROXY: creating a tunnel');
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
      agent = tunnel.httpOverHttp({
        maxSockets: poolSize,
        proxy: {
          port: proxyPort,
          proxyAuth: 'user:password'
        }
      });

      for (var i = 0; i < N; ++i) {
        doClientRequest(i);
      }

      function doClientRequest(i) {
        tunnel.debug('CLIENT: Making HTTP request (%d)', i);
        var req = http.get({
          port: serverPort,
          path: '/' + i,
          agent: agent
        }, function(res) {
          tunnel.debug('CLIENT: got HTTP response (%d)', i);
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
    
      agent.sockets.should.be.empty;
      agent.requests.should.be.empty;
  
      done();
    });
  });
});
