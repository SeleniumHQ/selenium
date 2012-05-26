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
 * @fileoverview Simple log handler that logs messages to the global console.
 */

goog.provide('safaridriver.console');

goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger.Level');
goog.require('goog.debug.TextFormatter');


/**
 * Initializes a log handler that logs to the global console.
 */
safaridriver.console.init = function() {
  var formatter = new goog.debug.TextFormatter();
  formatter.showAbsoluteTime = false;
  formatter.showExceptionText = true;

  goog.debug.LogManager.getRoot().addHandler(function(logRecord) {
    var record = formatter.formatRecord(logRecord);

    switch (logRecord.getLevel()) {
      case goog.debug.Logger.Level.SHOUT:
        console.group(record);
        console.groupEnd();
        break;
      case goog.debug.Logger.Level.SEVERE:
        console.error(record);
        break;
      case goog.debug.Logger.Level.WARNING:
        console.warn(record);
        break;
      case goog.debug.Logger.Level.INFO:
        console.info(record);
        break;
      default:
        console.debug(record);
        break;
    }
  });
};
