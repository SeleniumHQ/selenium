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

goog.provide('fxdriver.events');

goog.require('Utils');
goog.require('fxdriver.moz');
goog.require('goog.style');


/**
 * Converts a parameters object to a coordinate, defaulting to the centre if
 * no x and y offset are specified.
 *
 * @param {object} parameters The parameters to extract the coordinates from.
 * @param {!Document} doc The document containing the reference element, if any.
 * @return {{x: number, y: number, auxiliary: Element,
 *           QueryInterface: !Function}} The event coordinates.
 */
fxdriver.events.buildCoordinates = function(parameters, doc) {
  var element = parameters['element'] ? Utils.getElementAt(parameters['element'], doc) : null;

  var x = ('xoffset' in parameters ) ? parameters['xoffset'] : null;
  var y = ('yoffset' in parameters ) ? parameters['yoffset'] : null;

  // An element was specified, but not an offset within the element.
  // In this case, the default behaivour is to use the middle of the
  // element as the coordinates.

  if (goog.isNull(x) && element) {
    var size = goog.style.getSize(element);
    x = size.width / 2;
    y = size.height / 2;
  }

  return {
    x: x,
    y: y,
    auxiliary: element,

    QueryInterface: fxdriver.moz.queryInterface(this,
      [CI.nsISupports, CI.wdICoordinate])
  };
};
