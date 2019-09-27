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

goog.provide('remote.ui.Client');

goog.require('bot.response');
goog.require('goog.Disposable');
goog.require('goog.Promise');
goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.debug.Console');
goog.require('goog.events');
goog.require('goog.log');
goog.require('remote.ui.Banner');
goog.require('remote.ui.Event.Type');
goog.require('remote.ui.ScreenshotDialog');
goog.require('remote.ui.ServerInfo');
goog.require('remote.ui.SessionContainer');
goog.require('remote.ui.WebDriverScriptButton');
goog.require('webdriver.Command');
goog.require('webdriver.CommandName');
goog.require('webdriver.Session');



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

  /** @private {goog.log.Logger} */
  this.log_ = goog.log.getLogger('remote.ui.Client');

  /** @private {!goog.debug.Console} */
  this.logConsole_ = new goog.debug.Console();

  this.logConsole_.setCapturing(true);

  /** @private {string} */
  this.url_ = url;

  /** @private {!webdriver.CommandExecutor} */
  this.executor_ = executor;

  /** @private {!remote.ui.Banner} */
  this.banner_ = new remote.ui.Banner();

  /** @private {!remote.ui.ServerInfo} */
  this.serverInfo_ = new remote.ui.ServerInfo();

  /** @private {!remote.ui.SessionContainer} */
  this.sessionContainer_ = new remote.ui.SessionContainer(
      remote.ui.Client.SUPPORTED_BROWSERS);

  /** @private {!remote.ui.ScreenshotDialog} */
  this.screenshotDialog_ = new remote.ui.ScreenshotDialog();

  /** @private {!remote.ui.WebDriverScriptButton} */
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
 * TODO: It should be possible to query the server for the list of
 * supported browsers. See:
 * http://code.google.com/p/selenium/issues/detail?id=6
 *
 * @type {!Array.<string>}
 * @const
 * @see https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
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
 * @return {!goog.Promise} A promise that will be resolved when
 *     the client has been initialized.
 */
remote.ui.Client.prototype.init = function(opt_element) {
  this.banner_.render();
  this.banner_.setVisible(false);
  this.sessionContainer_.render(opt_element);
  this.serverInfo_.render(opt_element);
  this.scriptButton_.render();
  this.sessionContainer_.addControlElement(
      /** @type {!Element} */(this.scriptButton_.getElement()));
  return this.updateServerInfo_().then(goog.bind(function() {
    this.sessionContainer_.setEnabled(true);
    this.onRefresh_();
  }, this));
};


/** @return {!remote.ui.SessionContainer} The session container. */
remote.ui.Client.prototype.getSessionContainer = function() {
  return this.sessionContainer_;
};


/**
 * Executes a single command.
 * @param {!webdriver.Command} command The command to execute.
 * @return {!goog.Promise} A promise that will be resolved with the
 *     command response.
 * @private
 */
remote.ui.Client.prototype.execute_ = function(command) {
  this.banner_.setVisible(false);
  return this.executor_.execute(command).
      then(bot.response.checkResponse);
};


/**
 * Logs an error.
 * @param {string} msg The message to accompanying the error.
 * @param {*} e The error to log, typically an Error object.
 * @private
 */
remote.ui.Client.prototype.logError_ = function(msg, e) {
  goog.log.error(this.log_, msg + '\n' + e);
  this.banner_.setMessage(msg + '\n\n' + e);
  this.banner_.setVisible(true);
};


/**
 * Queries the server for its build info.
 * @return {!goog.Promise} A promise that will be resolved with the
 *     server build info.
 * @private
 */
remote.ui.Client.prototype.updateServerInfo_ = function() {
  goog.log.info(this.log_, 'Retrieving server status...');
  return this.execute_(
      new webdriver.Command(webdriver.CommandName.GET_SERVER_STATUS)).
      then(goog.bind(function(response) {
        var value = response['value'] || {};
        var os = value['os'];
        if (os && os['name']) {
          os = os['name'] + (os['version'] ? ' ' + os['version'] : '');
        }
        var build = value['build'];
        this.serverInfo_.updateInfo(os,
            build && build['version'], build && build['revision']);
      }, this));
};


/**
 * Event handler for {@link remote.ui.Event.Type.REFRESH} events dispatched by
 * the {@link remote.ui.SessionContainer}.
 * @private
 */
