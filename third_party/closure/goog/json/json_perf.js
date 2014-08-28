// Copyright 2012 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview JSON performance tests.
 */

goog.provide('goog.jsonPerf');

goog.require('goog.dom');
goog.require('goog.json');
goog.require('goog.math');
goog.require('goog.string');
goog.require('goog.testing.PerformanceTable');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.jsonPerf');

var table = new goog.testing.PerformanceTable(
    goog.dom.getElement('perfTable'));

var stubs = new goog.testing.PropertyReplacer();

function tearDown() {
  stubs.reset();
}

function testSerialize() {
  var obj = populateObject({}, 50, 4);

  table.run(function() {
    var s = JSON.stringify(obj);
  }, 'Stringify using JSON.stringify');

  table.run(function() {
    var s = goog.json.serialize(obj);
  }, 'Stringify using goog.json.serialize');
}

function testParse() {
  var obj = populateObject({}, 50, 4);
  var s = JSON.stringify(obj);

  table.run(function() {
    var o = JSON.parse(s);
  }, 'Parse using JSON.parse');

  table.run(function() {
    var o = goog.json.parse(s);
  }, 'Parse using goog.json.parse');

  table.run(function() {
    var o = goog.json.unsafeParse(s);
  }, 'Parse using goog.json.unsafeParse');
}


/**
 * @param {!Object} obj The object to add properties to.
 * @param {number} numProperties The number of properties to add.
 * @param {number} depth The depth at which to recursively add properties.
 * @return {!Object} The object given in obj (for convenience).
 */
function populateObject(obj, numProperties, depth) {
  if (depth == 0) {
    return randomLiteral();
  }

  // Make an object with a mix of strings, numbers, arrays, objects, booleans
  // nulls as children.
  for (var i = 0; i < numProperties; i++) {
    var bucket = goog.math.randomInt(3);
    switch (bucket) {
      case 0:
        obj[i] = randomLiteral();
        break;
      case 1:
        obj[i] = populateObject({}, numProperties, depth - 1);
        break;
      case 2:
        obj[i] = populateObject([], numProperties, depth - 1);
        break;
    }
  }
  return obj;
}


function randomLiteral() {
  var bucket = goog.math.randomInt(3);
  switch (bucket) {
    case 0:
      return goog.string.getRandomString();
    case 1:
      return Math.random();
    case 2:
      return Math.random() >= .5;
  }
  return null;
}
