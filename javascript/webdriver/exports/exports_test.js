// Copyright 2012 Selenium committers
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

/**
 * @fileoverview A NodeJS test script that verifies the deployable WebDriverJS
 * module has the expected API.
 *
 * Usage:
 *
 * $ NODE_PATH=<path_to_webdriverjs_module_dir> node exports_test.js
 *
 * Example:
 *
 * $ NODE_PATH=build/javascript/webdriver exports_test.js
 */

var assert = require('assert');

try {
  var webdriver = require('webdriver');
} catch (ex) {
  var nodePath = process.env['NODE_PATH'];
  assert.fail('Unable to load WebDriver module. ' + (nodePath ?
      ('Is it on $NODE_PATH: ' + nodePath) :
      ('$NODE_PATH env var not set!')));
}

checkBuilder();
checkCommand();
checkCommandName();
checkEventEmitter();
checkKey();
checkLocators();
checkWebDriver();
checkWebElement();
checkSession();
checkPromise();


function checkLocators() {
  console.log('Checking webdriver.By API...');
  assertObject('webdriver', 'By');
  assertFunction('webdriver.By', 'className');
  assertFunction('webdriver.By', 'css');
  assertFunction('webdriver.By', 'id');
  assertFunction('webdriver.By', 'js');
  assertFunction('webdriver.By', 'linkText');
  assertFunction('webdriver.By', 'name');
  assertFunction('webdriver.By', 'partialLinkText');
  assertFunction('webdriver.By', 'tagName');
  assertFunction('webdriver.By', 'xpath');
  console.log('...OK');
}


function loadWebDriver() {
  console.log('Reading webdriverjs module path');
  assert.ok(process.argv.length > 2, 'Path to webdriver module not specified');
  var path = process.argv[2];
  if (!/^\.?\//.test(path)) {
    path = './' + path;
  }
  console.log('Loading webdriverjs module from: ' + path);
  return require(path);
}


function checkBuilder() {
  console.log('Checking webdriver.Builder API...');
  assertFunction('webdriver', 'Builder');
  assertFunction('new webdriver.Builder()', 'usingServer');
  assertFunction('new webdriver.Builder()', 'usingSession');
  assertFunction('new webdriver.Builder()', 'withCapabilities');
  assertFunction('new webdriver.Builder()', 'build');
  console.log('...OK');
}


function checkCommand() {
  console.log('Checking webdriver.Command API...');
  assertFunction('webdriver', 'Command');
  assertFunction('webdriver.Command.prototype', 'getName');
  assertFunction('webdriver.Command.prototype', 'setParameter');
  assertFunction('webdriver.Command.prototype', 'setParameters');
  assertFunction('webdriver.Command.prototype', 'getParameter');
  assertFunction('webdriver.Command.prototype', 'getParameters');
  console.log('...OK');
}


function checkCommandName() {
  console.log('Checking webdriver.CommandName API...');
  // Just check a few.
  assertString('webdriver.CommandName', 'GET_SERVER_STATUS');
  assertString('webdriver.CommandName', 'NEW_SESSION');
  assertString('webdriver.CommandName', 'GET_SESSIONS');
  assertString('webdriver.CommandName', 'DESCRIBE_SESSION');
  assertString('webdriver.CommandName', 'CLOSE');
  assertString('webdriver.CommandName', 'QUIT');
  assertString('webdriver.CommandName', 'GET_CURRENT_URL');
  assertString('webdriver.CommandName', 'GET');
  console.log('...OK');
}


function checkEventEmitter() {
  console.log('Checking webdriver.EventEmitter API...');
  assertFunction('webdriver', 'EventEmitter');
  assertFunction('webdriver.EventEmitter.prototype', 'emit');
  assertFunction('webdriver.EventEmitter.prototype', 'addListener');
  assertFunction('webdriver.EventEmitter.prototype', 'once');
  assertFunction('webdriver.EventEmitter.prototype', 'on');
  assertFunction('webdriver.EventEmitter.prototype', 'removeListener');
  assertFunction('webdriver.EventEmitter.prototype', 'removeAllListeners');
  console.log('...OK');
}


function checkKey() {
  console.log('Checking webdriver.Key API...');
  assertObject('webdriver', 'Key');
  assertString('webdriver.Key', 'NULL');
  assertString('webdriver.Key', 'CONTROL');
  assertString('webdriver.Key', 'SHIFT');
  assertString('webdriver.Key', 'ALT');
  console.log('...OK');
}


