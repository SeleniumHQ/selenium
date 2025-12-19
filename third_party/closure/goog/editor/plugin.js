// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
// All Rights Reserved.

/**
 * @fileoverview Aliases `goog.editor.PluginImpl`.
 *
 * This is done to create a target for `goog.editor.PluginImpl` that also pulls
 * in `goog.editor.Field` without creating a cycle. Doing so allows downstream
 * targets to depend only on `goog.editor.Plugin` without js_library complaining
 * about unfullfilled forward declarations.
 */

goog.provide('goog.editor.Plugin');

/** @suppress {extraRequire} This is the whole point. */
goog.require('goog.editor.Field');
goog.require('goog.editor.PluginImpl');

/**
 * @constructor
 * @extends {goog.editor.PluginImpl}
 */
goog.editor.Plugin = goog.editor.PluginImpl;
