// Copyright 2017 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.dom.HtmlElement');



/**
 * This subclass of HTMLElement is used when only a HTMLElement is possible and
 * not any of its subclasses. Normally, a type can refer to an instance of
 * itself or an instance of any subtype. More concretely, if HTMLElement is used
 * then the compiler must assume that it might still be e.g. HTMLScriptElement.
 * With this, the type check knows that it couldn't be any special element.
 *
 * @constructor
 * @extends {HTMLElement}
 */
goog.dom.HtmlElement = function() {};
