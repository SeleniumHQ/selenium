// Copyright 2013 Selenium committers
// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

require('./_bootstrap')(module);

var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    promise = require('selenium-webdriver').promise,
    string = require('selenium-webdriver/_base').require('goog.string'),
    portprober = require('selenium-webdriver/net/portprober'),
    url = require('url');

var inproject = require('./inproject');


var WEB_ROOT = '/common/src/web';
var JS_ROOT = '/javascript';

var baseDirectory = inproject.locate('.'),
    server = http.createServer(onRequest).on('connection', function(stream) {
      stream.setTimeout(4000);
    });


var Pages = (function() {
  var pages = {};
  function addPage(page, path) {
    pages.__defineGetter__(page, function() {
      return exports.whereIs(path);
    });
  }

  addPage('ajaxyPage', 'ajaxy_page.html');
  addPage('alertsPage', 'alerts.html');
  addPage('bodyTypingPage', 'bodyTypingTest.html');
  addPage('booleanAttributes', 'booleanAttributes.html');
  addPage('childPage', 'child/childPage.html');
  addPage('chinesePage', 'cn-test.html');
  addPage('clickJacker', 'click_jacker.html');
  addPage('clickEventPage', 'clickEventPage.html');
  addPage('clicksPage', 'clicks.html');
  addPage('colorPage', 'colorPage.html');
  addPage('deletingFrame', 'deletingFrame.htm');
  addPage('draggableLists', 'draggableLists.html');
  addPage('dragAndDropPage', 'dragAndDropTest.html');
  addPage('droppableItems', 'droppableItems.html');
  addPage('documentWrite', 'document_write_in_onload.html');
  addPage('dynamicallyModifiedPage', 'dynamicallyModifiedPage.html');
  addPage('dynamicPage', 'dynamic.html');
  addPage('errorsPage', 'errors.html');
  addPage('xhtmlFormPage', 'xhtmlFormPage.xhtml');
  addPage('formPage', 'formPage.html');
  addPage('formSelectionPage', 'formSelectionPage.html');
  addPage('framesetPage', 'frameset.html');
  addPage('grandchildPage', 'child/grandchild/grandchildPage.html');
  addPage('html5Page', 'html5Page.html');
  addPage('html5OfflinePage', 'html5/offline.html');
  addPage('iframePage', 'iframes.html');
  addPage('javascriptEnhancedForm', 'javascriptEnhancedForm.html');
  addPage('javascriptPage', 'javascriptPage.html');
  addPage('linkedImage', 'linked_image.html');
  addPage('longContentPage', 'longContentPage.html');
  addPage('macbethPage', 'macbeth.html');
  addPage('mapVisibilityPage', 'map_visibility.html');
  addPage('metaRedirectPage', 'meta-redirect.html');
  addPage('missedJsReferencePage', 'missedJsReference.html');
  addPage('mouseTrackerPage', 'mousePositionTracker.html');
  addPage('nestedPage', 'nestedElements.html');
  addPage('readOnlyPage', 'readOnlyPage.html');
  addPage('rectanglesPage', 'rectangles.html');
  addPage('redirectPage', 'redirect');
  addPage('resultPage', 'resultPage.html');
  addPage('richTextPage', 'rich_text.html');
  addPage('selectableItemsPage', 'selectableItems.html');
  addPage('selectPage', 'selectPage.html');
  addPage('simpleTestPage', 'simpleTest.html');
  addPage('simpleXmlDocument', 'simple.xml');
  addPage('sleepingPage', 'sleep');
  addPage('slowIframes', 'slow_loading_iframes.html');
  addPage('slowLoadingAlertPage', 'slowLoadingAlert.html');
  addPage('svgPage', 'svgPiechart.xhtml');
  addPage('tables', 'tables.html');
  addPage('underscorePage', 'underscore.html');
  addPage('unicodeLtrPage', 'utf8/unicode_ltr.html');
  addPage('uploadPage', 'upload.html');
  addPage('veryLargeCanvas', 'veryLargeCanvas.html');
  addPage('xhtmlTestPage', 'xhtmlTest.html');

  return pages;
})();


var Path = {
  BASIC_AUTH: path.join(WEB_ROOT, 'basicAuth'),
  MANIFEST: path.join(WEB_ROOT, 'manifest'),
  REDIRECT: path.join(WEB_ROOT, 'redirect'),
  PAGE: path.join(WEB_ROOT, 'page'),
  SLEEP: path.join(WEB_ROOT, 'sleep'),
  UPLOAD: path.join(WEB_ROOT, 'upload')
};


