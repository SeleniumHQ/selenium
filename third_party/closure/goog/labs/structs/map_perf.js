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
 * @fileoverview Performance test for goog.structs.Map and
 * goog.labs.structs.Map. To run this test fairly, you would have to
 * compile this via JsCompiler (with --export_test_functions), and
 * pull the compiled JS into an empty HTML file.
 */

goog.provide('goog.labs.structs.mapPerf');

goog.require('goog.dom');
goog.require('goog.labs.structs.Map');
goog.require('goog.structs.Map');
goog.require('goog.testing.PerformanceTable');
goog.require('goog.testing.jsunit');

goog.scope(function() {
var mapPerf = goog.labs.structs.mapPerf;


/**
 * @typedef {goog.labs.structs.Map|goog.structs.Map}
 */
mapPerf.MapType;


/**
 * @type {goog.testing.PerformanceTable}
 */
mapPerf.perfTable;


/**
 * A key list. This maps loop index to key name to be used during
 * benchmark. This ensure that we do not need to pay the cost of
 * string concatenation/GC whenever we derive a key from loop index.
 *
 * This is filled once in setUpPage and then remain unchanged for the
 * rest of the test case.
 *
 * @type {Array}
 */
mapPerf.keyList = [];


/**
 * Maxium number of keys in keyList (and, by extension, the map under
 * test).
 * @type {number}
 */
mapPerf.MAX_NUM_KEY = 10000;


/**
 * Fills the given map with generated key-value pair.
 * @param {mapPerf.MapType} map The map to fill.
 * @param {number} numKeys The number of key-value pair to fill.
 */
mapPerf.fillMap = function(map, numKeys) {
  goog.asserts.assert(numKeys <= mapPerf.MAX_NUM_KEY);

  for (var i = 0; i < numKeys; ++i) {
    map.set(mapPerf.keyList[i], i);
  }
};


/**
 * Primes the given map with deletion of keys.
 * @param {mapPerf.MapType} map The map to prime.
 * @return {mapPerf.MapType} The primed map (for chaining).
 */
mapPerf.primeMapWithDeletion = function(map) {
  for (var i = 0; i < 1000; ++i) {
    map.set(mapPerf.keyList[i], i);
  }
  for (var i = 0; i < 1000; ++i) {
    map.remove(mapPerf.keyList[i]);
  }
  return map;
};


/**
 * Runs performance test for Map#get with the given map.
 * @param {mapPerf.MapType} map The map to stress.
 * @param {string} message Message to be put in performance table.
 */
mapPerf.runPerformanceTestForMapGet = function(map, message) {
  mapPerf.fillMap(map, 10000);

  mapPerf.perfTable.run(
      function() {
        // Creates local alias for map and keyList.
        var localMap = map;
        var localKeyList = mapPerf.keyList;

        for (var i = 0; i < 500; ++i) {
          var sum = 0;
          for (var j = 0; j < 10000; ++j) {
            sum += localMap.get(localKeyList[j]);
          }
        }
      },
      message);
};


/**
 * Runs performance test for Map#set with the given map.
 * @param {mapPerf.MapType} map The map to stress.
 * @param {string} message Message to be put in performance table.
 */
mapPerf.runPerformanceTestForMapSet = function(map, message) {
  mapPerf.perfTable.run(
      function() {
        // Creates local alias for map and keyList.
        var localMap = map;
        var localKeyList = mapPerf.keyList;

        for (var i = 0; i < 500; ++i) {
          for (var j = 0; j < 10000; ++j) {
            localMap.set(localKeyList[i], i);
          }
        }
      },
      message);
};


goog.global['setUpPage'] = function() {
  var content = goog.dom.createDom('div');
  goog.dom.insertChildAt(document.body, content, 0);
  var ua = navigator.userAgent;
  content.innerHTML =
      '<h1>Closure Performance Tests - Map</h1>' +
      '<p><strong>User-agent: </strong><span id="ua">' + ua + '</span></p>' +
      '<div id="perf-table"></div>' +
      '<hr>';

  mapPerf.perfTable = new goog.testing.PerformanceTable(
      goog.dom.getElement('perf-table'));

  // Fills keyList.
  for (var i = 0; i < mapPerf.MAX_NUM_KEY; ++i) {
    mapPerf.keyList.push('k' + i);
  }
};


goog.global['testGetFromLabsMap'] = function() {
  mapPerf.runPerformanceTestForMapGet(
      new goog.labs.structs.Map(), '#get: no previous deletion (Labs)');
};


goog.global['testGetFromOriginalMap'] = function() {
  mapPerf.runPerformanceTestForMapGet(
      new goog.structs.Map(), '#get: no previous deletion (Original)');
};


goog.global['testGetWithPreviousDeletionFromLabsMap'] = function() {
  mapPerf.runPerformanceTestForMapGet(
      mapPerf.primeMapWithDeletion(new goog.labs.structs.Map()),
      '#get: with previous deletion (Labs)');
};


goog.global['testGetWithPreviousDeletionFromOriginalMap'] = function() {
  mapPerf.runPerformanceTestForMapGet(
      mapPerf.primeMapWithDeletion(new goog.structs.Map()),
      '#get: with previous deletion (Original)');
};


goog.global['testSetFromLabsMap'] = function() {
  mapPerf.runPerformanceTestForMapSet(
      new goog.labs.structs.Map(), '#set: no previous deletion (Labs)');
};


goog.global['testSetFromOriginalMap'] = function() {
  mapPerf.runPerformanceTestForMapSet(
      new goog.structs.Map(), '#set: no previous deletion (Original)');
};

});  // goog.scope
