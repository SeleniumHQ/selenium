/** @license
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

goog.provide('webdriver.Key');

goog.require('goog.array');


/**
 * Representations of pressable keys that aren't text.  These are stored in
 * the Unicode PUA (Private Use Area) code points, 0xE000-0xF8FF.  Refer to
 * http://www.google.com.au/search?&q=unicode+pua&btnG=Search
 * @enum {string}
 */
webdriver.Key = {
  NULL:         '\uE000',
  CANCEL:       '\uE001',  // ^break
  HELP:         '\uE002',
  BACK_SPACE:   '\uE003',
  TAB:          '\uE004',
  CLEAR:        '\uE005',
  RETURN:       '\uE006',
  ENTER:        '\uE007',
  SHIFT:        '\uE008',
  LEFT_SHIFT:   '\uE008', // alias
  CONTROL:      '\uE009',
  LEFT_CONTROL: '\uE009', // alias
  ALT:          '\uE00A',
  LEFT_ALT:     '\uE00A', // alias
  PAUSE:        '\uE00B',
  ESCAPE:       '\uE00C',
  SPACE:        '\uE00D',
  PAGE_UP:      '\uE00E',
  PAGE_DOWN:    '\uE00F',
  END:          '\uE010',
  HOME:         '\uE011',
  LEFT:         '\uE012',
  ARROW_LEFT:   '\uE012', // alias
  UP:           '\uE013',
  ARROW_UP:     '\uE013', // alias
  RIGHT:        '\uE014',
  ARROW_RIGHT:  '\uE014', // alias
  DOWN:         '\uE015',
  ARROW_DOWN:   '\uE015', // alias
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
* Keys.XXXX or strings; appends each of the values to a string, and adds the
* chord termination key (Keys.NULL) and returns the resultant string.
*
* Note: when the low-level webdriver key handlers see Keys.NULL, active
* modifier keys (CTRL/ALT/SHIFT/etc) release via a keyup event.
*
* @param {string|webdriver.Key} var_args The key sequence to concatenate.
* @see http://code.google.com/p/webdriver/issues/detail?id=79
*/
webdriver.Key.chord = function(var_args) {
  var sequence = goog.array.reduce(
      goog.array.slice(arguments, 0),
      function(str, key) {
        return str + key;
      }, '');
  sequence += webdriver.Key.NULL;
  return sequence;
};
