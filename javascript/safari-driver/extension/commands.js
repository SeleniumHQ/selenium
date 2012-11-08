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
 * @fileoverview Definitions for various command handlers used by the
 * {@link safaridriver.extension.Server}.
 */

goog.provide('safaridriver.extension.commands');

goog.require('bot.response');
goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.string');
goog.require('safaridriver.extension.Tab');
goog.require('safaridriver.message.Load');
goog.require('webdriver.promise');


/**
 * @type {!goog.debug.Logger}
 * @private
 * @const
 */
safaridriver.extension.commands.LOG_ = goog.debug.Logger.getLogger(
    'safaridriver.extension.commands');


/**
 * Retrieves a session's capabilities.
 * @param {!safaridriver.extension.Session} session The session object.
 * @return {!Object.<*>} The session capabilities.
 */
safaridriver.extension.commands.describeSession = function(session) {
  return session.getCapabilities();
};


/**
 * Closes the tab the given session is currently focused on.
 * @param {!safaridriver.extension.Session} session The session object.
 */
safaridriver.extension.commands.closeTab = function(session) {
  session.getCommandTab().getBrowserTab().close();
};


/**
 * @param {!safaridriver.extension.Session} session The session object.
 * @return {string} The handle for the tab the session is currently focused on.
 */
safaridriver.extension.commands.getWindowHandle = function(session) {
  return session.getCommandTab().getId();
};


/**
 * @param {!safaridriver.extension.Session} session The session object.
 * @return {!Array.<string>} A list of IDs for the open tabs.
 */
safaridriver.extension.commands.getWindowHandles = function(session) {
  return session.getTabIds();
};


/**
 * @param {!safaridriver.extension.Session} session The session object.
 * @return {!webdriver.promise.Promise} A promise that will resolve to a
 *     screenshot of the focused tab as a base64 encoded PNG.
 */
safaridriver.extension.commands.takeScreenshot = function(session) {
  var response = new webdriver.promise.Deferred();
  session.getCommandTab().visibleContentsAsDataURL(function(dataUrl) {
    response.resolve(dataUrl.substring('data:image/png;base64,'.length));
  });
  return response.promise;
};


/**
 * Loads a new page in the provided session.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!safaridriver.Command} command The command object.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when
 *     the operation has completed.
 */
safaridriver.extension.commands.loadUrl = function(session, command) {
  var url = command.getParameter('url');
  if (!url) {
    throw Error('Invalid command: missing "url" parameter');
  }

  // Extensions do not work with files loaded from file://, so fail fast if
  // we're asked to load such a URL.
  var uri = new goog.Uri(url);
  if (uri.getScheme() === 'file') {
    throw Error('Unsupported URL protocol: ' + url +
        '; for more information, see ' +
        'http://code.google.com/p/selenium/issues/detail?id=3773');
  }

  var response = new webdriver.promise.Deferred();
  var tab = session.getCommandTab();
  tab.whenReady(function() {
    var expectLoad = tab.loadsNewPage(uri);
    if (expectLoad) {
      tab.once(safaridriver.message.Load.TYPE, onLoad);
    }
    safaridriver.extension.commands.sendCommand(session, command).
        then(onSuccess, onFailure);

    function onLoad() {
      if (response.isPending()) {
        safaridriver.extension.commands.LOG_.info(
            'Page load finished; returning');
        response.resolve();
      }
    }

    function onSuccess() {
      if (!expectLoad && response.isPending()) {
        safaridriver.extension.commands.LOG_.info(
            'Not expecting a new page load; returning');
        response.resolve();
      }
    }

    function onFailure(e) {
      if (response.isPending()) {
        safaridriver.extension.commands.LOG_.severe(
            'Error while loading page; failing', e);
        tab.removeListener(safaridriver.message.Load.TYPE, onLoad);
        response.reject(e);
      }
    }
  });

  return response.promise;
};


/**
 * Reloads the session's current page.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!safaridriver.Command} command The command object.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when
 *     the operation has completed.
 */
