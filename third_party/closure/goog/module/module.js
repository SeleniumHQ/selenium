// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 *
 * @fileoverview This class supports the dynamic loading of compiled
 * javascript modules at runtime, as descibed in the designdoc.
 *
 *   <http://go/js_modules_design>
 *
 */

goog.provide('goog.module');

// TODO(johnlenz): Here we explicitly initialize the namespace to avoid
// problems with the goog.module method in base.js.  Once the goog.module has
// landed and compiler updated and released and everyone is on that release
// we can remove this file.
//
// Alternately, we can move everthing out of the goog.module namespace.
//
goog.module = goog.module || {};