remote.ui.Client.prototype.onRefresh_ = function() {
  goog.log.info(this.log_, 'Refreshing sessions...');
  var self = this;
  this.execute_(new webdriver.Command(webdriver.CommandName.GET_SESSIONS)).
      then(function(response) {
        var sessions = response['value'];
        sessions = goog.array.map(sessions, function(session) {
          return new webdriver.Session(session['id'], session['capabilities']);
        });
        self.sessionContainer_.refreshSessions(sessions);
      }).
      thenCatch(function(e) {
        self.logError_('Unable to refresh session list.', e);
      });
};


/**
 * Event handler for {@link remote.ui.Event.Type.CREATE} events dispatched by
 * the {@link remote.ui.SessionContainer}.
 * @param {!remote.ui.Event} e The event.
 * @private
 */
remote.ui.Client.prototype.onCreate_ = function(e) {
  goog.log.info(this.log_, 'Creating new session for ' + e.data['browserName']);
  var command = new webdriver.Command(webdriver.CommandName.NEW_SESSION).
      setParameter('desiredCapabilities', e.data);
  var self = this;
  this.execute_(command).
      then(function(response) {
        var session = new webdriver.Session(response['sessionId'],
            response['value']);
        self.sessionContainer_.addSession(session);
      }).
      thenCatch(function(e) {
        self.logError_('Unable to create new session.', e);
        self.sessionContainer_.removePendingTab();
      });
};


/**
 * Event handler for {@link remote.ui.Event.Type.DELETE} events dispatched by
 * the {@link remote.ui.SessionContainer}.
 * @private
 */
remote.ui.Client.prototype.onDelete_ = function() {
  var session = this.sessionContainer_.getSelectedSession();
  if (!session) {
    goog.log.warning(this.log_, 'Cannot delete session; no session selected!');
    return;
  }

  goog.log.info(this.log_, 'Deleting session: ' + session.getId());
  var command = new webdriver.Command(webdriver.CommandName.QUIT).
      setParameter('sessionId', session.getId());
  var self = this;
  this.execute_(command).
      then(function() {
        self.sessionContainer_.removeSession(
            /** @type {!webdriver.Session} */(session));
      }).
      thenCatch(function(e) {
        self.logError_('Unable to delete session.', e);
      });
};


/**
 * Event handler for {@link remote.ui.WebDriverScriptButton.LOAD_SCRIPT} events.
 * @param {!remote.ui.Event} e The event.
 * @private
 */
remote.ui.Client.prototype.onLoad_ = function(e) {
  var session = this.sessionContainer_.getSelectedSession();
  if (!session) {
    goog.log.warning(this.log_,
        'Cannot load url: ' + e.data + '; no session selected!');
    return;
  }

  var url = new goog.Uri(e.data);
  url.getQueryData().add('wdsid', session.getId());
  url.getQueryData().add('wdurl', this.url_);

  var command = new webdriver.Command(webdriver.CommandName.GET).
      setParameter('sessionId', session.getId()).
      setParameter('url', url.toString());
  goog.log.info(this.log_,
      'In session(' + session.getId() + '), loading ' + url);
  this.execute_(command).thenCatch(goog.bind(function(e) {
    this.logError_('Unable to load URL', e);
  }, this));
};


/**
 * Event handler for {@link remote.ui.Event.Type.SCREENSHOT} events.
 * @private
 */
remote.ui.Client.prototype.onScreenshot_ = function() {
  var session = this.sessionContainer_.getSelectedSession();
  if (!session) {
    goog.log.warning(this.log_,
        'Cannot take screenshot; no session selected!');
    return;
  }

  goog.log.info(this.log_, 'Taking screenshot: ' + session.getId());
  var command = new webdriver.Command(webdriver.CommandName.SCREENSHOT).
      setParameter('sessionId', session.getId());

  this.screenshotDialog_.setState(remote.ui.ScreenshotDialog.State.LOADING);
  this.screenshotDialog_.setVisible(true);

  var self = this;
  this.execute_(command).
      then(function(response) {
        self.screenshotDialog_.displayScreenshot(response['value']);
      }).
      thenCatch(function(e) {
        self.screenshotDialog_.setVisible(false);
        self.logError_('Unable to take screenshot.', e);
      });
};
