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
 * @fileoverview A test file for testing goog.module.
 */

goog.module('goog.test_module');
goog.setTestOnly('goog.test_module');
goog.module.declareLegacyNamespace();


/** @suppress {extraRequire} */
var dep = goog.require('goog.test_module_dep');



/** @constructor */
exports = function() {};

