// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

'use strict';

var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    url = require('url');

var express = require('express');
var multer = require('multer');
var serveIndex = require('serve-index');

var Server = require('./httpserver').Server,
    resources = require('./resources'),
    isDevMode = require('../devmode'),
    promise = require('../promise');

var WEB_ROOT = '/common';
var JS_ROOT = '/javascript';

var baseDirectory = resources.locate(isDevMode ? 'common/src/web' : '.');
var jsDirectory = resources.locate(isDevMode ? 'javascript' : '..');

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
  addPage('echoPage', 'echo');
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
  BASIC_AUTH: WEB_ROOT + '/basicAuth',
  ECHO: WEB_ROOT + '/echo',
  GENERATED: WEB_ROOT + '/generated',
  MANIFEST: WEB_ROOT + '/manifest',
  REDIRECT: WEB_ROOT + '/redirect',
  PAGE: WEB_ROOT + '/page',
  SLEEP: WEB_ROOT + '/sleep',
  UPLOAD: WEB_ROOT + '/upload'
};

var app = express();

app.get('/', sendIndex)
.get('/favicon.ico', function(req, res) {
  res.writeHead(204);
  res.end();
})
.use(JS_ROOT, serveIndex(jsDirectory), express.static(jsDirectory))
.post(Path.UPLOAD, handleUpload)
.use(WEB_ROOT, serveIndex(baseDirectory), express.static(baseDirectory))
.get(Path.ECHO, sendEcho)
.get(Path.PAGE, sendInifinitePage)
.get(Path.PAGE + '/*', sendInifinitePage)
.get(Path.REDIRECT, redirectToResultPage)
.get(Path.SLEEP, sendDelayedResponse)

if (isDevMode) {
  var closureDir = resources.locate('third_party/closure/goog');
  app.use('/third_party/closure/goog',
      serveIndex(closureDir), express.static(closureDir));
}
var server = new Server(app);


function redirectToResultPage(_, response) {
  response.writeHead(303, {
    Location: Pages.resultPage
  });
  return response.end();
}


function sendInifinitePage(request, response) {
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
}


function sendDelayedResponse(request, response) {
  var duration = 0;
  var query = url.parse(request.url).query || '';
  var match = query.match(/\btime=(\d+)/);
  if (match) {
    duration = parseInt(match[1], 10);
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


function handleUpload(request, response, next) {
  multer({
    inMemory: true,
    onFileUploadComplete: function(file) {
      response.writeHead(200);
      response.write(file.buffer);
      response.end('<script>window.top.window.onUploadDone();</script>');
    }
  })(request, response, function() {});
}


function sendEcho(request, response) {
  var body = [
    '<!DOCTYPE html>',
    '<title>Echo</title>',
    '<div class="request">',
    request.method, ' ', request.url, ' ', 'HTTP/', request.httpVersion,
    '</div>'
  ];
  for (var name in request.headers) {
    body.push('<div class="header ', name , '">',
        name, ': ', request.headers[name], '</div>');
  }
  body = body.join('');
  response.writeHead(200, {
    'Content-Length': Buffer.byteLength(body, 'utf8'),
    'Content-Type': 'text/html; charset=utf-8'
  });
  response.end(body);
}


/**
 * Responds to a request for the file server's main index.
 * @param {!http.ServerRequest} request The request object.
 * @param {!http.ServerResponse} response The response object.
 */
function sendIndex(request, response) {
  var pathname = url.parse(request.url).pathname;

  var host = request.headers.host;
  if (!host) {
    host = server.host();
  }

  var requestUrl = ['http://' + host + pathname].join('');

  function createListEntry(path) {
    var url = requestUrl + path;
    return ['<li><a href="', url, '">', path, '</a>'].join('');
  }

  var data = ['<!DOCTYPE html><h1>/</h1><hr/><ul>',
              createListEntry('common')];
  if (isDevMode) {
    data.push(createListEntry('javascript'));
  }
  data.push('</ul>');
  data = data.join('');

  response.writeHead(200, {
    'Content-Type': 'text/html; charset=UTF-8',
    'Content-Length': Buffer.byteLength(data, 'utf8')
  });
  response.end(data);
}


// PUBLIC application


/**
 * Starts the server on the specified port.
 * @param {number=} opt_port The port to use, or 0 for any free port.
 * @return {!webdriver.promise.Promise.<Host>} A promise that will resolve
 *     with the server host when it has fully started.
 */
exports.start = server.start.bind(server);


/**
 * Stops the server.
 * @return {!webdriver.promise.Promise} A promise that will resolve when the
 *     server has closed all connections.
 */
exports.stop = server.stop.bind(server);


/**
 * Formats a URL for this server.
 * @param {string=} opt_pathname The desired pathname on the server.
 * @return {string} The formatted URL.
 * @throws {Error} If the server is not running.
 */
exports.url = server.url.bind(server);


/**
 * Builds the URL for a file in the //common/src/web directory of the
 * Selenium client.
 * @param {string} filePath A path relative to //common/src/web to compute a
 *     URL for.
 * @return {string} The formatted URL.
 * @throws {Error} If the server is not running.
 */
exports.whereIs = function(filePath) {
  filePath = filePath.replace(/\\/g, '/');
  if (!filePath.startsWith('/')) {
    filePath = '/' + filePath;
  }
  return server.url(WEB_ROOT + filePath);
};


exports.Pages = Pages;


if (require.main === module) {
  server.start(2310).then(function() {
    console.log('Server running at ' + server.url());
  });
}
