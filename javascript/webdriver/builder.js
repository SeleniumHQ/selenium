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

goog.provide('webdriver.Builder');

goog.require('goog.string');
goog.require('webdriver.Command');
goog.require('webdriver.CommandName');
goog.require('webdriver.FirefoxDomExecutor');
goog.require('webdriver.Session');
goog.require('webdriver.WebDriver');
goog.require('webdriver.error');
goog.require('webdriver.http.Executor');
goog.require('webdriver.http.Response');
goog.require('webdriver.http.XhrClient');
goog.require('webdriver.http.JsonpClient');
goog.require('webdriver.node.HttpClient');
goog.require('webdriver.process');
goog.require('webdriver.promise.Deferred');


/**
 * Creates new {@code webdriver.WebDriver} clients.  Upon instantiation, each
 * Builder will configure itself based on the following environment variables:
 * <dl>
 *   <dt>{@code webdriver.Builder.SERVER_URL_ENV}</dt>
 *   <dd>Defines the remote WebDriver server that should be used for command
 *       command execution; may be overridden using
 *       {@code webdriver.Builder.prototype.usingServer}.</dd>
 *   <dt>{@code webdriver.Builder.SESSION_ID_ENV}</dt>
 *   <dd>Defines the ID of an existing WebDriver session that should be used
 *       for new clients. This is most often used for browser-based clients
 *       that wish to gain control of the current browser which is already under
 *       WebDriver's control.</dd>
 * </dl>
 * @constructor
 * @export
 */
webdriver.Builder = function() {

  /**
   * URL of the remote server to use for new clients; initialized from the
   * value of the {@code webdriver.Builder.SERVER_URL_ENV} environment variable,
   * but may be overridden using {@code #usingServer(url)}.
   * @type {string}
   * @private
   */
  this.serverUrl_ =
      webdriver.process.getEnv(webdriver.Builder.SERVER_URL_ENV);

  /**
   * ID of an existing WebDriver session that new clients should use.
   * Initialized from the value of the {@code webdriver.Builder.SESSION_ID_ENV}
   * environment variable, but may be overridden using
   * {@code #usingSession(id)}.
   * @type {string}
   * @private
   */
  this.sessionId_ =
      webdriver.process.getEnv(webdriver.Builder.SESSION_ID_ENV);

  /**
   * The desired capabilities to use when creating a new session.
   * @type {!Object.<*>}
   * @private
   */
  this.capabilities_ = {};
};


/**
 * Environment variable that defines the session ID of an existing WebDriver
 * session to use when creating clients. If set, all new Builder instances will
 * default to creating clients that use this session. To create a new session,
 * use {@code #useExistingSession(boolean)}. The use of this environment
 * variable requires that {@code webdriver.Builder.SERVER_URL_ENV} also be
 * set.
 * @type {string}
 * @const
 * @see webdriver.process.getEnv
 * @export
 */
webdriver.Builder.SESSION_ID_ENV = 'wdsid';


/**
 * Environment variable that defines the URL of the WebDriver server that
 * should be used for all new WebDriver clients. This setting may be overridden
 * using {@code #usingServer(url)}.
 * @type {string}
 * @const
 * @see webdriver.process.getEnv
 * @export
 */
webdriver.Builder.SERVER_URL_ENV = 'wdurl';


/**
 * Environment variable which specifies whether to always prefer JSONP over
 * cross-origin XmlHttpRequests. This option is only application when running in
 * a web browser.
 * @type {string}
 * @const
 * @see webdriver.process.getEnv
 * @export
 */
webdriver.Builder.USE_JSONP_ENV = 'wdjsonp';


/**
 * Sends a command to the server that is expected to return a response whose
 * value describes the capabilities of that session. By virtue of the WebDriver
 * wire protocol, the session ID can be extract from the response as well.
 * @param {!webdriver.http.Executor} executor Command executor to use when
 *     querying for session details.
 * @param {!webdriver.Command} command The command to send to fetch the session
 *     details.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with a
 *     {@link webdriver.Session}.
 * @private
 */
