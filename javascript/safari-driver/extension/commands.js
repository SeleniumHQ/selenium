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

/**
 * @fileoverview Definitions for various command handlers used by the
 * {@link safaridriver.extension.Server}.
 */

goog.provide('safaridriver.extension.commands');

goog.require('goog.Uri');
goog.require('goog.debug.Logger');
goog.require('goog.string');
goog.require('safaridriver.extension.Tab');
goog.require('webdriver.error');
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
 * @return {!webdriver.promise.Promise} A promise that will resolve to the
 *     current tab's URL.
 */
safaridriver.extension.commands.getCurrentUrl = function(session) {
  var response = new webdriver.promise.Deferred();
  session.getCommandTab().whenReady(function(tab) {
    response.resolve(tab.url);
  });
  return response.promise;
};


/**
 * @param {!safaridriver.extension.Session} session The session object.
 * @return {!webdriver.promise.Promise} A promise that will resolve to the
 *     current tab's title.
 */
safaridriver.extension.commands.getTitle = function(session) {
  var response = new webdriver.promise.Deferred();
  session.getCommandTab().whenReady(function(tab) {
    response.resolve(tab.title);
  });
  return response.promise;
};


/**
 * Loads a new page in the provided session.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!webdriver.Command} command The command object.
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
    throw Error('Unsupported URL protocol: ' + url);
  }

  var response = new webdriver.promise.Deferred();
  session.getCommandTab().whenReady(function(tab) {
    var expectLoad = session.getCommandTab().loadsNewPage(uri);
    if (expectLoad) {
      tab.addEventListener('navigate', onNavigate, false);
    }
    safaridriver.extension.commands.sendCommand(session, command).
        then(onSuccess, onFailure);

    function onNavigate() {
      if (response.isPending()) {
        tab.removeEventListener('navigate', onNavigate, false);
        safaridriver.extension.commands.LOG_.info(
            'Page load finished; returning: ' + tab.url);
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
        tab.removeEventListener('navigate', onNavigate, false);
        response.reject(e);
      }
    }
  });

  return response.promise;
};


/**
 * Reloads the session's current page.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!webdriver.Command} command The command object.
 */
safaridriver.extension.commands.refresh = function(session, command) {
  var response = new webdriver.promise.Deferred();
  session.getCommandTab().whenReady(function(tab) {
    tab.addEventListener('navigate', onNavigate, false);

    safaridriver.extension.commands.sendCommand(session, command).
        addErrback(function(e) {
          if (response.isPending()) {
            tab.removeEventListener('navigate', onNavigate, false);
            response.reject(e);
          }
        });

    function onNavigate() {
      if (response.isPending()) {
        tab.removeEventListener('navigate', onNavigate, false);
        response.resolve();
      }
    }
  });
  return response.promise;
};


/**
 * Updates the implicit wait setting for the given session.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!webdriver.Command} command The command object.
 */
safaridriver.extension.commands.implicitlyWait = function(session, command) {
  session.setImplicitWait(
      (/** @type {number} */command.getParameter('ms')) || 0);
};


/**
 * Updates the async script timeout setting for the given session.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!webdriver.Command} command The command object.
 */
safaridriver.extension.commands.setScriptTimeout = function(session, command) {
  session.setScriptTimeout(
      (/** @type {number} */command.getParameter('ms')) || 0);
};


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
    var value = response['value'];
    if ((!value || !value.length) &&
        session.getImplicitWait() > 0 &&
        goog.now() - started < session.getImplicitWait()) {
      findElement();
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
 * Sends a command to the provided session's current tab.
 * @param {!(safaridriver.extension.Session|safaridriver.extension.Tab)} sessionOrTab Either the
 *     session or tab to send the command to. If given a session, the command
 *     will be sent to the tab the session is currently focused on.
 * @param {!webdriver.Command} command The command object.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the command response.
 */
safaridriver.extension.commands.sendCommand = function(sessionOrTab, command) {
  var id = goog.string.getRandomString();
  var response = new webdriver.promise.Deferred();

  var json = {
    'id': id,
    'name': command.getName(),
    'parameters': command.getParameters()
  };

  safaridriver.extension.commands.LOG_.info('Sending command: ' +
      JSON.stringify(json));
  var tab = sessionOrTab instanceof safaridriver.extension.Tab
      ? (/** @type {!safaridriver.extension.Tab} */sessionOrTab)
      : (/** @type {!safaridriver.extension.Session} */sessionOrTab).getCommandTab();
  tab.whenReady(function(tab) {
    tab.addEventListener('message', onMessage, false);
    tab.page.dispatchMessage(safaridriver.MessageType.COMMAND, json);

    function onMessage(e) {
      if (e.name !== safaridriver.MessageType.RESPONSE) {
        return;
      }

      if (e.message.id !== id) {
        safaridriver.extension.commands.LOG_.info(
            'Ignoring response to another command: ' +
                e.message.id + ' (' + id + ')');
        return;
      }

      tab.removeEventListener('message', onMessage, false);
      try {
        response.resolve(webdriver.error.checkResponse(e.message.response));
      } catch (ex) {
        response.reject(ex);
      }
    }
  });

  return response.promise;
};


/**
 * Changes focus to another window.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!webdriver.Command} command The command object.
 */
safaridriver.extension.commands.switchToWindow = function(session, command) {
  var id = (/** @type {string} */ command.getParameter('id'));
  if (!id) {
    throw Error('Invalid command: missing required parameter "id"');
  }

  var tab = session.getTab(id);
  if (!tab) {
    // TODO: handle switching by window name.
    throw new bot.Error(bot.ErrorCode.NO_SUCH_WINDOW, 'No such window: ' + id);
  }
  session.setCommandTab(/** @type {!safaridriver.extension.Tab} */tab);
};


/**
 * Changes focus to another frame in the current window.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!webdriver.Command} command The command object.
 */
safaridriver.extension.commands.switchToFrame = function(session, command) {
  // If switching to default content, we can silently return, since that is all
  // we support right now. If switching to something else, go ahead and throw
  // up. TODO: Implement this correctly.
  if (command.getParameter('id') !== null) {
    throw new Error('Unimplemented command: ' + command.getName());
  }
};


/**
 * Sends a command that should target the currently selected window.
 * @param {!safaridriver.extension.Session} session The session object.
 * @param {!webdriver.Command} command The command object.
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
