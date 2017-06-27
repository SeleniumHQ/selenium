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
 * @author chrishenry@google.com (Chris Henry)
 */

goog.provide('goog.labs.structs.MapPerf');
goog.setTestOnly('goog.labs.structs.MapPerf');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.labs.structs.Map');
goog.require('goog.structs.Map');
goog.require('goog.testing.PerformanceTable');
goog.require('goog.testing.jsunit');

goog.scope(function() {
var MapPerf = goog.labs.structs.MapPerf;


/**
 * @typedef {goog.labs.structs.Map|goog.structs.Map}
 */
MapPerf.MapType;


/**
 * @type {goog.testing.PerformanceTable}
 */
MapPerf.perfTable;


/**
 * A key list. This maps loop index to key name to be used during
 * benchmark. This ensure that we do not need to pay the cost of
 * string concatenation/GC whenever we derive a key from loop index.
 *
 * This is filled once in setUpPage and then remain unchanged for the
 * rest of the test case.
 *
 * @type {!Array<string>}
 */
MapPerf.keyList = [];


/**
 * Maxium number of keys in keyList (and, by extension, the map under
 * test).
 * @type {number}
 */
MapPerf.MAX_NUM_KEY = 10000;


/**
 * Fills the given map with generated key-value pair.
 * @param {MapPerf.MapType} map The map to fill.
 * @param {number} numKeys The number of key-value pair to fill.
 */
MapPerf.fillMap = function(map, numKeys) {
  goog.asserts.assert(numKeys <= MapPerf.MAX_NUM_KEY);

  for (var i = 0; i < numKeys; ++i) {
    map.set(MapPerf.keyList[i], i);
  }
};


/**
 * Primes the given map with deletion of keys.
 * @param {MapPerf.MapType} map The map to prime.
 * @return {MapPerf.MapType} The primed map (for chaining).
 */
MapPerf.primeMapWithDeletion = function(map) {
  for (var i = 0; i < 1000; ++i) {
    map.set(MapPerf.keyList[i], i);
  }
  for (var i = 0; i < 1000; ++i) {
    map.remove(MapPerf.keyList[i]);
  }
  return map;
};


/**
 * Runs performance test for Map#get with the given map.
 * @param {MapPerf.MapType} map The map to stress.
 * @param {string} message Message to be put in performance table.
 */
MapPerf.runPerformanceTestForMapGet = function(map, message) {
  MapPerf.fillMap(map, 10000);

  MapPerf.perfTable.run(function() {
    // Creates local alias for map and keyList.
    var localMap = map;
    var localKeyList = MapPerf.keyList;

    for (var i = 0; i < 500; ++i) {
      var sum = 0;
      for (var j = 0; j < 10000; ++j) {
        sum += localMap.get(localKeyList[j]);
      }
    }
  }, message);
};


/**
 * Runs performance test for Map#set with the given map.
 * @param {MapPerf.MapType} map The map to stress.
 * @param {string} message Message to be put in performance table.
 */
MapPerf.runPerformanceTestForMapSet = function(map, message) {
  MapPerf.perfTable.run(function() {
    // Creates local alias for map and keyList.
    var localMap = map;
    var localKeyList = MapPerf.keyList;

    for (var i = 0; i < 500; ++i) {
      for (var j = 0; j < 10000; ++j) {
        localMap.set(localKeyList[i], i);
      }
    }
  }, message);
};


goog.global['setUpPage'] = function() {
  var content = goog.dom.createDom(goog.dom.TagName.DIV);
  goog.dom.insertChildAt(document.body, content, 0);
  goog.dom.append(
      content,
      goog.dom.createDom(
          goog.dom.TagName.H1, null, 'Closure Performance Tests - Map'),
      goog.dom.createDom(
          goog.dom.TagName.P, null,
          goog.dom.createDom(goog.dom.TagName.STRONG, null, 'User-agent: '),
          goog.dom.createDom(
              goog.dom.TagName.SPAN, {'id': 'ua'}, navigator.userAgent)),
      goog.dom.createDom(goog.dom.TagName.DIV, {'id': 'perf-table'}),
      goog.dom.createDom(goog.dom.TagName.HR));

  MapPerf.perfTable =
      new goog.testing.PerformanceTable(goog.dom.getElement('perf-table'));

  // Fills keyList.
  for (var i = 0; i < MapPerf.MAX_NUM_KEY; ++i) {
    MapPerf.keyList.push('k' + i);
  }
};


goog.global['testGetFromLabsMap'] = function() {
  MapPerf.runPerformanceTestForMapGet(
      new goog.labs.structs.Map(), '#get: no previous deletion (Labs)');
};


goog.global['testGetFromOriginalMap'] = function() {
  MapPerf.runPerformanceTestForMapGet(
      new goog.structs.Map(), '#get: no previous deletion (Original)');
};


goog.global['testGetWithPreviousDeletionFromLabsMap'] = function() {
  MapPerf.runPerformanceTestForMapGet(
      MapPerf.primeMapWithDeletion(new goog.labs.structs.Map()),
      '#get: with previous deletion (Labs)');
};


goog.global['testGetWithPreviousDeletionFromOriginalMap'] = function() {
  MapPerf.runPerformanceTestForMapGet(
      MapPerf.primeMapWithDeletion(new goog.structs.Map()),
      '#get: with previous deletion (Original)');
};


goog.global['testSetFromLabsMap'] = function() {
  MapPerf.runPerformanceTestForMapSet(
      new goog.labs.structs.Map(), '#set: no previous deletion (Labs)');
};


goog.global['testSetFromOriginalMap'] = function() {
  MapPerf.runPerformanceTestForMapSet(
      new goog.structs.Map(), '#set: no previous deletion (Original)');
};

});  // goog.scope
