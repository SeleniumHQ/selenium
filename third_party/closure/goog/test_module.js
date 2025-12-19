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
 * @suppress {unusedLocalVariables}
 */

goog.module('goog.test_module');
goog.module.declareLegacyNamespace();
goog.setTestOnly('goog.test_module');


/** @suppress {extraRequire} */
var testModuleDep = goog.require('goog.test_module_dep');

// Verify that when this module loads the script tag in the next
// line doesn't cause the script tag it is loaded in to be closed
// prematurely.
var aScriptTagShouldntBreakAnything = '<script>hello</script>world';



/** @constructor */
var test = function() {};

// Verify that when this module loads the script tag is not modified by
// escaping code in base.js.
test.CLOSING_SCRIPT_TAG = '</script>';

exports = test;
