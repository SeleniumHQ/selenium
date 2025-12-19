// Copyright 2016 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Contains the tag blacklist for use in the Html sanitizer.
 */

goog.provide('goog.html.sanitizer.TagBlacklist');


/**
 * A list of tags which should be removed entirely from the DOM, rather than
 * merely being made inert. In that sense, this is not a "true" blacklist
 * because removing a tag here without adding it to the whitelist does not have
 * security implications. Tag names must be in all caps. Note that even if
 * TEMPLATE is removed from this blacklist (or even whitelisted) it will
 * continue to be removed from the HTML, as TEMPLATE is used interally to
 * denote nodes which should not be added to the sanitized HTML.
 * @const @dict {boolean}
 */
goog.html.sanitizer.TagBlacklist = {
  'APPLET': true,
  'AUDIO': true,
  'BASE': true,
  'BGSOUND': true,
  'EMBED': true,
  // Blacklisted by default, can be allowed using allowFormTag.
  'FORM': true,
  // NOTE: can remove this for old browser behavior
  'IFRAME': true,
  // Can result in network requests
  'ISINDEX': true,
  // Unused and just unnecessarily increase attack surface
  'KEYGEN': true,
  'LAYER': true,
  'LINK': true,
  'META': true,
  'OBJECT': true,
  'SCRIPT': true,
  // Can result in an XSS in FF
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1205631
  'SVG': true,
  // Blacklisted by default, can be allowed using allowStyleTag.
  'STYLE': true,
  // Unsafe in most cases, and sanitizing its contents is not supported by the
  // underlying SafeDomTreeProcessor.
  'TEMPLATE': true,
  'VIDEO': true
};
