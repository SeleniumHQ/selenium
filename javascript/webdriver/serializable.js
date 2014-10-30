// Copyright 2014 Selenium comitters
// Copyright 2014 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('webdriver.Serializable');



/**
 * Defines an object that can be asynchronously serialized to its WebDriver
 * wire representation.
 *
 * @constructor
 * @template T
 */
webdriver.Serializable = function() {};


/**
 * Returns either this instance's serialized represention, if immediately
 * available, or a promise for its serialized representation. This function is
 * conceptually equivalent to objects that have a {@code toJSON()} property,
 * except the serialize() result may be a promise or an object containing a
 * promise (which are not directly JSON friendly).
 *
 * @return {!(T|IThenable.<!T>)} This instance's serialized wire format.
 */
webdriver.Serializable.prototype.serialize = goog.abstractMethod;
