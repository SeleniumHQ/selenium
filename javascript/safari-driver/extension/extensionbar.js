// Copyright 2013 Selenium committers
// Copyright 2013 Software Freedom Conservancy
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
 * @fileoverview Utilities for working with the browser window extension bar.
 */

goog.provide('safaridriver.extension.bar');


/**
 * Sets the message to display to the user in the extension bar.
 * @param {string} message The message text.
 * @param {string=} opt_color The message color; defaults to black.
 */
safaridriver.extension.bar.setUserMessage = function(message, opt_color) {
  var color = opt_color || 'black';
  if (message.length > 75) {
    message = message.substring(0, 75) + '...';
  }

  var bars = safari.extension.bars;
  for (var i = 0, n = bars.length; i < n; ++i) {
    var bar = bars[i];
    var msgEl = bar.contentWindow.document.getElementById('message');
    if (msgEl) {
      msgEl.innerText = message;
      msgEl.style.color = color;
    }
  }
};