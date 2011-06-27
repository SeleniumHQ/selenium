/*
 Copyright 2011 WebDriver committers
 Copyright 2011 Google Inc.

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


goog.provide('webdriver.firefox.events');


goog.require('Logger');
goog.require('Utils');
goog.require('goog.style');
goog.require('webdriver.firefox.utils');


/**
 * @const
 */
var CI = Components.interfaces;


/**
 * Converts a parameters object to a coordinate, defaulting to the centre if
 * no x and y offset are specified.
 *
 * @param {object} parameters The parameters to extract the coordinates from.
 */
webdriver.firefox.events.buildCoordinates = function(parameters, doc) {
  Logger.dump(parameters);
  var element = parameters['element'] ? Utils.getElementAt(parameters['element'], doc) : null;

  var x = parameters['xoffset'] || null;
  var y = parameters['yoffset'] || null;

  var auxiliaryToReturn = null;
  if (element) {
    auxiliaryToReturn = new XPCNativeWrapper(element);
  }

  return {
    x: x,
    y: y,
    auxiliary: auxiliaryToReturn,

    QueryInterface: webdriver.firefox.utils.queryInterface(this,
      [CI.nsISupports, CI.wdICoordinate])
  };
};
