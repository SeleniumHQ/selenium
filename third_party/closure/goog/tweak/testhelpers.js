// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Common test functions for tweak unit tests.
 *
 * @author agrieve@google.com (Andrew Grieve)
 */

goog.provide('goog.tweak.testhelpers');

goog.require('goog.tweak');
goog.require('goog.tweak.BooleanGroup');
goog.require('goog.tweak.BooleanInGroupSetting');
goog.require('goog.tweak.BooleanSetting');
goog.require('goog.tweak.ButtonAction');
goog.require('goog.tweak.NumericSetting');
goog.require('goog.tweak.Registry');
goog.require('goog.tweak.StringSetting');


var boolEntry;
var boolEntry2;
var strEntry;
var strEntry2;
var strEnumEntry;
var numEntry;
var numEnumEntry;
var boolGroup;
var boolOneEntry;
var boolTwoEntry;
var buttonEntry;


/**
 * Creates a registry with some entries in it.
 * @param {string} queryParams The query parameter string to use for the
 *     registry.
 * @param {!Object.<string|number|boolean>=} opt_compilerOverrides Compiler
 *     overrides.
 */
function createRegistryEntries(queryParams, opt_compilerOverrides) {
  // Initialize the registry with the given query string.
  var registry =
      new goog.tweak.Registry(queryParams, opt_compilerOverrides || {});
  goog.tweak.registry_ = registry;

  boolEntry = new goog.tweak.BooleanSetting('Bool', 'The bool1');
  registry.register(boolEntry);

  boolEntry2 = new goog.tweak.BooleanSetting('Bool2', 'The bool2');
  boolEntry2.setDefaultValue(true);
  registry.register(boolEntry2);

  strEntry = new goog.tweak.StringSetting('Str', 'The str1');
  strEntry.setParamName('s');
  registry.register(strEntry);

  strEntry2 = new goog.tweak.StringSetting('Str2', 'The str2');
  strEntry2.setDefaultValue('foo');
  registry.register(strEntry2);

  strEnumEntry = new goog.tweak.StringSetting('Enum', 'The enum');
  strEnumEntry.setValidValues(['A', 'B', 'C']);
  strEnumEntry.setRestartRequired(false);
  registry.register(strEnumEntry);

  numEntry = new goog.tweak.NumericSetting('Num', 'The num');
  numEntry.setDefaultValue(99);
  registry.register(numEntry);

  numEnumEntry = new goog.tweak.NumericSetting('Enum2', 'The 2nd enum');
  numEnumEntry.setValidValues([1, 2, 3]);
  numEnumEntry.setRestartRequired(false);
  numEnumEntry.label = 'Enum the second&';
  registry.register(numEnumEntry);

  boolGroup = new goog.tweak.BooleanGroup('BoolGroup', 'The bool group');
  registry.register(boolGroup);

  boolOneEntry = new goog.tweak.BooleanInGroupSetting('BoolOne', 'Desc for 1',
      boolGroup);
  boolOneEntry.setToken('B1');
  boolOneEntry.setRestartRequired(false);
  boolGroup.addChild(boolOneEntry);
  registry.register(boolOneEntry);

  boolTwoEntry = new goog.tweak.BooleanInGroupSetting('BoolTwo', 'Desc for 2',
      boolGroup);
  boolTwoEntry.setDefaultValue(true);
  boolGroup.addChild(boolTwoEntry);
  registry.register(boolTwoEntry);

  buttonEntry = new goog.tweak.ButtonAction('Button', 'The Btn',
      goog.nullFunction);
  buttonEntry.label = '<btn>';
  registry.register(buttonEntry);

  var nsBoolGroup = new goog.tweak.BooleanGroup('foo.bar.BoolGroup',
      'Namespaced Bool Group');
  registry.register(nsBoolGroup);
  var nsBool = new goog.tweak.BooleanInGroupSetting('foo.bar.BoolOne',
      'Desc for Namespaced 1', nsBoolGroup);
  nsBoolGroup.addChild(nsBool);
  registry.register(nsBool);
}