safaridriver.extension.commands.refresh = function(session, command) {
  var response = new webdriver.promise.Deferred();
  var tab = session.getCommandTab();
  tab.whenReady(function() {
    tab.once(safaridriver.message.Load.TYPE, onLoad);

    safaridriver.extension.commands.sendCommand(session, command).
        addErrback(function(e) {
          if (response.isPending()) {
            tab.removeListener(safaridriver.message.Load.TYPE, onLoad);
            response.reject(e);
          }
        });

    function onLoad() {
      if (response.isPending()) {
        response.resolve();
      }
    }
  });
  return response.promise;
};


/**
 * Updates the implicit wait setting for the given session.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!safaridriver.Command} command The command object.
 */
safaridriver.extension.commands.implicitlyWait = function(session, command) {
  session.setImplicitWait(
      (/** @type {number} */command.getParameter('ms')) || 0);
};


/**
 * Updates the async script timeout setting for the given session.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!safaridriver.Command} command The command object.
 */
safaridriver.extension.commands.setScriptTimeout = function(session, command) {
  session.setScriptTimeout(
      (/** @type {number} */command.getParameter('ms')) || 0);
};


/**
 * Sends a command to locate an element on the current page. This operation is
 * subject to the implicit wait setting on the given session. When searching
 * for a single element, the driver should poll the page until the element has
 * been found, or this timeout expires before returning a NoSuchElement error.
 * When searching for multiple elements, the driver should poll the page until
 * at least one element has been found or this timeout has expired.
 *
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!safaridriver.Command} command The command object.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when the
 *     operation has completed.
 */
safaridriver.extension.commands.findElement = function(session, command) {
  var started;
  var result = new webdriver.promise.Deferred();
  session.getCommandTab().whenReady(findElement);
  return result.promise;

  function findElement() {
    if (!goog.isDef(started)) {
      started = goog.now();
    }
    return safaridriver.extension.commands.sendCommand(session, command).
        then(checkResponse);
  }

  function checkResponse(response) {
    var status = response['status'];
    if (status !== bot.ErrorCode.SUCCESS) {
      // The command failed from an irrecoverable error.
      result.resolve(response);
      return;
    }

    var value = response['value'];
    var foundElement = goog.isDefAndNotNull(value) &&
        (!goog.isArray(value) || !!value.length);

    if (!foundElement &&
        session.getImplicitWait() > 0 &&
        goog.now() - started < session.getImplicitWait()) {
      setTimeout(findElement, 100);
    } else if (!value) {
      var error = new bot.Error(bot.ErrorCode.NO_SUCH_ELEMENT,
          'Could not find element: ' + JSON.stringify(command.getParameters()));
      result.reject(error);
    } else {
      result.resolve(response);
    }
  }
};


/**
 * Default amount of time, in milliseconds, to wait for a response to any
 * commands sent to the injected script.  This is set arbitarily high as we
 * should never hit. It is used soley as a means of preventing hanging the
 * client when something breaks inside the driver.
 * @type {number}
 * @const
 * @private
 */
safaridriver.extension.commands.DEFAULT_COMMAND_TIMEOUT_ = 30000;


/**
 * Sends a command to the provided session's current tab.
 * @param {!(safaridriver.extension.Session|safaridriver.extension.Tab)}
 *     sessionOrTab Either the session or tab to send the command to. If given a
 *     session, the command will be sent to the tab the session is currently
 *     focused on.
 * @param {!safaridriver.Command} command The command object.
 * @param {number=} opt_additionalTimeout An optional amount of time, in
 *     milliseconds, to wait for a command response. This timeout is added to
 *     the default timeout applied to all commands.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the command response.
 */
safaridriver.extension.commands.sendCommand = function(sessionOrTab, command,
    opt_additionalTimeout) {
  var timeout = (opt_additionalTimeout || 0) +
      safaridriver.extension.commands.DEFAULT_COMMAND_TIMEOUT_;
  var tab = sessionOrTab instanceof safaridriver.extension.Tab ?
      (/** @type {!safaridriver.extension.Tab} */sessionOrTab) :
      (/** @type {!safaridriver.extension.Session} */sessionOrTab).
          getCommandTab();
  return tab.send(command, timeout);
};


/**
 * Changes focus to another window.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!safaridriver.Command} command The command object.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when the
 *     operation has completed.
 */
