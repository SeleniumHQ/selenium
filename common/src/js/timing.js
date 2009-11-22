/** @license
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

/**
 * @fileoverview Defines a namespace that implements the global timing
 * functions: setTimeout, setInterval, clearTimeout, and clearInterval.
 * Internally, this namespaces uses protected references to the real global
 * functions so that users can override them without interfering with WebDriver
 * functionality.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.timing');

goog.require('goog.userAgent');


webdriver.timing.protectedSetTimeout_ = goog.global['setTimeout'];
webdriver.timing.protectedSetInterval_ = goog.global['setInterval'];
webdriver.timing.protectedClearTimeout_ = goog.global['clearTimeout'];
webdriver.timing.protectedClearInterval_ = goog.global['clearInterval'];


/**
 * Schedules a function to be executed after the given {@code delay}.
 * @param {function} fn The function to call after {@code delay} milliseconds.
 * @param {number} delay The number of milliseconds to delay executing the
 *     function by.
 * @return {number} The timeout ID that can be used with {@code #clearTimeout}
 *     to cancel executing {@code fn}.
 */
webdriver.timing.setTimeout = function(fn, delay) {
  return goog.userAgent.IE ?
         webdriver.timing.protectedSetTimeout_(fn, delay) :
         webdriver.timing.protectedSetTimeout_.call(null, fn, delay);
};


/**
 * Schedules a function to be executed every {@code interval} milliseconds.
 * @param {function} fn The function to call every {@code delay} milliseconds.
 * @param {number} interval The number of milliseconds to delay executing the
 *     function by.
 * @return {number} The interval ID that can be used with {@code #clearInterval}
 *     to cancel this interval.
 */
webdriver.timing.setInterval = function(fn, interval) {
  return goog.userAgent.IE ?
         webdriver.timing.protectedSetInterval_(fn, interval) :
         webdriver.timing.protectedSetInterval_.call(goog.global, fn, interval);
};


/**
 * Cancels a timeout scheduled with {@code #setTimeout()}.
 * @param {number} timeoutId ID of the timeout to cancel as returned by
 *     {@code #setTimeout}. Passing an invalid ID results in a no-op.
 */
webdriver.timing.clearTimeout = function(timeoutId) {
  return goog.userAgent.IE ?
         webdriver.timing.protectedClearTimeout_(timeoutId) :
         webdriver.timing.protectedClearTimeout_.call(goog.global, timeoutId);
};


/**
 * Cancels an interval scheduled with {@code #clearInterval()}.
 * @param {number} intervalId ID of the interval to cancel as returned by
 *     {@code #setInterval}. Passing an invalid ID results in a no-op.
 */
webdriver.timing.clearInterval = function(intervalId) {
  return goog.userAgent.IE ?
         webdriver.timing.protectedClearInterval_(timeoutId) :
         webdriver.timing.protectedClearInterval_.call(goog.global, intervalId);
};
