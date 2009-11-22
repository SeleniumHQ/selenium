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
 * @fileoverview Provides factory methods for creating new instances of
 * {@code webdriver.WebDriver}.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.factory');

goog.require('goog.userAgent');
goog.require('webdriver.LocalCommandProcessor');
goog.require('webdriver.WebDriver');


/**
 * Creates a new {@code webdriver.WebDriver} instance that uses an
 * {@code webdriver.AbstractCommandProcessor}. This driver will only be able to
 * perform the most basic of commands: sleeping and calling user defined
 * functions.
 * @return {webdriver.WebDriver} A new WebDriver instance.
 */
webdriver.factory.createAbstractDriver = function() {
  return new webdriver.WebDriver(new webdriver.AbstractCommandProcessor());
};


/**
 * Creates a new {@code webdriver.WebDriver} instance that uses a
 * CommandProcessor directly accessible to the current JavaScript engine.
 * Currently, only Firefox is supported, but IE and Google Chrome support is
 * planned.
 * TODO(jmleyba): Add support for Internet Explorer and Goolge Chrome.
 * @return {webdriver.WebDriver} A new WebDriver instance.
 * @throws If called from a JavaScript engine that does not have support for a
 *     local CommandProcessor.
 */
webdriver.factory.createLocalWebDriver = function() {
  return new webdriver.WebDriver(new webdriver.LocalCommandProcessor());
};
