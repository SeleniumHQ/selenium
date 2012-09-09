// Copyright 2011 Software Freedom Conservancy. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var url = require('url');

var webdriver = require(process.env['SELENIUM_DEV_MODE'] === '1' ?
    './webdriver' :
    '../../build/javascript/node/webdriver'),
    optparse = require('./optparse');

var app = webdriver.promise.Application.getInstance();
app.on(webdriver.promise.Application.EventType.UNCAUGHT_EXCEPTION, function(e) {
  console.error('Uncaught exception!\n' + app.annotateError(e));
});


var parser = new optparse.OptionParser().
    usage([
      '%prog [options]',
      '',
      'A WebDriver server should be run in a separate process for use with ',
      'this script. If no --browser is specified, a REPL will be started.'
    ].join('\n')).
    string('browser', {
      help: 'Which browser the demo should launch. If not specified, this ' +
          'demo will spawn a REPL'
    }).
    string('url', {
      help: 'A URL to open with the launched session. The WebDriver session ' +
          'ID and server URL will be appended to the opened URL'
    });

parser.parse();

var browser = parser.options.browser;
var demoUrl = parser.options.url;

if (browser) {
  var driver = createDriver(browser, null, true);
  driver.getSession().then(function(session) {
    var wdUrl = process.env[webdriver.Builder.SERVER_URL_ENV] ||
        'http://localhost:4444/wd/hub';

    var queryString = [
      webdriver.Builder.SERVER_URL_ENV, '=',
      encodeURIComponent(wdUrl),
      '&', webdriver.Builder.SESSION_ID_ENV, '=',
      encodeURIComponent(session.id)
    ].join('');

    if (!demoUrl) {
      log('Created new WebDriver session.  A WebDriverJS demo page was not ');
      log('specified. Open a page with the WebDriverJS client. Be sure to ');
      log('to include the following in your query string: ');
      log(queryString);
      return;
    }

    var parsed = url.parse(demoUrl);
    if (parsed.search) {
      parsed.search += '&' + queryString;
    } else {
      parsed.search = '?' + queryString;
    }

    var toOpen = url.format(parsed);
    log('Opening ' + toOpen);
    driver.get(toOpen).then(function() {
      log('Happy debugging!');
      process.exit(0);
    });
  });
} else {
  log('\n--------------------------------------------------------------------');
  log('Welcome to the WebDriverJS node demo. This is just for playing around');
  log('with a bare JS client for WebDriver. A full server implementation for');
  log('Node is still in the works. As such, you will need to start a separate');
  log('Selenium server before playing with this script.');
  log('');
  log('To create new WebDriver clients, you can use the Builder (available to');
  log('this REPL as "webdriver.Builder"), or you may simply call ');
  log('createDriver(browserName), where browserName is the name of the');
  log('browser you want a client for: chrome, firefox, internet explorer, ');
  log('or opera');
  log('--------------------------------------------------------------------\n');
  log('');

  var repl = require('repl').start({});

  /** @type {!Object} */
  repl.context.webdriver = webdriver;

  /** @type {function(string, string=, boolean=): !webdriver.WebDriver} */
  repl.context.createDriver = createDriver;
}


function createDriver(browserName, opt_server, opt_verbose) {
  if (opt_verbose) {
    log('Creating driver for ' + JSON.stringify(browserName));
    if (opt_server) log('Using server ' + opt_server);
  }
  var builder = new webdriver.Builder();

  if (opt_server) {
    builder.usingServer(opt_server);
  }

  builder.withCapabilities({
    browserName: browserName,
    platform: 'ANY',
    version: '',
    javascriptEnabled: true,
    'chrome.switches': [
      '--disable-popup-blocking'
    ],
    'opera.arguments': '-nowin'
  });
  return builder.build();
}


function log(msg) {
  console.log(msg);
}
