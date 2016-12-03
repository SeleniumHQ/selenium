// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

'use strict';

/**
 * @fileoverview Defines types related to user input with the WebDriver API.
 */


/**
 * Enumeration of the buttons used in the advanced interactions API.
 * @enum {number}
 */
const Button = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
};



/**
 * Representations of pressable keys that aren't text.  These are stored in
 * the Unicode PUA (Private Use Area) code points, 0xE000-0xF8FF.  Refer to
 * http://www.google.com.au/search?&q=unicode+pua&btnG=Search
 *
 * @enum {string}
 */
const Key = {
  NULL:         '\uE000',
  CANCEL:       '\uE001',  // ^break
  HELP:         '\uE002',
  BACK_SPACE:   '\uE003',
  TAB:          '\uE004',
  CLEAR:        '\uE005',
  RETURN:       '\uE006',
  ENTER:        '\uE007',
  SHIFT:        '\uE008',
  CONTROL:      '\uE009',
  ALT:          '\uE00A',
  PAUSE:        '\uE00B',
  ESCAPE:       '\uE00C',
  SPACE:        '\uE00D',
  PAGE_UP:      '\uE00E',
  PAGE_DOWN:    '\uE00F',
  END:          '\uE010',
  HOME:         '\uE011',
  ARROW_LEFT:   '\uE012',
  LEFT:         '\uE012',
  ARROW_UP:     '\uE013',
  UP:           '\uE013',
  ARROW_RIGHT:  '\uE014',
  RIGHT:        '\uE014',
  ARROW_DOWN:   '\uE015',
  DOWN:         '\uE015',
  INSERT:       '\uE016',
  DELETE:       '\uE017',
  SEMICOLON:    '\uE018',
  EQUALS:       '\uE019',

  NUMPAD0:      '\uE01A',  // number pad keys
  NUMPAD1:      '\uE01B',
  NUMPAD2:      '\uE01C',
  NUMPAD3:      '\uE01D',
  NUMPAD4:      '\uE01E',
  NUMPAD5:      '\uE01F',
  NUMPAD6:      '\uE020',
  NUMPAD7:      '\uE021',
  NUMPAD8:      '\uE022',
  NUMPAD9:      '\uE023',
  MULTIPLY:     '\uE024',
  ADD:          '\uE025',
  SEPARATOR:    '\uE026',
  SUBTRACT:     '\uE027',
  DECIMAL:      '\uE028',
  DIVIDE:       '\uE029',

  F1:           '\uE031',  // function keys
  F2:           '\uE032',
  F3:           '\uE033',
  F4:           '\uE034',
  F5:           '\uE035',
  F6:           '\uE036',
  F7:           '\uE037',
  F8:           '\uE038',
  F9:           '\uE039',
  F10:          '\uE03A',
  F11:          '\uE03B',
  F12:          '\uE03C',

  COMMAND:      '\uE03D',  // Apple command key
  META:         '\uE03D'   // alias for Windows key
};


/**
 * Simulate pressing many keys at once in a "chord". Takes a sequence of
 * {@linkplain Key keys} or strings, appends each of the values to a string,
 * adds the chord termination key ({@link Key.NULL}) and returns the resulting
 * string.
 *
 * Note: when the low-level webdriver key handlers see Keys.NULL, active
 * modifier keys (CTRL/ALT/SHIFT/etc) release via a keyup event.
 *
 * @param {...string} var_args The key sequence to concatenate.
 * @return {string} The null-terminated key sequence.
 */
Key.chord = function(var_args) {
  return Array.prototype.slice.call(arguments, 0).join('') + Key.NULL;
};


/**
 * Used with {@link ./webelement.WebElement#sendKeys WebElement#sendKeys} on
 * file input elements (`<input type="file">`) to detect when the entered key
 * sequence defines the path to a file.
 *
 * By default, {@linkplain ./webelement.WebElement WebElement's} will enter all
 * key sequences exactly as entered. You may set a
 * {@linkplain ./webdriver.WebDriver#setFileDetector file detector} on the
 * parent WebDriver instance to define custom behavior for handling file
 * elements. Of particular note is the
 * {@link selenium-webdriver/remote.FileDetector}, which should be used when
 * running against a remote
 * [Selenium Server](http://docs.seleniumhq.org/download/).
 */
class FileDetector {

  /**
   * Handles the file specified by the given path, preparing it for use with
   * the current browser. If the path does not refer to a valid file, it will
   * be returned unchanged, otherwise a path suitable for use with the current
   * browser will be returned.
   *
   * This default implementation is a no-op. Subtypes may override this function
   * for custom tailored file handling.
   *
   * @param {!./webdriver.WebDriver} driver The driver for the current browser.
   * @param {string} path The path to process.
   * @return {!Promise<string>} A promise for the processed file path.
   * @package
   */
  handleFile(driver, path) {
    return Promise.resolve(path);
  }
}


// PUBLIC API


module.exports = {
  Button: Button,
  Key: Key,
  FileDetector: FileDetector
};
