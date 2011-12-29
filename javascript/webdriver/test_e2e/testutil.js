// Copyright 2011 Software Freedom Conservancy. All Rights Reserved.
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

goog.provide('webdriver.test_e2e.TestUtil');


webdriver.test_e2e.TestUtil = (function() {

  var MAIN_WINDOW_NAME = 'main_window';
  var TEST_WINDOW_NAME = 'test_window';
  var testWindow;

  window.name = MAIN_WINDOW_NAME;

  return {
    /**
     * Opens a new test window. Does not check if the window opened
     * successfully.
     * @param {string=} opt_url The URL to open in the window.
     * @param {number=} opt_left The initial position in pixels from the left
     *     side of the screen.
     * @param {number=} opt_top The initial position in pixels from the top of
     *     the
     *     screen.
     * @param {number=} opt_width The initial width of the window.
     * @param {number=} opt_height The initial height of the window.
     */
    openTestWindow: function(opt_url, opt_left, opt_top,
                             opt_width, opt_height) {
      var options = [], labels = ['left', 'top', 'width', 'height'];
      for (var i = 1; i < 5; ++i) {
        if (goog.isNumber(arguments[i])) {
          options.push(labels[i - 1] + '=' + arguments[i]);
        }
      }
      testWindow = window.open(opt_url || '', TEST_WINDOW_NAME,
          options.join(','));
    },

    /** Closes the test window. */
    closeTestWindow: function() {
      if (testWindow && !testWindow.closed && testWindow.close) {
        testWindow.close();
        delete testWindow;
      }
    },

    /**
     * Switches to the main window (the window running this script).
     * @param {!webdriver.WebDriver} driver The driver to switch with.
     */
    switchToMainWindow: function(driver) {
      driver.switchTo().window(MAIN_WINDOW_NAME);
    },

    /**
     * Switches to the opened test window.
     * @param {!webdriver.WebDriver} driver The driver to switch with.
     */
    switchToTestWindow: function(driver) {
      if (!testWindow || testWindow.closed) {
        throw new Error('The test window is not open. Is the pop-up blocker enabled?');
      }
      driver.switchTo().window(TEST_WINDOW_NAME);
    }
  };
})();
