// Copyright 2012 Selenium committers
// Copyright 2012 Software Freedom Conservancy
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
 * @fileoverview Entry point for the SafariDriver extension's global script.
 */

goog.provide('safaridriver.extension');

goog.require('bot.response');
goog.require('goog.asserts');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');
goog.require('safaridriver.console');
goog.require('safaridriver.extension.LogDb');
goog.require('safaridriver.extension.Server');
goog.require('safaridriver.extension.Session');
goog.require('safaridriver.extension.TabManager');
goog.require('safaridriver.logging.ForwardingHandler');
goog.require('safaridriver.message');
goog.require('safaridriver.message.Alert');
goog.require('safaridriver.message.Command');
goog.require('safaridriver.message.Connect');
goog.require('safaridriver.message.LoadModule');
goog.require('safaridriver.message.Response');
goog.require('webdriver.Session');
goog.require('webdriver.WebDriver');
goog.require('webdriver.logging');


/**
 * Initializes the SafariDriver extension's global page.
 */
safaridriver.extension.init = function() {
  goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.ALL);
  safaridriver.console.init();

  // Wait for the logging database to initialize before continuing. This will
  // ensure we can capture all of the logging output. This should be no more
  // than a setTimeout(fn, 0) wait (depends on the current machine though).
  safaridriver.extension.LogDb.getInstance().isReady().
      then(safaridriver.extension.postLogInit_);
};


/** @private */
safaridriver.extension.postLogInit_ = function() {
  goog.debug.LogManager.getRoot().addHandler(function(logRecord) {
    var entry = webdriver.logging.Entry.fromClosureLogRecord(
        logRecord, webdriver.logging.Type.DRIVER);
    safaridriver.extension.LogDb.getInstance().save([entry]);
  });

  safaridriver.extension.LOG_.fine('Creating global session...');
  safaridriver.extension.tabManager_ = new safaridriver.extension.TabManager();
  safaridriver.extension.session_ = new safaridriver.extension.Session(
      safaridriver.extension.tabManager_);

  safaridriver.extension.LOG_.fine('Creating debug driver...');
  var server = safaridriver.extension.createSessionServer_();
  safaridriver.extension.driver = new webdriver.WebDriver(
      new webdriver.Session('debug', {}), server);
  goog.exportSymbol('driver', safaridriver.extension.driver);

  safari.application.addEventListener(
      'message', safaridriver.extension.onMessage_, false);
  safari.application.addEventListener(
      'command', safaridriver.extension.onCommand_, false);

  // Now that we're initialized, we sit and wait for a page to send us a client
  // to attempt connecting to.
  safaridriver.extension.LOG_.info('Waiting for connect command...');
};


/**
 * @private {!goog.debug.Logger}
 * @const
 */
safaridriver.extension.LOG_ = goog.debug.Logger.getLogger(
    'safaridriver.extension');


/**
 * Global tab manager shared by each instance; lazily initialized in
 * {@link safaridriver.extension.init}.
 * @private {!safaridriver.extension.TabManager}
 */
safaridriver.extension.tabManager_;


/**
 * Global session shared by eash clinet; lazily initialized in
 * {@link safaridriver.extension.init}.
 * @private {!safaridriver.extension.Session}
 */
safaridriver.extension.session_;


/**
 * An instance of {@link webdriver.WebDriver}, provided for interacting with
 * the extension via the global page's REPL.
 * @type {webdriver.WebDriver}
 */
safaridriver.extension.driver;


/**
 * The number of WebDriver client connections active with this extension.
 * @private {number}
 */
safaridriver.extension.numConnections_ = 0;


/**
 * @private {string}
 * @const
 */
safaridriver.extension.LOG_PAGE_URL_ = safari.extension.baseURI + 'log.html';


/**
 * The tab to display logging info in.
 * @private {SafariBrowserTab}
 */
safaridriver.extension.loggingTab_ = null;


/** @private {safaridriver.logging.ForwardingHandler} */
safaridriver.extension.logHandler_ = null;


/**
 * Opens the logging tab if it is not currently open.
 * @private
 */
safaridriver.extension.openLogWindow_ = function() {
  if (!safaridriver.extension.loggingTab_) {
    var win = safari.application.openBrowserWindow();
    safaridriver.extension.loggingTab_ = win.activeTab;
    safaridriver.extension.loggingTab_.addEventListener(
        'close', onClose, true);

    safaridriver.extension.logHandler_ =
        new safaridriver.logging.ForwardingHandler(
            safaridriver.extension.loggingTab_.page);

    safaridriver.extension.tabManager_.ignoreTab(
        safaridriver.extension.loggingTab_);
  }

  if (safaridriver.extension.loggingTab_.url !==
      safaridriver.extension.LOG_PAGE_URL_) {
    safaridriver.extension.loggingTab_.addEventListener(
        'navigate', onLoad, true);
    safaridriver.extension.loggingTab_.url =
        safaridriver.extension.LOG_PAGE_URL_;
  }

  function onClose() {
    safaridriver.extension.loggingTab_.removeEventListener(
        'close', onClose, true);
    safaridriver.extension.loggingTab_ = null;

    safaridriver.extension.logHandler_.dispose();
    safaridriver.extension.logHandler_ = null;
  }

  function onLoad() {
    safaridriver.extension.loggingTab_.removeEventListener(
        'navigate', onLoad, true);

    if (safaridriver.extension.loggingTab_.url !==
        safaridriver.extension.LOG_PAGE_URL_) {
      return;  // Navigated to another page.
    }

    safaridriver.extension.LogDb.getInstance().get().
        then(function(entries) {
          var message = new safaridriver.message.Log(entries);
          message.send(safaridriver.extension.loggingTab_.page);
        });
  }
};


