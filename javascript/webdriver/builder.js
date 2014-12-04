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

goog.provide('webdriver.Builder');

goog.require('goog.Uri');
goog.require('goog.userAgent');
goog.require('webdriver.Capabilities');
goog.require('webdriver.FirefoxDomExecutor');
goog.require('webdriver.WebDriver');
goog.require('webdriver.http.CorsClient');
goog.require('webdriver.http.Executor');
goog.require('webdriver.http.XhrClient');



/**
 * Creates new {@code webdriver.WebDriver} clients for use in a browser
 * environment. Upon instantiation, each Builder will configure itself based
 * on the following query parameters:
 * <dl>
 *   <dt>wdurl
 *   <dd>Defines the WebDriver server to send commands to. If this is a
 *       relative URL, the builder will use the standard WebDriver wire
 *       protocol and a {@link webdriver.http.XhrClient}. Otherwise, it will
 *       use a {@link webdriver.http.CorsClient}; this only works when
 *       connecting to an instance of the Java Selenium server. The server URL
 *       may be changed using {@code #usingServer}.
 *
 *   <dt>wdsid
 *   <dd>Defines the session to connect to. If omitted, will request a new
 *       session from the server.
 * </dl>
 *
 * @param {Window=} opt_window The window to extract query parameters from.
 * @constructor
 * @final
 * @struct
 */
webdriver.Builder = function(opt_window) {
  var win = opt_window || window;
  var data = new goog.Uri(win.location).getQueryData();

  /** @private {string} */
  this.serverUrl_ =
      /** @type {string} */ (data.get(webdriver.Builder.SERVER_URL_PARAM,
      webdriver.Builder.DEFAULT_SERVER_URL));

  /** @private {string} */
  this.sessionId_ =
      /** @type {string} */ (data.get(webdriver.Builder.SESSION_ID_PARAM));

  /** @private {!webdriver.Capabilities} */
  this.capabilities_ = new webdriver.Capabilities();
};


/**
 * Query parameter that defines which session to connect to.
 * @type {string}
 * @const
 */
webdriver.Builder.SESSION_ID_PARAM = 'wdsid';


/**
 * Query parameter that defines the URL of the remote server to connect to.
 * @type {string}
 * @const
 */
webdriver.Builder.SERVER_URL_PARAM = 'wdurl';


/**
 * The default server URL to use.
 * @type {string}
 * @const
 */
webdriver.Builder.DEFAULT_SERVER_URL = 'http://localhost:4444/wd/hub';


/**
 * Configures which WebDriver server should be used for new sessions.
 * @param {string} url URL of the server to use.
 * @return {!webdriver.Builder} This Builder instance for chain calling.
 */
webdriver.Builder.prototype.usingServer = function(url) {
  this.serverUrl_ = url;
  return this;
};


/**
 * @return {string} The URL of the WebDriver server this instance is configured
 *     to use.
 */
webdriver.Builder.prototype.getServerUrl = function() {
  return this.serverUrl_;
};


/**
 * Configures the builder to create a client that will use an existing WebDriver
 * session.
 * @param {string} id The existing session ID to use.
 * @return {!webdriver.Builder} This Builder instance for chain calling.
 */
webdriver.Builder.prototype.usingSession = function(id) {
  this.sessionId_ = id;
  return this;
};


/**
 * @return {string} The ID of the session, if any, this builder is configured
 *     to reuse.
 */
webdriver.Builder.prototype.getSession = function() {
  return this.sessionId_;
};


/**
 * Sets the desired capabilities when requesting a new session. This will
 * overwrite any previously set desired capabilities.
 * @param {!(Object|webdriver.Capabilities)} capabilities The desired
 *     capabilities for a new session.
 * @return {!webdriver.Builder} This Builder instance for chain calling.
 */
webdriver.Builder.prototype.withCapabilities = function(capabilities) {
  this.capabilities_ = new webdriver.Capabilities(capabilities);
  return this;
};


/**
 * Builds a new {@link webdriver.WebDriver} instance using this builder's
 * current configuration.
 * @return {!webdriver.WebDriver} A new WebDriver client.
 */
webdriver.Builder.prototype.build = function() {
  if (goog.userAgent.GECKO && document.readyState != 'complete') {
    throw Error('Cannot create driver instance before window.onload');
  }

  var executor;

  if (webdriver.FirefoxDomExecutor.isAvailable()) {
    executor = new webdriver.FirefoxDomExecutor();
    return webdriver.WebDriver.createSession(executor, this.capabilities_);
  } else {
    var url = this.serverUrl_;
    var client;
    if (url[0] == '/') {
      var origin = window.location.origin ||
          (window.location.protocol + '//' + window.location.host);
      client = new webdriver.http.XhrClient(origin + url);
    } else {
      client = new webdriver.http.CorsClient(url);
    }
    executor = new webdriver.http.Executor(client);

    if (this.sessionId_) {
      return webdriver.WebDriver.attachToSession(executor, this.sessionId_);
    } else {
      throw new Error('Unable to create a new client for this browser. The ' +
          'WebDriver session ID has not been defined.');
    }
  }
};