function checkWebDriver() {
  console.log('Checking webdriver.WebDriver API...');
  assertFunction('webdriver', 'WebDriver');
  assertFunction('webdriver.WebDriver', 'attachToSession');
  assertFunction('webdriver.WebDriver', 'createSession');
  assertFunction('webdriver.WebDriver.prototype', 'getSession');
  assertFunction('webdriver.WebDriver.prototype', 'getCapability');
  assertFunction('webdriver.WebDriver.prototype', 'quit');
  assertFunction('webdriver.WebDriver.prototype', 'call');
  assertFunction('webdriver.WebDriver.prototype', 'sleep');
  assertFunction('webdriver.WebDriver.prototype', 'getWindowHandle');
  assertFunction('webdriver.WebDriver.prototype', 'getAllWindowHandles');
  assertFunction('webdriver.WebDriver.prototype', 'getPageSource');
  assertFunction('webdriver.WebDriver.prototype', 'close');
  assertFunction('webdriver.WebDriver.prototype', 'get');
  assertFunction('webdriver.WebDriver.prototype', 'getCurrentUrl');
  assertFunction('webdriver.WebDriver.prototype', 'getTitle');
  assertFunction('webdriver.WebDriver.prototype', 'findElement');
  assertFunction('webdriver.WebDriver.prototype', 'findElements');
  assertFunction('webdriver.WebDriver.prototype', 'isElementPresent');
  assertFunction('webdriver.WebDriver.prototype', 'takeScreenshot');
  assertFunction('webdriver.WebDriver.prototype', 'manage');
  assertFunction('webdriver.WebDriver.prototype', 'navigate');
  assertFunction('webdriver.WebDriver.prototype', 'switchTo');

  assertFunction('new webdriver.WebDriver().navigate()', 'to');
  assertFunction('new webdriver.WebDriver().navigate()', 'back');
  assertFunction('new webdriver.WebDriver().navigate()', 'forward');
  assertFunction('new webdriver.WebDriver().navigate()', 'refresh');

  assertFunction('new webdriver.WebDriver().manage()', 'addCookie');
  assertFunction('new webdriver.WebDriver().manage()', 'deleteAllCookies');
  assertFunction('new webdriver.WebDriver().manage()', 'deleteCookie');
  assertFunction('new webdriver.WebDriver().manage()', 'getCookie');
  assertFunction('new webdriver.WebDriver().manage()', 'getCookies');
  assertFunction('new webdriver.WebDriver().manage()', 'timeouts');

  assertFunction('new webdriver.WebDriver().manage().timeouts()',
                 'implicitlyWait');
  assertFunction('new webdriver.WebDriver().manage().timeouts()',
                 'setScriptTimeout');

  assertFunction('new webdriver.WebDriver().switchTo()', 'activeElement');
  assertFunction('new webdriver.WebDriver().switchTo()', 'defaultContent');
  assertFunction('new webdriver.WebDriver().switchTo()', 'frame');
  assertFunction('new webdriver.WebDriver().switchTo()', 'window');

  console.log('...OK');
}


function checkWebElement() {
  console.log('Checking webdriver.WebElement API...');

  assertFunction('webdriver', 'WebElement');
  assertFunction('webdriver.WebElement.prototype', 'getDriver');
  assertFunction('webdriver.WebElement.prototype', 'findElement');
  assertFunction('webdriver.WebElement.prototype', 'findElements');
  assertFunction('webdriver.WebElement.prototype', 'isElementPresent');
  assertFunction('webdriver.WebElement.prototype', 'click');
  assertFunction('webdriver.WebElement.prototype', 'sendKeys');
  assertFunction('webdriver.WebElement.prototype', 'getTagName');
  assertFunction('webdriver.WebElement.prototype', 'getCssValue');
  assertFunction('webdriver.WebElement.prototype', 'getAttribute');
  assertFunction('webdriver.WebElement.prototype', 'getText');
  assertFunction('webdriver.WebElement.prototype', 'getSize');
  assertFunction('webdriver.WebElement.prototype', 'getLocation');
  assertFunction('webdriver.WebElement.prototype', 'isEnabled');
  assertFunction('webdriver.WebElement.prototype', 'isSelected');
  assertFunction('webdriver.WebElement.prototype', 'submit');
  assertFunction('webdriver.WebElement.prototype', 'clear');
  assertFunction('webdriver.WebElement.prototype', 'isDisplayed');
  assertFunction('webdriver.WebElement.prototype', 'getOuterHtml');
  assertFunction('webdriver.WebElement.prototype', 'getInnerHtml');

  console.log('...OK');
}