safaridriver.extension.commands.switchToWindow = function(session, command) {
  var result = new webdriver.promise.Deferred();
  var name = (/** @type {string} */ command.getParameter('name'));

  var tab = session.getTab(name);
  if (tab) {
    switchToTab(tab);
    return result.promise;
  }

  var tabIds = session.getTabIds();
  safaridriver.extension.commands.LOG_.info(
      'Window handle not found; collecting open window names');
  var windowNames = goog.array.map(tabIds, function(tabId) {
    var tab = session.getTab(tabId);
    if (!tab) {
      // The window was closed in the time it took us to ask it for its name.
      // Hopefully, this will never happen.
      return null;
    }
    return safaridriver.extension.commands.sendCommand(tab, command).
        then(bot.response.checkResponse).
        then(function(responseObj) {
          return responseObj['value'];
        });
  });

  webdriver.promise.fullyResolved(windowNames).then(function(windowNames) {
    safaridriver.extension.commands.LOG_.info(
        'Open window names: ' + JSON.stringify(windowNames));
    var index = goog.array.findIndex(windowNames, function(windowName) {
      return windowName === name;
    });

    if (index < 0) {
      result.reject(new bot.Error(bot.ErrorCode.NO_SUCH_WINDOW,
          'No such window: ' + name));
      return;
    }

    var tab = session.getTab(tabIds[index]);
    switchToTab(tab);
  }, result.reject);

  return result.promise;

  function switchToTab(tab) {
    // Switch back to the default content for the current tab before switching
    // to the new tab.
    try {
      var currentTab = session.getCommandTab();
      currentTab.whenReady(function() {
        var switchToNullContent = new safaridriver.Command(
            goog.string.getRandomString(),
            webdriver.CommandName.SWITCH_TO_FRAME, {
              'id': null
            });
        currentTab.send(switchToNullContent);

        session.setCommandTab(/** @type {!safaridriver.extension.Tab} */tab);
        result.resolve();
      });
    } catch (ex) {
      // If we attempt to retrieve the current tab after it's been closed,
      // we'll receive a NoSuchWindowError. When this happens, just ignore it
      // and move along. Any other error should be reported to the user.
      if (ex.code !== bot.ErrorCode.NO_SUCH_WINDOW) {
        throw ex;
      }

      session.setCommandTab(/** @type {!safaridriver.extension.Tab} */tab);
      result.resolve();
    }
  }
};


/**
 * Sends a command that should target the currently selected window.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!safaridriver.Command} command The command object.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the command response.
 */
safaridriver.extension.commands.sendWindowCommand = function(session, command) {
  var handle = (/** @type {string} */command.getParameter('windowHandle'));
  var tab;
  if (handle === 'current') {
    tab = session.getCommandTab();
  } else if (!(tab = session.getTab(handle))) {
    throw new bot.Error(bot.ErrorCode.NO_SUCH_WINDOW,
        'No such window: ' + handle);
  }
  return safaridriver.extension.commands.sendCommand(tab, command);
};


/**
 * Sends a script-based command to the currently selected window.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!safaridriver.Command} command The command object.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the command response.
 */
safaridriver.extension.commands.executeAsyncScript = function(session,
                                                              command) {
  // The async timeout is saved on the session, so embed it in the command to
  // be sent to the injected script.
  var timeout = session.getScriptTimeout();
  command.setParameter('timeout', timeout);
  return safaridriver.extension.commands.sendCommand(session, command, timeout);
};


/**
 * Alert handling is not supported yet. To prevent tests from hanging, alerts
 * are always immediately dimissed. This command handler, used for all of the
 * alert commands, provides users with a friendly error for the unsupported
 * feature.
 * TODO: Fully support alerts.
 * @see http://code.google.com/p/selenium/issues/detail?id=3862
 */
safaridriver.extension.commands.handleNoAlertsPresent = function() {
  throw new bot.Error(bot.ErrorCode.NO_MODAL_DIALOG_OPEN,
      'The SafariDriver does not support alert handling. To prevent tests ' +
          'from handing when an alert is opened, they are always immediately ' +
          'dismissed. For more information, see ' +
          'http://code.google.com/p/selenium/issues/detail?id=3862');
};
