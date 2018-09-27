var fs = require('fs');
var tls = require('tls');

var server1Key = fs.readFileSync(__dirname + '/server1-key.pem');
var server1Cert = fs.readFileSync(__dirname + '/server1-cert.pem');
var clientKey = fs.readFileSync(__dirname + '/client-key.pem');
var clientCert = fs.readFileSync(__dirname + '/client-cert.pem');
var ca1Cert = fs.readFileSync(__dirname + '/ca1-cert.pem');
var ca3Cert = fs.readFileSync(__dirname + '/ca3-cert.pem');

var server = tls.createServer({
  key: server1Key,
  cert: server1Cert,
  ca: [ca3Cert],
  requestCert: true,
  rejectUnauthorized: true,
}, function(s) {
  console.log('connected on server');
  s.on('data', function(chunk) {
    console.log('S:' + chunk);
    s.write(chunk);
  });
  s.setEncoding('utf8');
}).listen(3000, function() {
  var c = tls.connect({
    host: 'localhost',
    port: 3000,
    key: clientKey,
    cert: clientCert,
    ca: [ca1Cert],
    rejectUnauthorized: true
  }, function() {
    console.log('connected on client');
    c.on('data', function(chunk) {
      console.log('C:' + chunk);
    });
    c.setEncoding('utf8');
    c.write('Hello');
  });
  c.on('error', function(err) {
    console.log(err);
  });
});
