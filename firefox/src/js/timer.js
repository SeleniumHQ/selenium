/*
 Copyright 2010 WebDriver committers
 Copyright 2010 Google Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @fileoverview An implementation of a timer that can be used without an
 * assocuated window.
 */


var CC = Components.classes;
var CI = Components.interfaces;




/**
 * @constructor
 */
function Timer() { /* Empty */ }


/**
 * Set a callback to be executed after a specified time out. The default time
 * out is 10ms.
 *
 * @param {!function(*=): *} callback The callback to use.
 * @param {number=} opt_timeout An optional timeout to use.
 */
Timer.prototype.setTimeout = function(callback, opt_timeout) {
  var timeout = opt_timeout || 10;
  var timer = CC['@mozilla.org/timer;1'].createInstance(CI['nsITimer']);

  timer.initWithCallback({
    notify: function() {
      callback.apply(null);
    }
  }, timeout, CI.nsITimer.TYPE_ONE_SHOT);
};

var EXPORTED_SYMBOLS = [ 'Timer' ];
