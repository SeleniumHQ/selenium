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


const SERIALIZABLE = Symbol('serializable');


/**
 * Defines an object that can be asynchronously serialized to its WebDriver
 * wire representation.
 *
 * @template T
 * @interface
 */
class Serializable {

  /**
   * Returns either this instance's serialized represention, if immediately
   * available, or a promise for its serialized representation. This function is
   * conceptually equivalent to objects that have a {@code toJSON()} property,
   * except the serialize() result may be a promise or an object containing a
   * promise (which are not directly JSON friendly).
   *
   * @return {!(T|IThenable<!T>)} This instance's serialized wire format.
   */
  serialize() {}
}


/**
 * Marks a constructor as implementing the serializable interface.
 *
 * @param {function(new: ?)} ctor The constructor to update.
 * @throws {TypeError} If the given value is not a constructor, or the
 *     constructor's prototype does not define a `serialize()` method.
 */
function setSerializable(ctor) {
  if (!ctor || typeof ctor !== 'function') {
    throw new TypeError('Input is not a constructor!');
  }
  if (typeof ctor.prototype.serialize !== 'function') {
    throw new TypeError('Class does not define a "serialize" function');
  }
  ctor.prototype[SERIALIZABLE] = true;
}


  /**
   * Checks if an object is marked as implementing the {@linkplain Serializable}
   * interface.
   *
   * @param {*} obj The object to test.
   * @return {boolean} Whether the given object implements the serializable
   *     interface.
   * @see setSerializable
   */
function isSerializable(obj) {
  try {
    return obj && !!obj[SERIALIZABLE];
  } catch (ignored) {
    return false;
  }
}


// PUBLIC API


exports.Serializable = Serializable;
exports.setSerializable = setSerializable;
exports.isSerializable = isSerializable;
