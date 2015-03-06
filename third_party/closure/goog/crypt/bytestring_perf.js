// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Performance test for different implementations of
 * byteArrayToString.
 */


goog.provide('goog.crypt.byteArrayToStringPerf');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.testing.PerformanceTable');

goog.setTestOnly('goog.crypt.byteArrayToStringPerf');


var table = new goog.testing.PerformanceTable(
    goog.dom.getElement('perfTable'));


var BYTES_LENGTH = Math.pow(2, 20);
var CHUNK_SIZE = 8192;

function getBytes() {
  var bytes = [];
  for (var i = 0; i < BYTES_LENGTH; i++) {
    bytes.push('A'.charCodeAt(0));
  }
  return bytes;
}

function copyAndSpliceByteArray(bytes) {

  // Copy the passed byte array since we're going to destroy it.
  var remainingBytes = goog.array.clone(bytes);
  var strings = [];

  // Convert each chunk to a string.
  while (remainingBytes.length) {
    var chunk = goog.array.splice(remainingBytes, 0, CHUNK_SIZE);
    strings.push(String.fromCharCode.apply(null, chunk));
  }
  return strings.join('');
}

function sliceByteArrayConcat(bytes) {
  var str = '';
  for (var i = 0; i < bytes.length; i += CHUNK_SIZE) {
    var chunk = goog.array.slice(bytes, i, i + CHUNK_SIZE);
    str += String.fromCharCode.apply(null, chunk);
  }
  return str;
}


function sliceByteArrayJoin(bytes) {
  var strings = [];
  for (var i = 0; i < bytes.length; i += CHUNK_SIZE) {
    var chunk = goog.array.slice(bytes, i, i + CHUNK_SIZE);
    strings.push(String.fromCharCode.apply(null, chunk));
  }
  return strings.join('');
}

function mapByteArray(bytes) {
  var strings = goog.array.map(bytes, String.fromCharCode);
  return strings.join('');
}

function forLoopByteArrayConcat(bytes) {
  var str = '';
  for (var i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return str;
}

function forLoopByteArrayJoin(bytes) {
  var strs = [];
  for (var i = 0; i < bytes.length; i++) {
    strs.push(String.fromCharCode(bytes[i]));
  }
  return strs.join('');
}


function run() {
  var bytes = getBytes();
  table.run(goog.partial(copyAndSpliceByteArray, getBytes()),
            'Copy array and splice out chunks.');

  table.run(goog.partial(sliceByteArrayConcat, getBytes()),
            'Slice out copies of the byte array, concatenating results');

  table.run(goog.partial(sliceByteArrayJoin, getBytes()),
            'Slice out copies of the byte array, joining results');

  table.run(goog.partial(forLoopByteArrayConcat, getBytes()),
            'Use for loop with concat.');

  table.run(goog.partial(forLoopByteArrayJoin, getBytes()),
            'Use for loop with join.');

  // Purposefully commented out. This ends up being tremendously expensive.
  // table.run(goog.partial(mapByteArray, getBytes()),
  //           'Use goog.array.map and fromCharCode.');

}

run();