/**
 * Responds to command events from the Safari application.
 * @param {!SafariCommandEvent} e The event.
 * @private
 */
safaridriver.extension.onCommand_ = function(e) {
  if (e.command === 'showlog') {
    safaridriver.extension.openLogWindow_();
  }
};


/**
 * Responds to a message from an injected script. Note this event listener is
 * attached to the {@code safari.application} object and will receive messages
 * <em>after</em> any listeners attached directly to a tab or browser.
 * @param {!SafariExtensionMessageEvent} e The event.
 * @private
 */
safaridriver.extension.onMessage_ = function(e) {
  var isSynchronous = e.name === 'canLoad';
  var message = safaridriver.message.fromEvent(e);
  var type = message.getType();
  switch (type) {
    case safaridriver.message.Command.TYPE:
      var command = /** @type {!safaridriver.message.Command} */ (message).
          getCommand();

      var server = safaridriver.extension.createSessionServer_();
      server.execute(command, function(error, responseObj) {
        // Only send responses to the logging window. If the window is no longer
        // open, there's nothing to send the response to.
        if (!safaridriver.extension.loggingTab_) {
          return;
        }

        if (error) {
          responseObj = bot.response.createErrorResponse(error);
        }

        var response = new safaridriver.message.Response(command.getId(),
            /** @type {bot.response.ResponseObject} */ (responseObj));
        response.send(safaridriver.extension.loggingTab_.page);
      });
      break;

    case safaridriver.message.Connect.TYPE:
      var url = /** @type {!safaridriver.message.Connect} */ (message).getUrl();

      // If the message was sent synchronously, acknowledge the request. The
      // message will be async if this extension is being used with an older
      // version of the SafariDriver client.
      if (isSynchronous) {
        e.message = true;
      }

      var server = safaridriver.extension.createSessionServer_();
      server.connect(url).
          then(function() {
            safaridriver.extension.LOG_.info('Connected to client: ' + url);
            safaridriver.extension.numConnections_++;
            server.onDispose(function() {
              safaridriver.extension.numConnections_--;
            });
          }, function(e) {
            safaridriver.extension.LOG_.severe(
                'Failed to connect to client: ' + url, e);
          });
      break;

    case safaridriver.message.Alert.TYPE:
      checkIsSynchronous();
      if (message.blocksUiThread() &&
          !safaridriver.extension.session_.isExecutingCommand()) {
        safaridriver.extension.LOG_.warning(
            'Saving unhandled alert text: ' + message.getMessage());
        safaridriver.extension.session_.setUnhandledAlertText(
            message.getMessage());
      }

      // TODO: Fully support alerts. See
      // http://code.google.com/p/selenium/issues/detail?id=3862
      e.message = !!safaridriver.extension.numConnections_;
      break;

    case safaridriver.message.Log.TYPE:
      if (safaridriver.extension.logHandler_) {
        safaridriver.extension.logHandler_.forward(
            /** @type {!safaridriver.message.Log} */ (message));
      }
      safaridriver.extension.LogDb.getInstance().save(
          /** @type {!safaridriver.message.Log} */ (message).getEntries());
      break;

    case safaridriver.message.LoadModule.TYPE:
      checkIsSynchronous();
      e.message = safaridriver.extension.loadModule_(message.getModuleId());
      break;
  }

  function checkIsSynchronous() {
    goog.asserts.assert(isSynchronous,
        'Expected a synchronous message for type %s', type);
  }
};


/**
 * Creates a new session. The SafariDriver supports multiple sessions, each
 * with their own timeouts, but they all share the same tab manager.
 * @return {!safaridriver.extension.Server} The new server.
 * @private
 */
safaridriver.extension.createSessionServer_ = function() {
  return new safaridriver.extension.Server(safaridriver.extension.session_);
};


/**
 * @param {string} moduleId The module to load.
 * @return {!bot.response.ResponseObject} The response.
 * @private
 */
safaridriver.extension.loadModule_ = function(moduleId) {
  safaridriver.extension.LOG_.config('Loading module(' + moduleId + ')');
  var moduleFn = safaridriver.extension.modules_[moduleId];
  if (moduleFn) {
    return bot.response.createResponse(moduleFn.toString());
  }
  safaridriver.extension.LOG_.warning('module not found: ' + moduleId);
  return bot.response.createErrorResponse(
      Error('Internal error: module ' + moduleId + ' not found'));
};


/**
 * Object hash for compiled modules for lazy loading from the injected script.
 * @private {!Object.<function()>}
 */
safaridriver.extension.modules_ = {};
goog.exportSymbol('MODULES', safaridriver.extension.modules_);
