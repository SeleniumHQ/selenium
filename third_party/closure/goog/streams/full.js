// Copyright 2019 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A full ponyfill of the ReadableStream native API.
 */
goog.module('goog.streams.full');

const fullImpl = goog.require('goog.streams.fullImpl');
const fullNativeImpl = goog.require('goog.streams.fullNativeImpl');
const {ReadableStream, ReadableStreamAsyncIterator, ReadableStreamDefaultController, ReadableStreamDefaultReader, ReadableStreamStrategy, ReadableStreamUnderlyingSource} = goog.require('goog.streams.fullTypes');
const {USE_NATIVE_IMPLEMENTATION} = goog.require('goog.streams.defines');

/**
 * Creates and returns a new ReadableStream.
 *
 * The underlying source should only have a start() method, and no other
 * properties.
 * @param {!ReadableStreamUnderlyingSource<T>=} underlyingSource
 * @param {!ReadableStreamStrategy<T>=} strategy
 * @return {!ReadableStream<T>}
 * @suppress {strictMissingProperties}
 * @template T
 */
function newReadableStream(underlyingSource = {}, strategy = {}) {
  if (USE_NATIVE_IMPLEMENTATION === 'true' ||
      (USE_NATIVE_IMPLEMENTATION === 'detect' && goog.global.ReadableStream)) {
    return fullNativeImpl.newReadableStream(underlyingSource, strategy);
  } else {
    return fullImpl.newReadableStream(underlyingSource, strategy);
  }
}

exports = {
  ReadableStream,
  ReadableStreamAsyncIterator,
  ReadableStreamDefaultController,
  ReadableStreamDefaultReader,
  ReadableStreamStrategy,
  ReadableStreamUnderlyingSource,
  newReadableStream,
};