webdriver.Builder.getSessionHelper_ = function(executor, command) {
  var fn = goog.bind(executor.execute, executor, command);
  return webdriver.promise.checkedNodeCall(fn).then(function(response) {
    webdriver.error.checkResponse(response);
    return new webdriver.Session(response['sessionId'], response['value']);
  });
};


/**
 * Queries a server for the capabilities of a particular session. The returned
 * promise will resolve with a fully formed {@code webdriver.Session} object.
 * @param {string} id ID of the session to query.
 * @param {!webdriver.http.Executor} executor Command executor to use when
 *     querying for session details.
 * @return {!webdriver.promise.Promise} A promise for the
 *     {@code webdriver.Session}.
 * @private
 */
webdriver.Builder.getSession_ = function(id, executor) {
  return webdriver.Builder.getSessionHelper_(executor,
      new webdriver.Command(webdriver.CommandName.DESCRIBE_SESSION).
          setParameter('sessionId', id));
};


/**
 * Creates a new WebDriver session.
 * @param {!webdriver.http.Executor} executor The executor to use to create a
 *     new session.
 * @param {!Object.<*>} capabilities The desired session capabilities.
 * @return {!webdriver.promise.Promise} A promise for the new
 *     {@code webdriver.Session}.
 * @private
 */
webdriver.Builder.createSession_ = function(executor, capabilities) {
  return webdriver.Builder.getSessionHelper_(executor,
      new webdriver.Command(webdriver.CommandName.NEW_SESSION).
          setParameter('desiredCapabilities', capabilities));
};


/**
 * Configures which WebDriver server should be used for new sessions. Overrides
 * the value loaded from the {@code webdriver.Builder.SERVER_URL_ENV} upon
 * instantion of this instance.
 * @param {string} url URL of the server to use.
 * @return {!webdriver.Builder} This Builder instance for chain calling.
 * @export
 */
webdriver.Builder.prototype.usingServer = function(url) {
  this.serverUrl_ = url;
  return this;
};


/**
 * Configures the builder to create a client that will use an existing WebDriver
 * session.
 * @param {string} id The existing session ID to use.
 * @return {!webdriver.Builder} This Builder instance for chain calling.
 * @export
 */
webdriver.Builder.prototype.usingSession = function(id) {
  this.sessionId_ = id;
  return this;
};


/**
 * Sets the desired capabilities when requesting a new session.
 * @param {!Object.<*>} capabilities The desired capabilities for a new
 *     session.
 * @return {!webdriver.Builder} This Builder instance for chain calling.
 * @export
 */
webdriver.Builder.prototype.withCapabilities = function(capabilities) {
  this.capabilities_ = capabilities;
  return this;
};


/**
 * Builds a new {@code webdriver.WebDriver} instance using this builder's
 * current configuration.
 * @return {!webdriver.WebDriver} A new WebDriver client.
 * @export
 */
webdriver.Builder.prototype.build = function() {
  var executor, session;
  if (webdriver.FirefoxDomExecutor.isAvailable()) {
    executor = new webdriver.FirefoxDomExecutor();
    session = webdriver.Builder.createSession_(executor, this.capabilities_);
  } else {
    if (!this.serverUrl_) {
      throw new Error('The remote WebDriver server URL has not been specified.');
    }

    var clientCtor = webdriver.process.isNative() ?
        webdriver.node.HttpClient :
        (webdriver.process.getEnv(webdriver.Builder.USE_JSONP_ENV) ||
         !webdriver.http.XhrClient.isCorsAvailable()) ?
            webdriver.http.JsonpClient :
            webdriver.http.XhrClient;

    var client = new clientCtor(this.serverUrl_);
    executor = new webdriver.http.Executor(client);

    if (this.sessionId_) {
      session = webdriver.Builder.getSession_(this.sessionId_, executor);
    } else if (webdriver.process.isNative() || useFirefoxDomExecutor) {
      session = webdriver.Builder.createSession_(executor, this.capabilities_);
    } else {
      throw new Error('Unable to create a new client for this browser. The ' +
          'WebDriver session ID has not been defined.');
    }
  }

  return new webdriver.WebDriver(session, executor);
};