/**
 * HTTP request handler.
 * @param {!http.ServerRequest} request The request object.
 * @param {!http.ServerResponse} response The response object.
 */
function onRequest(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, {'Allowed': 'GET,HEAD'});
    return response.end();
  }

  var pathname = path.resolve(url.parse(request.url).pathname);
  if (pathname === '/favicon.ico') {
    response.writeHead(204);
    return response.end();
  }

  switch (pathname) {
    case Path.BASIC_AUTH: return sendBasicAuth(response);
    case Path.MANIFEST: return sendManifest(response);
    case Path.PAGE: return sendInifinitePage(request, response);
    case Path.REDIRECT: return redirectToResultPage(response);
    case Path.SLEEP: return sendDelayedResponse(request, response);
    case Path.UPLOAD: return sendUpload(response);
  }

  if (string.startsWith(pathname, Path.PAGE + '/')) {
    return sendInifinitePage(request, response);
  }

  if ((string.startsWith(pathname, WEB_ROOT) ||
       string.startsWith(pathname, JS_ROOT)) &&
      string.endsWith(pathname, '.appcache')) {
    return sendManifest(response);
  }

  try {
    var fullPath = inproject.locate(pathname);
  } catch (ex) {
    fullPath = '';
  }

  if (fullPath.lastIndexOf(baseDirectory, 0) == -1) {
    return sendSimpleError(response, 404, pathname);
  }

  fs.stat(fullPath, function(err, stats) {
    if (err) {
      return sendIOError(request, response, err);

    } else if (stats.isDirectory()) {
      return sendDirectoryListing(request, response);

    } else if (stats.isFile()) {
      return sendFile(request, response);
    }

    sendSimpleError(response, 404, pathname);
  });
};


function redirectToResultPage(response) {
  response.writeHead(303, {
    Location: Pages.resultPage
  });
  return response.end();
}


function sendInifinitePage(request, response) {
  setTimeout(function() {
    var pathname = url.parse(request.url).pathname;
    var lastIndex = pathname.lastIndexOf('/');
    var pageNumber =
        (lastIndex == -1 ? 'Unknown' : pathname.substring(lastIndex + 1));
    var body = [
      '<!DOCTYPE html>',
      '<title>Page', pageNumber, '</title>',
      'Page number <span id="pageNumber">', pageNumber, '</span>',
      '<p><a href="../xhtmlTest.html" target="_top">top</a>'
    ].join('');
    response.writeHead(200, {
      'Content-Length': Buffer.byteLength(body, 'utf8'),
      'Content-Type': 'text/html; charset=utf-8'
    });
    response.end(body);
  }, 500);
}


function sendDelayedResponse(request, response) {
  var duration = 0;
  var query = url.parse(request.url).query || '';
  var match = query.match(/\btime=(\d+)/);
  if (match) {
    duration = parseInt(match[1]);
  }

  setTimeout(function() {
    var body = [
      '<!DOCTYPE html>',
      '<title>Done</title>',
      '<body>Slept for ', duration, 's</body>'
    ].join('');
    response.writeHead(200, {
      'Content-Length': Buffer.byteLength(body, 'utf8'),
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': 0
    });
    response.end(body);
  }, duration * 1000);
}


/**
 * Sends an error in response to an I/O operation.
 * @param {!http.ServerRequest} request The request object.
 * @param {!http.ServerResponse} response The response object.
 * @param {!Error} err The I/O error.
 */
function sendIOError(request, response, err) {
  var code = 500;
  if (err.code === 'ENOENT') {
    code = 404;
  } else if (err.code === 'EACCES') {
    code = 403;
  }
  sendSimpleError(response, code, request.url);
}


/**
 * Sends a simple error message to the client and instructs it to close the
 * connection.
 * @param {!http.ServerResponse} response The response to populate.
 * @param {number} code The numeric HTTP code to send.
 * @param {string} message The error message.
 */
function sendSimpleError(response, code, message) {
  response.writeHead(code, {
    'Content-Type': 'text/html; charset=utf-8',
    'Connection': 'close'
  });
  response.end(
      '<!DOCTYPE html><h1>' + code + ' ' + http.STATUS_CODES[code] +
      '</h1><hr/>' + message);
}


