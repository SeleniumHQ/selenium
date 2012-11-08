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

goog.provide('remote.ui.Client');

goog.require('bot.response');
goog.require('goog.Disposable');
goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.debug.Console');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('remote.ui.Banner');
goog.require('remote.ui.Event.Type');
goog.require('remote.ui.ScreenshotDialog');
goog.require('remote.ui.ServerInfo');
goog.require('remote.ui.SessionContainer');
goog.require('remote.ui.WebDriverScriptButton');
goog.require('webdriver.Command');
goog.require('webdriver.CommandName');
goog.require('webdriver.Session');
goog.require('webdriver.promise');



/**
 * Primary widget for the webdriver server UI.
 * @param {string} url URL of the server to communicate with.
 * @param {!webdriver.CommandExecutor} executor The command executor to use when
 *     communicating with the server.
 * @constructor
 * @extends {goog.Disposable}
 */
remote.ui.Client = function(url, executor) {
  goog.base(this);

  /**
   * @type {!goog.debug.Logger}
   * @private
   */
  this.log_ = goog.debug.Logger.getLogger('remote.ui.Client');

  /**
   * @type {!goog.debug.Console}
   * @private
   */
  this.logConsole_ = new goog.debug.Console();

  this.logConsole_.setCapturing(true);

  /**
   * @type {string}
   * @private
   */
  this.url_ = url;

  /**
   * @type {!webdriver.CommandExecutor}
   * @private
   */
  this.executor_ = executor;

  /**
   * @type {!remote.ui.Banner}
   * @private
   */
  this.banner_ = new remote.ui.Banner();

  /**
   * @type {!remote.ui.ServerInfo}
   * @private
   */
  this.serverInfo_ = new remote.ui.ServerInfo();

  /**
   * @type {!remote.ui.SessionContainer}
   * @private
   */
  this.sessionContainer_ = new remote.ui.SessionContainer(
      remote.ui.Client.SUPPORTED_BROWSERS);

  /**
   * @type {!remote.ui.ScreenshotDialog}
   * @private
   */
  this.screenshotDialog_ = new remote.ui.ScreenshotDialog();

  /**
   * @type {!remote.ui.WebDriverScriptButton}
   * @private
   */
  this.scriptButton_ = new remote.ui.WebDriverScriptButton();

  goog.events.listen(this.sessionContainer_, remote.ui.Event.Type.CREATE,
      this.onCreate_, false, this);
  goog.events.listen(this.sessionContainer_, remote.ui.Event.Type.DELETE,
      this.onDelete_, false, this);
  goog.events.listen(this.sessionContainer_, remote.ui.Event.Type.REFRESH,
      this.onRefresh_, false, this);
  goog.events.listen(this.sessionContainer_, remote.ui.Event.Type.SCREENSHOT,
      this.onScreenshot_, false, this);
  goog.events.listen(this.scriptButton_,
      remote.ui.WebDriverScriptButton.LOAD_SCRIPT, this.onLoad_, false, this);
};
goog.inherits(remote.ui.Client, goog.Disposable);


/**
 * The names of the browsers supported by the WebDriver server. The values in
 * this array match the keys recognized as valid values for the "browserName"
 * field in a capabilities object in the WebDriver wire protocol.
 *
 * TODO(jleyba): It should be possible to query the server for the list of
 * supported browsers. See:
 * http://code.google.com/p/selenium/issues/detail?id=6
 *
 * @type {!Array.<string>}
 * @const
 * @see http://code.google.com/p/selenium/wiki/DesiredCapabilities
 */
remote.ui.Client.SUPPORTED_BROWSERS = [
  'android',
  'chrome',
  'firefox',
  'internet explorer',
  'iphone',
  'opera'
];


/** @override */
remote.ui.Client.prototype.disposeInternal = function() {
  this.banner_.dispose();
  this.sessionContainer_.dispose();
  this.screenshotDialog_.dispose();
  this.scriptButton_.dispose();
  this.logConsole_.setCapturing(false);

  delete this.log_;
  delete this.executor_;
  delete this.logConsole_;
  delete this.sessionContainer_;
  delete this.banner_;
  delete this.screenshotDialog_;
  delete this.scriptButton_;

  goog.base(this, 'disposeInternal');
};


/**
 * Initializes the client and renders it into the DOM.
 * @param {!Element=} opt_element The element to render to; defaults to the
 *     current document's BODY element.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when
 *     the client has been initialized.
 */
remote.ui.Client.prototype.init = function(opt_element) {
  this.banner_.render();
  this.banner_.setVisible(false);
  this.sessionContainer_.render(opt_element);
  this.serverInfo_.render(opt_element);
  this.scriptButton_.render();
  this.sessionContainer_.addControlElement(this.scriptButton_.getElement());
  return this.updateServerInfo_().
      addCallback(function() {
        this.sessionContainer_.setEnabled(true);
        this.onRefresh_();
      }, this);
};


/** @return {!remote.ui.SessionContainer} The session container. */
remote.ui.Client.prototype.getSessionContainer = function() {
  return this.sessionContainer_;
};


/**
 * Executes a single command.
 * @param {!webdriver.Command} command The command to execute.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with the
 *     command response.
 * @private
 */
