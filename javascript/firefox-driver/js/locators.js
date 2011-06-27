// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
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
 * @fileoverview Firefox specific locator strategies.
 */

goog.provide('webdriver.firefox.locators');

goog.require('bot.locators');
goog.require('goog.dom');
goog.require('webdriver.firefox.utils');


if (webdriver.firefox.utils.compareVersion('3.5') < 0) {
  bot.locators.add('css', (function() {
    var sizzle = [
        'var originalSizzle = window.Sizzle;',
        Utils.loadUrl('resource://fxdriver/sizzle.js') + ';',
        'var results = Sizzle(arguments[0], arguments[1]);',
        'window.Sizzle = originalSizzle;'
    ].join('\n');

    function compileScript(script, root) {
      var win = goog.dom.getOwnerDocument(root).defaultView;
      win = webdriver.firefox.utils.unwrap(win);
      return new win.Function(script);
    }

    return {
      single: function(target, root) {
        var fn = compileScript(sizzle + ' return results[0] || null;', root);
        root = webdriver.firefox.utils.unwrap(root);
        return fn.call(null, target, root);
      },
      many: function(target, root) {
        var fn = compileScript(sizzle + ' return results;', root);
        root = webdriver.firefox.utils.unwrap(root);
        return fn.call(null, target, root);
      }
    };
  })());
}