var MimeType = {
  'css': 'text/css',
  'gif': 'image/gif',
  'html': 'text/html',
  'js': 'application/javascript',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain',
  'xhtml': 'application/xhtml+xml',
  'xsl': 'application/xml',
  'xml': 'application/xml'
};


/**
 * Responds to a request for an individual file.
 * @param {!http.ServerRequest} request The request object.
 * @param {!http.ServerResponse} response The response object.
 */
function sendFile(request, response) {
  var pathname = url.parse(request.url).pathname;
  var filePath = inproject.locate(pathname);

  fs.stat(filePath, function(err, stats) {
    if (err) return sendIOError(request, response, err);

    var index = pathname.lastIndexOf('.');
    var type = MimeType[index < 0 ? '' : pathname.substring(index + 1)];

    var headers = {'Content-Length': stats.size};
    if (type) headers['Content-Type'] = type + '; charset=utf-8';
    response.writeHead(200, headers);

    fs.createReadStream(filePath, {flags: 'r', encoding: 'utf-8'}).
        on('data', response.write.bind(response)).
        on('end', function() {
          response.end();
        });
  });
}


/**
 * Responds to a request for a directory listing.
 * @param {!http.ServerRequest} request The request object.
 * @param {!http.ServerResponse} response The response object.
 */
function sendDirectoryListing(request, response) {
  var pathname = url.parse(request.url).pathname;

  var host = request.headers.host;
  if (!host) {
    var address = server.address();
    host = address.address + ':' + address.port;
  }

  var requestUrl = ['http://' + host + pathname].join('');
  if (requestUrl[requestUrl.length - 1] !== '/') {
    response.writeHead(303, {'Location': requestUrl + '/'});
    return response.end();
  }

  var dirPath = inproject.locate(pathname);
  fs.readdir(dirPath, function(err, files) {
    if (err) return sendIOError(request, response, err);

    var data = ['<!DOCTYPE html><h1>', pathname, '</h1><hr/><ul>'];
    if (pathname !== '/') {
      data.push(createListEntry('../'));
    }
    processNextFile();

    function processNextFile() {
      var file = files.shift();
      if (file) {
        fs.stat(path.join(dirPath, file), function(err, stats) {
          if (err) return sendIOError(request, response, err);

          data.push(createListEntry(
              stats.isDirectory() ? file + '/' : file));
          processNextFile();
        });
      } else {
        data = new Buffer(data.join(''), 'utf-8');
        response.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Length': data.length
        });
        response.end(data);
      }
    }

    function createListEntry(path) {
      var url = requestUrl + path;
      return ['<li><a href="', url, '">', path, '</a>'].join('');
    }
  });
}


// PUBLIC application


/**
 * Starts the server on the specified port.
 * @param {number=} opt_port The port to use, or 0 for any free port.
 * @param {function(Error)=} opt_callback A function to call when the server's
 *     "listening" event is emitted.
 */
exports.start = function(opt_port) {
  var port = opt_port || portprober.findFreePort('localhost');
  return promise.when(port, function(port) {
    console.log('starting file server on ' + port);
    return promise.checkedNodeCall(
        server.listen.bind(server, port, 'localhost'));
  });
};


/**
 * Stops the server.
 * @return {!promise.Promise} A promise that will resolve when the server has
 *     closed all functions.
 */
exports.stop = function() {
  var d = promise.defer();
  server.close(d.fulfill);
  return d.promise;
};


/**
 * Formats a URL for this server.
 * @param {string=} opt_pathname The desired pathname on the server.
 * @return {string} The formatted URL.
 * @throws {Error} If the server is not running.
 */
exports.url = function(opt_pathname) {
  var addr = server.address();
  if (!addr) {
    throw Error('There server is not running!');
  }
  var pathname = opt_pathname || '';
  return url.format({
    protocol: 'http',
    hostname: addr.address,
    port: addr.port,
    pathname: pathname
  });
};


/**
 * Builds the URL for a file in the //common/src/web directory of the
 * Selenium client.
 * @param {string} filePath A path relative to //common/src/web to compute a
 *     URL for.
 * @return {string} The formatted URL.
 * @throws {Error} If the server is not running.
 */
exports.whereIs = function(filePath) {
  return exports.url(path.join(WEB_ROOT, filePath));
};


exports.Pages = Pages;


if (require.main === module) {
  exports.start(2310).then(function() {
    console.log('Server running at ' + exports.url());
  });
}