remote.ui.Client.prototype.execute_ = function(command) {
  this.banner_.setVisible(false);
  var fn = goog.bind(this.executor_.execute, this.executor_, command);
  return webdriver.promise.checkedNodeCall(fn).
      then(bot.response.checkResponse);
};


/**
 * Logs an error.
 * @param {string} msg The message to accompanying the error.
 * @param {*} e The error to log, typically an Error object.
 * @private
 */
remote.ui.Client.prototype.logError_ = function(msg, e) {
  this.log_.severe(msg + '\n' + e);
  this.banner_.setMessage(msg);
  this.banner_.setVisible(true);
};


/**
 * Queries the server for its build info.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with the
 *     server build info.
 * @private
 */
remote.ui.Client.prototype.updateServerInfo_ = function() {
  this.log_.info('Retrieving server status...');
  return this.execute_(
      new webdriver.Command(webdriver.CommandName.GET_SERVER_STATUS)).
      addCallback(function(response) {
        var value = response['value'] || {};
        var os = value['os'];
        if (os && os['name']) {
          os = os['name'] + (os['version'] ? ' ' + os['version'] : '');
        }
        var build = value['build'];
        this.serverInfo_.updateInfo(os,
            build && build['version'], build && build['revision']);
      }, this);
};


/**
 * Event handler for {@link remote.ui.Event.Type.REFRESH} events dispatched by
 * the {@link remote.ui.SessionContainer}.
 * @private
 */
remote.ui.Client.prototype.onRefresh_ = function() {
  this.log_.info('Refreshing sessions...');
  this.execute_(new webdriver.Command(webdriver.CommandName.GET_SESSIONS)).
      addCallback(function(response) {
        var sessions = response['value'];
        sessions = goog.array.map(sessions, function(session) {
          return new webdriver.Session(session['id'], session['capabilities']);
        });
        this.sessionContainer_.refreshSessions(sessions);
      }, this).
      addErrback(function(e) {
        this.logError_('Unable to refresh session list.', e);
      }, this);
};


/**
 * Event handler for {@link remote.ui.Event.Type.CREATE} events dispatched by
 * the {@link remote.ui.SessionContainer}.
 * @param {!remote.ui.Event} e The event.
 * @private
 */
remote.ui.Client.prototype.onCreate_ = function(e) {
  this.log_.info('Creating new session for ' + e.data['browserName']);
  var command = new webdriver.Command(webdriver.CommandName.NEW_SESSION).
      setParameter('desiredCapabilities', e.data);
  this.execute_(command).
      addCallback(function(response) {
        var session = new webdriver.Session(response['sessionId'],
            response['value']);
        this.sessionContainer_.addSession(session);
      }, this).
      addErrback(function(e) {
        this.logError_('Unable to create new session.', e);
        this.sessionContainer_.removePendingTab();
      }, this);
};


/**
 * Event handler for {@link remote.ui.Event.Type.DELETE} events dispatched by
 * the {@link remote.ui.SessionContainer}.
 * @private
 */
remote.ui.Client.prototype.onDelete_ = function() {
  var session = this.sessionContainer_.getSelectedSession();
  if (!session) {
    this.log_.warning('Cannot delete session; no session selected!');
    return;
  }

  this.log_.info('Deleting session: ' + session.getId());
  var command = new webdriver.Command(webdriver.CommandName.QUIT).
      setParameter('sessionId', session.getId());
  this.execute_(command).
      addCallback(function() {
        this.sessionContainer_.removeSession(session);
      }, this).
      addErrback(function(e) {
        this.logError_('Unable to delete session.', e);
      }, this);
};


/**
 * Event handler for {@link remote.ui.WebDriverScriptButton.LOAD_SCRIPT} events.
 * @param {!remote.ui.Event} e The event.
 * @private
 */
remote.ui.Client.prototype.onLoad_ = function(e) {
  var session = this.sessionContainer_.getSelectedSession();
  if (!session) {
    this.log_.warning('Cannot load url: ' + e.data + '; no session selected!');
    return;
  }

  var url = new goog.Uri(e.data);
  url.getQueryData().add('wdsid', session.getId());
  url.getQueryData().add('wdurl', this.url_);

  var command = new webdriver.Command(webdriver.CommandName.GET).
      setParameter('sessionId', session.getId()).
      setParameter('url', url.toString());
  this.log_.info('In session(' + session.getId() + '), loading ' + url);
  this.execute_(command).
      addErrback(function(e) {
        this.logError_('Unable to load URL', e);
      }, this);
};


/**
 * Event handler for {@link remote.ui.Event.Type.SCREENSHOT} events.
 * @private
 */
remote.ui.Client.prototype.onScreenshot_ = function() {
  var session = this.sessionContainer_.getSelectedSession();
  if (!session) {
    this.log_.warning('Cannot take screenshot; no session selected!');
    return;
  }

  this.log_.info('Taking screenshot: ' + session.getId());
  var command = new webdriver.Command(webdriver.CommandName.SCREENSHOT).
      setParameter('sessionId', session.getId());

  this.screenshotDialog_.setState(remote.ui.ScreenshotDialog.State.LOADING);
  this.screenshotDialog_.setVisible(true);

  this.execute_(command).
      addCallback(function(response) {
        this.screenshotDialog_.displayScreenshot(response['value']);
      }, this).
      addErrback(function(e) {
        this.screenshotDialog_.setVisible(false);
        this.logError_('Unable to take screenshot.', e);
      }, this);
};
