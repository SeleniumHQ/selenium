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
 * @fileoverview SafeHtml factory methods for creating object tags for
 * loading Silverlight files.
 */

goog.provide('goog.html.silverlight');

goog.require('goog.html.SafeHtml');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.html.flash');
goog.require('goog.string.Const');


/**
 * Attributes and param tag name attributes not allowed to be overriden
 * when calling createObjectForSilverlight().
 *
 * While values that should be specified as params are probably not
 * recognized as attributes, we block them anyway just to be sure.
 * @const {!Array<string>}
 * @private
 */
goog.html.silverlight.FORBIDDEN_ATTRS_AND_PARAMS_ON_SILVERLIGHT_ = [
  'data',          // Always set to a fixed value.
  'source',        // Specifies the URL for the Silverlight file.
  'type',          // Always set to a fixed value.
  'typemustmatch'  // Always set to a fixed value.
];


/**
 * Creates a SafeHtml representing an object tag, for loading Silverlight files.
 *
 * The following attributes are set to these fixed values:
 * - data: data:application/x-silverlight-2,
 * - type: application/x-silverlight-2
 * - typemustmatch: "" (the empty string, meaning true for a boolean attribute)
 *
 * @param {!goog.html.TrustedResourceUrl} source The value of the source param.
 * @param {?Object<string, string>=} opt_params Mapping used to generate child
 *     param tags. Each tag has a name and value attribute, as defined in
 *     mapping. Only names consisting of [a-zA-Z0-9-] are allowed. Value of
 *     null or undefined causes the param tag to be omitted.
 * @param {?Object<string, ?goog.html.SafeHtml.AttributeValue>=} opt_attributes
 *     Mapping from other attribute names to their values. Only attribute names
 *     consisting of [a-zA-Z0-9-] are allowed. Value of null or undefined causes
 *     the attribute to be omitted.
 * @return {!goog.html.SafeHtml} The SafeHtml content with the object tag.
 * @throws {Error} If invalid attribute or param name, or attribute or param
 *     value is provided. Also if opt_attributes or opt_params contains any of
 *     the attributes set to fixed values, documented above, or contains source.
 *
 */
goog.html.silverlight.createObject = function(
    source, opt_params, opt_attributes) {
  goog.html.flash.verifyKeysNotInMaps(
      goog.html.silverlight.FORBIDDEN_ATTRS_AND_PARAMS_ON_SILVERLIGHT_,
      opt_attributes, opt_params);

  // We don't set default for Silverlight's EnableHtmlAccess and
  // AllowHtmlPopupwindow because their default changes depending on whether
  // a file loaded from the same domain.
  var paramTags = goog.html.flash.combineParams({'source': source}, opt_params);
  var fixedAttributes = {
    'data': goog.html.TrustedResourceUrl.fromConstant(
        goog.string.Const.from('data:application/x-silverlight-2,')),
    'type': 'application/x-silverlight-2',
    'typemustmatch': ''
  };
  var attributes =
      goog.html.SafeHtml.combineAttributes(fixedAttributes, {}, opt_attributes);

  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      'object', attributes, paramTags);
};
