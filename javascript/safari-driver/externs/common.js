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
 * @fileoverview Extern definitions for compiling the SafariDriver.
 */


/** @type {!Object} */
var console = {};

/**
 * @param {string} msg
 * @param {...} var_args
 */
console.group = function(msg, var_args) {};

console.groupEnd = function() {};

/**
 * @param {string} msg
 * @param {...} var_args
 */
console.error = function(msg, var_args) {};

/**
 * @param {string} msg
 * @param {...} var_args
 */
console.warn = function(msg, var_args) {};

/**
 * @param {string} msg
 * @param {...} var_args
 */
console.info = function(msg, var_args) {};

/**
 * @param {string} msg
 * @param {...} var_args
 */
console.debug = function(msg, var_args) {};


/** @type {!Object} */
var JSON = {};

/**
 * @param {string} value
 * @return {!Object}
 */
JSON.parse = function(value) {};

/**
 * @param {*} value
 * @return {string}
 */
JSON.stringify = function(value) {};


/**
 * @constructor
 * @extends {SafariEvent}
 */
function SafariActivateEvent() {}

/** @override */
SafariDeactivateEvent.prototype.type = 'activate';


/**
 * @constructor
 * @extends {SafariEventTarget}
 */
function SafariApplication() {}

/** @type {SafariBrowserWindow} */
SafariApplication.prototype.activeBrowserWindow = null;

/** @type {!Array.<!SafariBrowserWindow>} */
SafariApplication.prototype.browserWindows = [];

SafariApplication.prototype.openBrowserWindow = function() {};


/**
 * @constructor
 * @extends {SafariEvent}
 */
function SafariBeforeNavigateEvent() {}

/** @override */
SafariBeforeNavigateEvent.prototype.type = 'beforeNavigate';

/** @type {string} */
SafariBeforeNavigateEvent.prototype.url = '';


/**
 * @constructor
 * @extends {SafariEventTarget}
 */
function SafariBrowserTab() {}

/** @type {!SafariBrowserWindow} */
SafariBrowserTab.prototype.browserWindow;

/** @type {!SafariWebPageProxy} */
SafariBrowserTab.prototype.page;

/** @type {string} */
SafariBrowserTab.prototype.title = '';

/** @type {string} */
SafariBrowserTab.prototype.url = '';

SafariBrowserTab.prototype.activate = function() {};

SafariBrowserTab.prototype.close = function() {};

/**
 * @param {function(string)=} opt_callback
 * @return {string}
 */
SafariBrowserTab.prototype.visibleContentsAsDataURL = function(opt_callback) {
  return '';
};


/**
 * @constructor
 * @extends {SafariEventTarget}
 */
function SafariBrowserWindow() {}

/** @type {!SafariBrowserTab} */
SafariBrowserWindow.prototype.activeTab;

/** @type {!Array.<!SafariBrowserTab>} */
SafariBrowserWindow.prototype.tabs = [];

/** @type {boolean} */
SafariBrowserWindow.prototype.visible = true;

SafariBrowserWindow.prototype.activate = function() {};

SafariBrowserWindow.prototype.close = function() {};

/**
 * @param {!SafariBrowserTab} tab
 * @param {number} index
 */
SafariBrowserWindow.prototype.insertTab = function(tab, index) {};

/**
 * @param {string} visibility
 * @param {number} index
 */
SafariBrowserWindow.prototype.openTab = function(visibility, index) {};


/**
 * @constructor
 * @extends {SafariEvent}
 */
function SafariCloseEvent() {}

/** @override */
SafariCloseEvent.prototype.type = 'close';


/** @constructor */
function SafariContentNamespace() {}

/** @type {!SafariContentExtension} */
SafariContentNamespace.prototype.extension;

/** @type {!SafariContentWebPage} */
SafariContentNamespace.prototype.self;


/** @constructor */
function SafariContentBrowserTabProxy() {}

/**
 * @param {!Event} event The before-load event.
 * @param {*} message The message body.
 */
SafariContentBrowserTabProxy.prototype.canLoad = function(event, message) {};

/**
 * @param {string} name The name of hte message.
 * @param {*=} opt_message The message body.
 */
SafariContentBrowserTabProxy.prototype.dispatchMessage =
    function(name, opt_message) {};


/** @constructor */
function SafariContentExtension() {}

/** @type {string} */
SafariContentExtension.prototype.baseURI = '';


/**
 * @constructor
 * @extends {SafariEventTarget}
 */
function SafariContentWebPage() {}

/** @type {!SafariContentBrowserTabProxy} */
SafariContentWebPage.prototype.tab;


/**
 * @constructor
 * @extends {SafariEvent}
 */
function SafariDeactivateEvent() {}

/** @override */
SafariDeactivateEvent.prototype.type = 'deactivate';


/** @constructor */
function SafariEvent() {}

/** @type {boolean} */
SafariEvent.prototype.bubbles = true;

/** @type {boolean} */
SafariEvent.prototype.cancelable = true;

/** @type {!SafariEventTarget} */
SafariEvent.prototype.currentTarget;

/** @type {boolean} */
SafariEvent.prototype.defaultPrevented = false;

/** @type {!SafariEventTarget} */
SafariEvent.prototype.target;

/** @type {string} */
SafariEvent.prototype.type = '';

SafariEvent.prototype.preventDefault = function() {};

SafariEvent.prototype.stopPropagation = function() {};


/** @constructor */
function SafariEventTarget() {}

/**
 * @param {string} type
 * @param {!Function} listener
 * @param {boolean} useCapture
 */
SafariEventTarget.prototype.addEventListener = function(type, listener,
    useCapture) {
};

/**
 * @param {string} type
 * @param {!Function} listener
 * @param {boolean} useCapture
 */
SafariEventTarget.prototype.removeEventListener = function(type, listener,
    useCapture) {
};


/** @constructor */
function SafariExtension() {}
// TODO: finish documenting the SafariExtension type.


/** @constructor */
function SafariExtensionGlobalPage() {}

/** @type {!Window} */
SafariExtensionGlobalPage.prototype.contentWindow;


/**
 * @constructor
 * @extends {SafariEvent}
 */
function SafariExtensionMessageEvent() {}

/** @override */
SafariExtensionMessageEvent.prototype.type = 'message';

/** @type {*} */
SafariExtensionMessageEvent.prototype.message;

/** @type {string} */
SafariExtensionMessageEvent.prototype.name;


/** @constructor */
function SafariNamespace() {}

/** @type {!SafariApplication} */
SafariNamespace.prototype.application;

/** @type {!SafariExtension} */
SafariNamespace.prototype.extension;

/** @type {!SafariExtensionGlobalPage} */
SafariNamespace.prototype.self;


/**
 * @constructor
 * @extends {SafariEvent}
 */
function SafariNavigateEvent() {}

/** @override */
SafariNavigateEvent.prototype.type = 'navigate';


/**
 * @constructor
 * @extends {SafariEvent}
 */
function SafariOpenEvent() {}

/** @override */
SafariOpenEvent.prototype.type = 'open';


/**
 * @constructor
 * @extends {SafariEventTarget}
 */
function SafariWebPageProxy() {}

/**
 * @param {string} name
 * @param {*=} opt_message
 */
SafariWebPageProxy.prototype.dispatchMessage = function(name, opt_message) {};
