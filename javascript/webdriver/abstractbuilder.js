// Copyright 2012 Software Freedom Conservancy. All Rights Reserved.
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

goog.provide('webdriver.AbstractBuilder');

goog.require('webdriver.process');



/**
 * Creates new {@code webdriver.WebDriver} clients.  Upon instantiation, each
 * Builder will configure itself based on the following environment variables:
 * <dl>
 *   <dt>{@code webdriver.AbstractBuilder.SERVER_URL_ENV}</dt>
 *   <dd>Defines the remote WebDriver server that should be used for command
 *       command execution; may be overridden using
 *       {@code webdriver.AbstractBuilder.prototype.usingServer}.</dd>
 *   <dt>{@code webdriver.AbstractBuilder.SESSION_ID_ENV}</dt>
 *   <dd>Defines the ID of an existing WebDriver session that should be used
 *       for new clients. This is most often used for browser-based clients
 *       that wish to gain control of the current browser which is already under
 *       WebDriver's control.</dd>
 * </dl>
 * @constructor
 */
webdriver.AbstractBuilder = function() {

  /**
   * URL of the remote server to use for new clients; initialized from the
   * value of the {@link webdriver.AbstractBuilder.SERVER_URL_ENV} environment
   * variable, but may be overridden using
   * {@link webdriver.AbstractBuilder#usingServer}.
   * @type {string}
   * @private
   */
  this.serverUrl_ = webdriver.process.getEnv(
      webdriver.AbstractBuilder.SERVER_URL_ENV,
      webdriver.AbstractBuilder.DEFAULT_SERVER_URL);

  /**
   * ID of an existing WebDriver session that new clients should use.
   * Initialized from the value of the
   * {@link webdriver.AbstractBuilder.SESSION_ID_ENV} environment variable, but
   * may be overridden using
   * {@link webdriver.AbstractBuilder#usingSession}.
   * @type {string}
   * @private
   */
  this.sessionId_ =
      webdriver.process.getEnv(webdriver.AbstractBuilder.SESSION_ID_ENV);

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
 * variable requires that {@link webdriver.AbstractBuilder.SERVER_URL_ENV} also
 * be set.
 * @type {string}
 * @const
 * @see webdriver.process.getEnv
 */
webdriver.AbstractBuilder.SESSION_ID_ENV = 'wdsid';


/**
 * Environment variable that defines the URL of the WebDriver server that
 * should be used for all new WebDriver clients. This setting may be overridden
 * using {@code #usingServer(url)}.
 * @type {string}
 * @const
 * @see webdriver.process.getEnv
 */
webdriver.AbstractBuilder.SERVER_URL_ENV = 'wdurl';


/**
 * The default URL of the WebDriver server to use if
 * {@link webdriver.AbstractBuilder.SERVER_URL_ENV} is not set.
 * @type {string}
 * @const
 */
webdriver.AbstractBuilder.DEFAULT_SERVER_URL = 'http://localhost:4444/wd/hub';


/**
 * Configures which WebDriver server should be used for new sessions. Overrides
 * the value loaded from the {@link webdriver.AbstractBuilder.SERVER_URL_ENV}
 * upon creation of this instance.
 * @param {string} url URL of the server to use.
 * @return {!webdriver.AbstractBuilder} This Builder instance for chain calling.
 */
webdriver.AbstractBuilder.prototype.usingServer = function(url) {
  this.serverUrl_ = url;
  return this;
};


/**
 * @return {string} The URL of the WebDriver server this instance is configured
 *     to use.
 */
webdriver.AbstractBuilder.prototype.getServerUrl = function() {
  return this.serverUrl_;
};


/**
 * Configures the builder to create a client that will use an existing WebDriver
 * session.
 * @param {string} id The existing session ID to use.
 * @return {!webdriver.AbstractBuilder} This Builder instance for chain calling.
 */
webdriver.AbstractBuilder.prototype.usingSession = function(id) {
  this.sessionId_ = id;
  return this;
};


/**
 * @return {string} The ID of the session, if any, this builder is configured
 *     to reuse.
 */
webdriver.AbstractBuilder.prototype.getSession = function() {
  return this.sessionId_;
};


/**
 * Sets the desired capabilities when requesting a new session.
 * @param {!Object.<*>} capabilities The desired capabilities for a new
 *     session.
 * @return {!webdriver.AbstractBuilder} This Builder instance for chain calling.
 */
webdriver.AbstractBuilder.prototype.withCapabilities = function(capabilities) {
  this.capabilities_ = capabilities;
  return this;
};


/**
 * @return {!Object.<*>} The current desired capabilities for this builder.
 */
webdriver.AbstractBuilder.prototype.getCapabilities = function() {
  return this.capabilities_;
};


/**
 * Builds a new {@link webdriver.WebDriver} instance using this builder's
 * current configuration.
 * @return {!webdriver.WebDriver} A new WebDriver client.
 */
webdriver.AbstractBuilder.prototype.build = goog.abstractMethod;
