/*
 Copyright 2012 Software Freedom Conservancy

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

goog.provide('fxdriver.prefs');

/**
 * The preference store.
 *
 * @private
 * @type {!nsIPrefBranch}
 */
fxdriver.prefs.PREFS_ = Components.classes['@mozilla.org/preferences-service;1']
    .getService(Components.interfaces['nsIPrefBranch']);

/**
 * Gets a stored character preference with the given name.
 * If no value is stored the given default value is returned.
 *
 * @param {string} name The name of the preference.
 * @param {string} defaultValue The default value to use.
 * @return {string} The preference value or the default value.
 */
fxdriver.prefs.getCharPref = function(name, defaultValue) {
  var value = fxdriver.prefs.PREFS_.prefHasUserValue(name) &&
      fxdriver.prefs.PREFS_.getCharPref(name);
  if (!value) {
    value = defaultValue;
  }
  return value;
};

/**
 * Stores the given character value for the given preference name.
 *
 * @param {string} name The preference name.
 * @param {string} value The value to store.
 */
fxdriver.prefs.setCharPref = function(name, value) {
  fxdriver.prefs.PREFS_.setCharPref(name, value);
};

/**
 * Gets a stored boolean preference with the given name.
 * If no value is stored the given default value is returned.
 *
 * @param {string} name The name of the preference.
 * @param {boolean} defaultValue The default value to use.
 * @return {boolean} The preference value or the default value.
 */
fxdriver.prefs.getBoolPref = function(name, defaultValue) {
  var value = fxdriver.prefs.PREFS_.prefHasUserValue(name) &&
      fxdriver.prefs.PREFS_.getBoolPref(name);
  if (!value) {
    value = defaultValue;
  }
  return value;
};

/**
 * Stores the given boolean value for the given preference name.
 *
 * @param {string} name The preference name.
 * @param {string} value The value to store.
 */
fxdriver.prefs.setBoolPref = function(name, value) {
  fxdriver.prefs.PREFS_.setBoolPref(name, value);
};

