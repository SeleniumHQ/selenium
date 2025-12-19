// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Definition of MenuBarRenderer decorator, a static call into
 * the goog.ui.registry.
 *
 * @see ../demos/menubar.html
 */

goog.provide('goog.ui.menuBarDecorator');

goog.require('goog.ui.MenuBarRenderer');
goog.require('goog.ui.menuBar');
goog.require('goog.ui.registry');


/**
 * Register a decorator factory function. 'goog-menubar' defaults to
 * goog.ui.MenuBarRenderer.
 */
goog.ui.registry.setDecoratorByClassName(
    goog.ui.MenuBarRenderer.CSS_CLASS, goog.ui.menuBar.create);