function checkSession() {
  console.log('Checking webdriver.Session API...');

  assertFunction('webdriver', 'Session');
  assertFunction('webdriver.Session.prototype', 'getId');
  assertFunction('webdriver.Session.prototype', 'getCapabilities');
  assertFunction('webdriver.Session.prototype', 'getCapability');

  console.log('...OK');
}


function checkPromise() {
  console.log('Checking webdriver.promise API...');
  assertObject('webdriver', 'promise');
  assertFunction('webdriver.promise', 'isPromise');
  assertFunction('webdriver.promise', 'delayed');
  assertFunction('webdriver.promise', 'resolved');
  assertFunction('webdriver.promise', 'rejected');
  assertFunction('webdriver.promise', 'when');
  assertFunction('webdriver.promise', 'asap');
  assertFunction('webdriver.promise', 'fullyResolved');
  assertFunction('webdriver.promise', 'checkedNodeCall');

  assertFunction('webdriver.promise', 'Application');
  assertFunction('webdriver.promise.Application', 'getInstance');
  assertObject('webdriver.promise.Application', 'EventType');
  assert.equal('idle', webdriver.promise.Application.EventType.IDLE,
      'Should be "idle", is ' + webdriver.promise.Application.EventType.IDLE);
  assert.equal('scheduleTask',
      webdriver.promise.Application.EventType.SCHEDULE_TASK,
      'Should be "scheduleTask", is ' +
          webdriver.promise.Application.EventType.SCHEDULE_TASK);
  assert.equal('uncaughtException',
      webdriver.promise.Application.EventType.UNCAUGHT_EXCEPTION,
      'Should be "uncaughtException", is ' +
          webdriver.promise.Application.EventType.UNCAUGHT_EXCEPTION);

  assert.ok(webdriver.promise.Application.getInstance() instanceof
      webdriver.EventEmitter, 'Application not an EventEmitter!');
  assertFunction('webdriver.promise.Application.getInstance()', 'schedule');
  assertFunction('webdriver.promise.Application.getInstance()', 'schedule');
  assertFunction('webdriver.promise.Application.getInstance()',
      'scheduleTimeout');
  assertFunction('webdriver.promise.Application.getInstance()', 'scheduleWait');

  assertFunction('webdriver.promise', 'Promise');
  assertFunction('webdriver.promise.Promise.prototype', 'then');
  assertFunction('webdriver.promise.Promise.prototype', 'cancel');
  assertFunction('webdriver.promise.Promise.prototype', 'addBoth');
  assertFunction('webdriver.promise.Promise.prototype', 'addCallback');
  assertFunction('webdriver.promise.Promise.prototype', 'addCallbacks');
  assertFunction('webdriver.promise.Promise.prototype', 'addErrback');
  assertFunction('webdriver.promise.Promise.prototype', 'isPending');

  assertFunction('webdriver.promise', 'Deferred');
  assertFunction('new webdriver.promise.Deferred()', 'then');
  assertFunction('new webdriver.promise.Deferred()', 'cancel');
  assertFunction('new webdriver.promise.Deferred()', 'addBoth');
  assertFunction('new webdriver.promise.Deferred()', 'addCallback');
  assertFunction('new webdriver.promise.Deferred()', 'addCallbacks');
  assertFunction('new webdriver.promise.Deferred()', 'addErrback');
  assertFunction('new webdriver.promise.Deferred()', 'isPending');
  assertFunction('new webdriver.promise.Deferred()', 'resolve');
  assertFunction('new webdriver.promise.Deferred()', 'reject');
  assertObject('new webdriver.promise.Deferred()', 'promise');

  var d = new webdriver.promise.Deferred();
  assert.equal(d.then, d.promise.then);
  assert.equal(d.cancel, d.promise.cancel);
  assert.equal(d.isPending, d.promise.isPending);

  assert.ok(webdriver.promise.isPromise(d));
  assert.ok(webdriver.promise.isPromise(d.promise));

  console.log('...OK');
}


function assertType(expected, obj, property) {
  var actual = eval('typeof ' + obj + '.' + property);
  assert.equal(expected, actual, [
    'Expected ', obj, '.', property, ' to be a <', expected, '>,',
    ' but was <', actual, '>'
  ].join(''));
}

function assertFunction(obj, property) {
  assertType('function', obj, property);
}

function assertString(obj, property) {
  assertType('string', obj, property);
}

function assertObject(obj, property) {
  assertType('object', obj, property);
}
