# restify-clients

[![NPM Version](https://img.shields.io/npm/v/restify-clients.svg)](https://npmjs.org/package/restify-clients)
[![Build Status](https://travis-ci.org/restify/clients.svg?branch=master)](https://travis-ci.org/restify/clients)
[![Coverage Status](https://coveralls.io/repos/restify/clients/badge.svg?branch=master)](https://coveralls.io/r/restify/clients?branch=master)
[![Dependency Status](https://david-dm.org/restify/clients.svg)](https://david-dm.org/restify/clients)
[![devDependency Status](https://david-dm.org/restify/clients/dev-status.svg)](https://david-dm.org/restify/clients#info=devDependencies)
[![bitHound Score](https://www.bithound.io/github/restify/clients/badges/score.svg)](https://www.bithound.io/github/restify/clients/master)
[![NSP Status](https://img.shields.io/badge/NSP%20status-vulnerabilities%20found-red.svg)](https://travis-ci.org/restify/clients)

> HttpClient, StringClient, and JsonClient extracted from restify

This module contains HTTP clients extracted from restify.

* JsonClient - sends and expects application/json
* StringClient - sends url-encoded request and expects text/plain
* HttpClient - thin wrapper over node's http/https libraries

The idea being that if you want to support "typical" control-plane REST APIs, you probably want the JsonClient, or if you're using some other serialization (like XML) you'd write your own client that extends the StringClient. If you need streaming support, you'll need to do some work on top of the HttpClient, as StringClient and friends buffer requests/responses.

All clients support retry with exponential backoff for getting a TCP connection; they do not perform retries on 5xx error codes like previous versions of the restify client. You can set retry to false to disable this logic altogether. Also, all clients support a connectTimeout field, which is use on each retry. The default is not to set a connectTimeout, so you end up with the node.js socket defaults.

## Getting Started

Install the module with: `npm install restify-clients`

## Usage

### Client API

There are actually three separate clients shipped in restify:

* **JsonClient:** sends and expects application/json
* **StringClient:** sends url-encoded request and expects text/plain
* **HttpClient:** thin wrapper over node's http/https libraries

The idea being that if you want to support "typical" control-plane
REST APIs, you probably want the `JsonClient`, or if you're using some
other serialization (like XML) you'd write your own client that
extends the `StringClient`. If you need streaming support, you'll need
to do some work on top of the `HttpClient`, as `StringClient` and
friends buffer requests/responses.

All clients support retry with exponential backoff for getting a TCP
connection; they do not perform retries on 5xx error codes like
previous versions of the restify client.  You can set `retry` to `false` to
disable this logic altogether.  Also, all clients support a `connectTimeout`
field, which is use *on each retry*.  The default is not to set a
`connectTimeout`, so you end up with the node.js socket defaults.

Here's an example of hitting the
[Joyent CloudAPI](https://api.us-east-1.joyent.com):

```javascript
var clients = require('restify-clients');

// Creates a JSON client
var client = clients.createJsonClient({
  url: 'https://us-east-1.api.joyent.com'
});


client.basicAuth('$login', '$password');
client.get('/my/machines', function(err, req, res, obj) {
  assert.ifError(err);

  console.log(JSON.stringify(obj, null, 2));
});
```

As a short-hand, a client can be initialized with a string-URL rather than
an options object:

```javascript
var clients = require('restify-clients');

var client = clients.createJsonClient('https://us-east-1.api.joyent.com');
```

Note that all further documentation refers to the "short-hand" form of
methods like `get/put/del` which take a string path.  You can also
pass in an object to any of those methods with extra params (notably
headers):

```javascript
var options = {
  path: '/foo/bar',
  headers: {
    'x-foo': 'bar'
  },
  retry: {
    'retries': 0
  },
  agent: false
};

client.get(options, function(err, req, res) { .. });
```

If you need to interpose additional headers in the request before it is sent on
to the server, you can provide a synchronous callback function as the
`signRequest` option when creating a client.  This is particularly useful with
[node-http-signature](https://github.com/joyent/node-http-signature), which
needs to attach a cryptographic signature of selected outgoing headers.  If
provided, this callback will be invoked with a single parameter: the outgoing
`http.ClientRequest` object.

### JsonClient

The JSON Client is the highest-level client bundled with restify; it
exports a set of methods that map directly to HTTP verbs.  All
callbacks look like `function(err, req, res, [obj])`, where `obj` is
optional, depending on if content was returned. HTTP status codes are
not interpreted, so if the server returned 4xx or something with a
JSON payload, `obj` will be the JSON payload.  `err` however will be
set if the server returned a status code >= 400 (it will be one of the
restify HTTP errors).  If `obj` looks like a `RestError`:

    {
      "code": "FooError",
      "message": "some foo happened"
    }

then `err` gets "upconverted" into a `RestError` for you.  Otherwise
it will be an `HttpError`.

#### createJsonClient(options)

```javascript
var client = restify.createJsonClient({
  url: 'https://api.us-east-1.joyent.com',
  version: '*'
});
```    

### API Options:

|Name  | Type   | Description |
| :--- | :----: | :---- |
|accept|String|Accept header to send|
|audit|Boolean|Enable Audit logging|
|auditor|Function|Function for Audit logging|
|connectTimeout|Number|Amount of time to wait for a socket|
|contentMd5|Object|How response content-md5 headers are handled. See the [contentMd5](#contentMd5) option to StringClient|
|requestTimeout|Number|Amount of time to wait for the request to finish|
|dtrace|Object|node-dtrace-provider handle|
|gzip|Object|Will compress data when sent using `content-encoding: gzip`|
|headers|Object|HTTP headers to set in all requests|
|log|Object|[bunyan](https://github.com/trentm/node-bunyan) instance|
|retry|Object|options to provide to node-retry;"false" disables retry; defaults to 4 retries|
|safeStringify|Boolean|Safely serialize JSON objects, i.e. circular dependencies|
|signRequest|Function|synchronous callback for interposing headers before request is sent|
|url|String|Fully-qualified URL to connect to|
|userAgent|String|user-agent string to use; restify inserts one, but you can override it|
|version|String|semver string to set the accept-version|
|followRedirects|Boolean|Follow redirects from server|
|maxRedirects|Number|Maximum number of redirects to follow|
|proxy|String|An HTTP proxy URL string (or parsed URL object) to use for requests. If not specified, then the `https_proxy` or `http_proxy` environment variables are used. Pass `proxy: false` to explicitly disable using a proxy (i.e. to ensure a proxy URL is not picked up from environment variables). See the [Proxy](#proxy) section below.|
|noProxy|String|A comma-separated list of hosts for which to not use a proxy. If not specified, then then `NO_PROXY` environment variable is used. One can pass `noProxy: ''` to explicitly set this empty and ensure a possible environment variable is not used. See the [Proxy](#proxy) section below.|


#### get(path, callback)

Performs an HTTP get; if no payload was returned, `obj` defaults to
`{}` for you (so you don't get a bunch of null pointer errors).

```javascript
client.get('/foo/bar', function(err, req, res, obj) {
  assert.ifError(err);
  console.log('%j', obj);
});
```

#### head(path, callback)

Just like `get`, but without `obj`:

```javascript
client.head('/foo/bar', function(err, req, res) {
  assert.ifError(err);
  console.log('%d -> %j', res.statusCode, res.headers);
});
```

#### post(path, object, callback)

Takes a complete object to serialize and send to the server.

```javascript
client.post('/foo', { hello: 'world' }, function(err, req, res, obj) {
  assert.ifError(err);
  console.log('%d -> %j', res.statusCode, res.headers);
  console.log('%j', obj);
});
```

#### put(path, object, callback)

Just like `post`:

```javascript
client.put('/foo', { hello: 'world' }, function(err, req, res, obj) {
  assert.ifError(err);
  console.log('%d -> %j', res.statusCode, res.headers);
  console.log('%j', obj);
});
```

#### del(path, callback)

`del` doesn't take content, since you know, it should't:

```javascript
client.del('/foo/bar', function(err, req, res) {
  assert.ifError(err);
  console.log('%d -> %j', res.statusCode, res.headers);
});
```

### StringClient

`StringClient` is what `JsonClient` is built on, and provides a base
for you to write other buffering/parsing clients (like say an XML
client). If you need to talk to some "raw" HTTP server, then
`StringClient` is what you want, as it by default will provide you
with content uploads in `application/x-www-form-url-encoded` and
downloads as `text/plain`.  To extend a `StringClient`, take a look at
the source for `JsonClient`. Effectively, you extend it, and set the
appropriate options in the constructor and implement a `write` (for
put/post) and `parse` method (for all HTTP bodies), and that's it.

#### contentMd5

The `contentMd5` option to `StringClient` specifies how content-md5 response
headers are handled:

```javascript
var contentMd5 = {
  ignore: false,
  encodings: undefined
};
```

By default if a server responds with a `content-md5` header, `StringClient` will
automatically verify the response body md5 hash, and return a `BadDigest` error
when it does not match. You can disable this behaviour by setting the
`contentMd5.ignore` option to true when creating the StringClient instance. You
can also set the `contentMd5.encodings` property to be an array of encoding
names that StringClient will use to verify the md5. The default encoding is
"utf8" for node 6 and above, and "binary" (a latin1 encoding) for node 4 and
older (as node changed the default crypto hash encoding between versions 4 and
6). To support content-md5 hashes generated by both node 4 and 6 servers, you
can specify `contentMd5.encodings = ["utf8", "binary"]` when creating the
StringClient instance.

#### createStringClient(options)

```javascript
var client = restify.createStringClient({
  url: 'https://example.com'
});
```

#### get(path, callback)

Performs an HTTP get; if no payload was returned, `data` defaults to
`''` for you (so you don't get a bunch of null pointer errors).

```javascript
client.get('/foo/bar', function(err, req, res, data) {
  assert.ifError(err);
  console.log('%s', data);
});
```

#### head(path, callback)

Just like `get`, but without `data`:

```javascript
client.head('/foo/bar', function(err, req, res) {
  assert.ifError(err);
  console.log('%d -> %j', res.statusCode, res.headers);
});
```

#### post(path, object, callback)

Takes a complete object to serialize and send to the server.

```javascript
client.post('/foo', { hello: 'world' }, function(err, req, res, data) {
  assert.ifError(err);
  console.log('%d -> %j', res.statusCode, res.headers);
  console.log('%s', data);
});
```

#### put(path, object, callback)

Just like `post`:

```javascript
client.put('/foo', { hello: 'world' }, function(err, req, res, data) {
  assert.ifError(err);
  console.log('%d -> %j', res.statusCode, res.headers);
  console.log('%s', data);
});
```

#### del(path, callback)

`del` doesn't take content, since you know, it should't:

```javascript
client.del('/foo/bar', function(err, req, res) {
  assert.ifError(err);
  console.log('%d -> %j', res.statusCode, res.headers);
});
```

### HttpClient

`HttpClient` is the lowest-level client shipped in restify, and is
basically just some sugar over the top of node's http/https modules
(with HTTP methods like the other clients).  It is useful if you want
to stream with restify.  Note that the event below is unfortunately
named `result` and not `response` (because
[Event 'response'](http://nodejs.org/docs/latest/api/all.html#event_response_)
is already used).

```javascript
client = restify.createClient({
  url: 'http://127.0.0.1'
});

client.get('/str/mcavage', function(err, req) {
  assert.ifError(err); // connection error

  req.on('result', function(err, res) {
    assert.ifError(err); // HTTP status code >= 400

    res.body = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      res.body += chunk;
    });

    res.on('end', function() {
      console.log(res.body);
    });
  });
});
```

Or a write:

```javascript
client.post(opts, function(err, req) {
  assert.ifError(connectErr);

  req.on('result', function(err, res) {
    assert.ifError(err);
    res.body = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      res.body += chunk;
    });

    res.on('end', function() {
      console.log(res.body);
    });
  });

  req.write('hello world');
  req.end();
});
```

Note that get/head/del all call `req.end()` for you, so you can't
write data over those. Otherwise, all the same methods exist as
`JsonClient/StringClient`.

One wishing to extend the `HttpClient` should look at the internals
and note that `read` and `write` probably need to be overridden.

#### Proxy

A restify client can use an HTTP proxy, either via options to `createClient`
or via the `http_proxy`, `https_proxy`, and `NO_PROXY` environment variables
common in many tools (e.g., `curl`).

```javascript
restify.createClient({
  proxy: <proxy url string or object>,
  noProxy: <boolean>
});
```

The `proxy` option to `createClient` specifies the proxy URL, for example:

```javascript
proxy: 'http://user:password@example.com:4321'
```

Or a proxy object can be given. (Warning: the `proxyAuth` field is not what
a simple `require('url').parse()` will produce if your proxy URL has auth
info.)

```javascript
proxy: {
  protocol: 'http:',
  host: 'example.com',
  port: 4321,
  proxyAuth: 'user:password'
}
```

Or `proxy: false` can be given to explicitly disable using a proxy -- i.e. to
ensure a proxy URL is not picked up from environment variables.

If not specified, then the following environment variables (in the given order)
are used to pick up a proxy URL:

    HTTPS_PROXY
    https_proxy
    HTTP_PROXY
    http_proxy

Note: A future major version of restify(-clients) might change this environment
variable behaviour. See the discussion on [this issue](https://github.com/restify/node-restify/issues/878#issuecomment-249673285).


The `noProxy` option can be used to exclude some hosts from using a given
proxy. If it is not specified, then the `NO_PROXY` or `no_proxy` environment
variable is used. Use `noProxy: ''` to override a possible environment variable,
but not match any hosts.

The value is a string giving a comma-separated set of host, host-part suffix, or
the special '*' to indicate all hosts. (Its definition is intended to match
curl's `NO_PROXY` environment variable.) Some examples:


    $ export NO_PROXY='*'               # don't proxy requests to any urls
    $ export NO_PROXY='127.0.0.1'       # don't proxy requests the localhost IP
    $ export NO_PROXY='localhost:8000'  # ... 'localhost' hostname and port 8000
    $ export NO_PROXY='google.com'      # ... "google.com" and "*.google.com"
    $ export NO_PROXY='www.google.com'  # ... "www.google.com"
    $ export NO_PROXY='127.0.0.1, google.com'   # multiple hosts

**Note**: The url being requested must match the full hostname or hostname
part to a '.': `NO_PROXY=oogle.com` does not match "google.com". DNS lookups are
not performed to determine the IP address of a hostname.


#### basicAuth(username, password)

Since it hasn't been mentioned yet, this convenience method (available
on all clients), just sets the `Authorization` header for all HTTP requests:

```javascript
client.basicAuth('mark', 'mysupersecretpassword');
```

#### Upgrades

If you successfully negotiate an Upgrade with the HTTP server, an
`upgradeResult` event will be emitted with the arguments `err`, `res`, `socket`
and `head`.  You can use this functionality to establish a WebSockets
connection with a server.  For example, using the
[watershed](https://github.com/jclulow/node-watershed) library:

```javascript
var ws = new Watershed();
var wskey = ws.generateKey();
var options = {
  path: '/websockets/attach',
  headers: {
    connection: 'upgrade',
    upgrade: 'websocket',
    'sec-websocket-key': wskey,
  }
};
client.get(options, function(err, res, socket, head) {
  res.once('upgradeResult', function(err2, res2, socket2, head2) {
    var shed = ws.connect(res2, socket2, head2, wskey);
    shed.on('text', function(msg) {
      console.log('message from server: ' + msg);
      shed.end();
    });
    shed.send('greetings program');
  });
});
```


## Contributing

Add unit tests for any new or changed functionality. Ensure that lint and style
checks pass.

To start contributing, install the git pre-push hooks:

```sh
make githooks
```

Before committing, run the prepush hook:

```sh
make prepush
```

If you have style errors, you can auto fix whitespace issues by running:

```sh
make codestyle-fix
```

## License

Copyright (c) 2015 Alex Liu

Licensed under the MIT license.

