// Copyright 2011 Software Freedom Conservatory. All Rights Reserved.
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

var fs = require('fs'),
    url = require('url');

var webdriver = require('../../../build/javascript/webdriver/webdriver'),
    optparse = require('./optparse');


const DEFAULT_SERVER_URL = 'http://localhost:4444/wd/hub';

var parser = new optparse.OptionsParser([
    '%prog [options]',
    '',
    'A WebDriver server should be run in a separate process for use with this ',
    'script. If no --browser is specified, a REPL will be started.'
].join('\n'));


var browser, demoUrl;

parser.addOption('browser',
    'Which browser the demo should launch. If not specified, this demo will ' +
        'spawn a REPL',
    function(b) {
      log('Creating demo for browser ' + JSON.stringify(b));
      browser = b;
    });
parser.addOption('url',
    'A URL to open with the launched session. The WebDriver session ID and ' +
    'server URL will be appended to the opened URL.',
    function(url) {
      log('Opening demo page ' + url);
      demoUrl = url;
    });
parser.addOption('wdUrl',
    'URL of the WebDriver server to use; defaults to ' + DEFAULT_SERVER_URL,
    function(url) {
      webdriver.process.setEnv(webdriver.Builder.SERVER_URL_ENV, url);
    });

parser.parse();
if (!webdriver.process.getEnv(webdriver.Builder.SERVER_URL_ENV)) {
  webdriver.process.setEnv(webdriver.Builder.SERVER_URL_ENV,
      DEFAULT_SERVER_URL);
}

if (browser) {

  var driver = createDriver(browser, null, true);
  driver.getSession().then(function(session) {
    var queryString = [
      webdriver.Builder.SERVER_URL_ENV, '=',
      encodeURIComponent(
          webdriver.process.getEnv(webdriver.Builder.SERVER_URL_ENV)),
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
  log('\n----------------------------------------------------------------------');
  log('Welcome to the WebDriverJS node demo. This is just for playing around');
  log('with a bare JS client for WebDriver. A full server implementation for');
  log('Node is still in the works. As such, you will need to start a separate');
  log('Selenium server before playing with this script.');
  log('');
  setDefaultUrl(webdriver.process.getEnv(webdriver.Builder.SERVER_URL_ENV) ||
                DEFAULT_SERVER_URL);
  log('');
  log('You may change the default URL by calling setDefaultUrl(). Conversely, ');
  log('you may set the URL for individual clients on the webdriver.Builder');
  log('');
  log('To create new WebDriver clients, you can use the Builder (available to');
  log('this REPL as "webdriver.Builder"), or you may simply call ');
  log('createDriver(browserName), where browserName is the name of the browser');
  log('you want a client for: chrome, firefox, internet explorer, or opera');
  log('----------------------------------------------------------------------\n');
  log('');

  var repl = require('repl').start();

  repl.context.webdriver = webdriver;
  repl.context.setDefaultUrl = setDefaultUrl;
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


function setDefaultUrl(url) {
  log('The WebDriver server URL has been set to ' + url);
  webdriver.process.setEnv(webdriver.Builder.SERVER_URL_ENV, url);
}

function log(msg) {
  console.log(msg);
}
