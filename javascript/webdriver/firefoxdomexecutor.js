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

goog.provide('webdriver.FirefoxDomExecutor');

goog.require('goog.json');
goog.require('goog.userAgent.product');
goog.require('webdriver.Command');
goog.require('webdriver.CommandName');
goog.require('webdriver.error');


/**
 * @constructor
 * @implements {webdriver.CommandExecutor}
 */
webdriver.FirefoxDomExecutor = function() {
  if (!webdriver.FirefoxDomExecutor.isAvailable()) {
    throw Error(
        'The current environment does not support the FirefoxDomExecutor');
  }

  /**
   * @type {!Document}
   * @private
   */
  this.doc_ = document;

  /**
   * @type {!Element}
   * @private
   */
  this.docElement_ = document.documentElement;

  this.docElement_.addEventListener(
      webdriver.FirefoxDomExecutor.EventType_.RESPONSE,
      goog.bind(this.onResponse_, this), false);
};


/**
 * @return {boolean} Whether the current environment supports the
 *     FirefoxDomExecutor.
 */
webdriver.FirefoxDomExecutor.isAvailable = function() {
  return goog.userAgent.product.FIREFOX &&
      typeof document !== 'undefined' &&
      document.documentElement &&
      goog.isFunction(document.documentElement.hasAttribute) &&
      document.documentElement.hasAttribute('webdriver');
};


/**
 * Attributes used to communicate with the FirefoxDriver extension.
 * @enum {string}
 * @private
 */
webdriver.FirefoxDomExecutor.Attribute_ = {
  COMMAND: 'command',
  RESPONSE: 'response'
};


/**
 * Events used to communicate with the FirefoxDriver extension.
 * @enum {string}
 * @private
 */
webdriver.FirefoxDomExecutor.EventType_ = {
  COMMAND: 'webdriverCommand',
  RESPONSE: 'webdriverResponse'
};


/**
 * The pending command, if any.
 * @type {{name:string, callback:!Function}}
 * @private
 */
webdriver.FirefoxDomExecutor.prototype.pendingCommand_ = null;


/** @override */
webdriver.FirefoxDomExecutor.prototype.execute = function(command, callback) {
  if (this.pendingCommand_) {
    throw Error('Currently awaiting a command response!');
  }

  this.pendingCommand_ = {
    name: command.getName(),
    callback: callback
  };

  var parameters = command.getParameters();

  if (parameters['id'] && parameters['id']['ELEMENT']) {
    parameters['id'] = parameters['id']['ELEMENT'];
  }

  var json = goog.json.serialize({
    'name': command.getName(),
    'sessionId': {
      'value': parameters['sessionId']
    },
    'parameters': parameters
  });
  this.docElement_.setAttribute(
      webdriver.FirefoxDomExecutor.Attribute_.COMMAND, json);

  var event = this.doc_.createEvent('Event');
  event.initEvent(webdriver.FirefoxDomExecutor.EventType_.COMMAND,
      /*canBubble=*/true, /*cancelable=*/true);

  this.docElement_.dispatchEvent(event);
};


/** @private */
webdriver.FirefoxDomExecutor.prototype.onResponse_ = function() {
  if (!this.pendingCommand_) {
    return;  // Not expecting a response.
  }

  var command = this.pendingCommand_;
  this.pendingCommand_ = null;

  var json = this.docElement_.getAttribute(
      webdriver.FirefoxDomExecutor.Attribute_.RESPONSE);
  if (!json) {
    command.callback(Error('Empty command response!'));
    return;
  }

  this.docElement_.removeAttribute(
      webdriver.FirefoxDomExecutor.Attribute_.COMMAND);
  this.docElement_.removeAttribute(
      webdriver.FirefoxDomExecutor.Attribute_.RESPONSE);

  try {
    var response = webdriver.error.checkResponse(goog.json.parse(json));
  } catch (ex) {
    command.callback(ex);
    return;
  }

  if (command.name == webdriver.CommandName.NEW_SESSION) {
    var cmd = new webdriver.Command(webdriver.CommandName.DESCRIBE_SESSION).
        setParameter('sessionId', response['value']);
    this.execute(cmd, command.callback);
  } else {
    command.callback(null, response);
  }
};
