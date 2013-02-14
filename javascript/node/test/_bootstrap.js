// Copyright 2013 Selenium committers
// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var path = require('path');

var projectRootDir = path.join(__dirname, '..', '..', '..');

var modulePath = path.join('javascript', 'node');
if (process.env['SELENIUM_DEV_MODE'] !== '1') {
  modulePath = path.join('build', modulePath);
}
modulePath = path.join(projectRootDir, modulePath);

/**
 * Updates the search path for the given module to load the selenium-webdriver
 * module based on the current environment. If running in dev mode, as
 * indicated by {@code process.env.SELENIUM_DEV_MODE === '1'},
 * selenium-webdriver will be loaded from the project's source directory.
 * Otherwise, it will be loaded from the build outputs directory.
 *
 * @param {!Module} module The module to update.
 */
exports.init = function(module) {
  module.paths.unshift(modulePath);
};
