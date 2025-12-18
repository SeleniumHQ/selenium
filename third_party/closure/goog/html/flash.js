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
 * @fileoverview SafeHtml factory methods for creating object and embed tags
 * for loading Flash files.
 */

goog.provide('goog.html.flash');

goog.require('goog.asserts');
goog.require('goog.html.SafeHtml');


/**
 * Attributes and param tag name attributes not allowed to be overriden
 * when calling createObject() and createObjectForOldIe().
 *
 * While values that should be specified as params are probably not
 * recognized as attributes, we block them anyway just to be sure.
 * @const {!Array<string>}
 * @private
 */
goog.html.flash.FORBIDDEN_ATTRS_AND_PARAMS_ON_FLASH_ = [
  'classid',       // Used on old IE.
  'data',          // Used in <object> to specify a URL.
  'movie',         // Used on old IE.
  'type',          // Used in <object> on for non-IE/modern IE.
  'typemustmatch'  // Always set to a fixed value.
];


/**
 * Creates a SafeHtml representing an embed tag, for loading Flash files.
 *
 *
 * The following attributes are set to these fixed values:
 * - type: application/x-shockwave-flash
 * - pluginspage: https://www.macromedia.com/go/getflashplayer
 *
 * The following attributes are set to these default values (which are the most
 * restrictive possible but can be overriden):
 * - allowNetworking: none
 * - allowScriptAccess: never
 *
 * @param {!goog.html.TrustedResourceUrl} src The value of the src attribute.
 * @param {?Object<string, ?goog.html.SafeHtml.AttributeValue>=} opt_attributes
 *     Mapping from other attribute names to their values. Only attribute names
 *     consisting of [a-zA-Z0-9-] are allowed. Value of null or undefined causes
 *     the attribute to be omitted.
 * @return {!goog.html.SafeHtml} The SafeHtml content with the embed tag.
 * @throws {Error} If invalid attribute name or attribute value is
 *     provided. Also if opt_attributes contains any of the attributes set
 *     to fixed values, documented above, or contains src.
 */
goog.html.flash.createEmbed = function(src, opt_attributes) {
  var fixedAttributes = {
    'src': src,
    'type': 'application/x-shockwave-flash',
    'pluginspage': 'https://www.macromedia.com/go/getflashplayer'
  };
  var defaultAttributes = {
    'allownetworking': 'none',
    'allowscriptaccess': 'never'
  };
  var attributes = goog.html.SafeHtml.combineAttributes(
      fixedAttributes, defaultAttributes, opt_attributes);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      'embed', attributes);
};


/**
 * Creates a SafeHtml representing an object tag, for loading Flash files.
 *
 *
 * The following attributes are set to these fixed values:
 * - type: application/x-shockwave-flash
 * - typemustmatch: "" (the empty string, meaning true for a boolean attribute)
 *
 * The following default name-value pairs (which are the most restrictive
 * possible but can be changed) are used in child param tags:
 * - allowNetworking: none
 * - allowScriptAccess: never
 *
 * @param {!goog.html.TrustedResourceUrl} data The value of the data param.
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
 *     the attributes or params set to fixed values, documented above, or
 *     contains classid, data or movie.
 */
goog.html.flash.createObject = function(data, opt_params, opt_attributes) {
  goog.html.flash.verifyKeysNotInMaps(
      goog.html.flash.FORBIDDEN_ATTRS_AND_PARAMS_ON_FLASH_, opt_attributes,
      opt_params);

  var paramTags = goog.html.flash.combineParams(
      {'allownetworking': 'none', 'allowscriptaccess': 'never'}, opt_params);
  var fixedAttributes = {
    'data': data,
    'type': 'application/x-shockwave-flash',
    'typemustmatch': ''
  };
  var attributes =
      goog.html.SafeHtml.combineAttributes(fixedAttributes, {}, opt_attributes);

  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      'object', attributes, paramTags);
};


/**
 * Creates a SafeHtml representing an object tag, for loading Flash files in
 * older IE (<11).
 *

 * The classid attribute is set to a fixed value of
 * "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000". The following default
 * name-value pairs (which are the most restrictive possible but can be
 * changed) are used in child param tags:
 * - allowNetworking: none
 * - allowScriptAccess: never
 *
 * @param {!goog.html.TrustedResourceUrl} movie The value of the movie param.
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
 *     the attributes or params set to fixed values, documented above, or
 *     contains data, movie, type or typemustmatch.
 */
goog.html.flash.createObjectForOldIe = function(
    movie, opt_params, opt_attributes) {
  goog.html.flash.verifyKeysNotInMaps(
      goog.html.flash.FORBIDDEN_ATTRS_AND_PARAMS_ON_FLASH_, opt_attributes,
      opt_params);

  var paramTags = goog.html.flash.combineParams(
      {'allownetworking': 'none', 'allowscriptaccess': 'never', 'movie': movie},
      opt_params);
  var fixedAttributes = {
    'classid': 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000'
  };
  var attributes =
      goog.html.SafeHtml.combineAttributes(fixedAttributes, {}, opt_attributes);

  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      'object', attributes, paramTags);
};


/**
 * @param {!Object<string, string|!goog.string.TypedString>} defaultParams
 * @param {?Object<string, string>=} opt_params Optional params passed to
 *     create*().
 * @return {!Array<!goog.html.SafeHtml>} Combined params.
 * @throws {Error} If opt_attributes contains an attribute with the same name
 *     as an attribute in fixedAttributes.
 * @package
 */
goog.html.flash.combineParams = function(defaultParams, opt_params) {
  var combinedParams = {};
  var name;

  for (name in defaultParams) {
    goog.asserts.assert(name.toLowerCase() == name, 'Must be lower case');
    combinedParams[name] = defaultParams[name];
  }
  for (name in opt_params) {
    var nameLower = name.toLowerCase();
    if (nameLower in defaultParams) {
      delete combinedParams[nameLower];
    }
    combinedParams[name] = opt_params[name];
  }

  var paramTags = [];
  for (name in combinedParams) {
    paramTags.push(
        goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
            'param', {'name': name, 'value': combinedParams[name]}));
  }
  return paramTags;
};


/**
 * Checks that keys are not present as keys in maps.
 * @param {!Array<string>} keys Keys that must not be present, lower-case.
 * @param {?Object<string, ?goog.html.SafeHtml.AttributeValue>=} opt_attributes
 *     Optional attributes passed to create*().
 * @param {?Object<string, string>=}  opt_params Optional params passed to
 *     createObject*().
 * @throws {Error} If any of keys exist as a key, ignoring case, in
 *     opt_attributes or opt_params.
 * @package
 */
goog.html.flash.verifyKeysNotInMaps = function(
    keys, opt_attributes, opt_params) {
  var verifyNotInMap = function(keys, map, type) {
    for (var keyMap in map) {
      var keyMapLower = keyMap.toLowerCase();
      for (var i = 0; i < keys.length; i++) {
        var keyToCheck = keys[i];
        goog.asserts.assert(keyToCheck.toLowerCase() == keyToCheck);
        if (keyMapLower == keyToCheck) {
          throw new Error(
              'Cannot override "' + keyToCheck + '" ' + type + ', got "' +
              keyMap + '" with value "' + map[keyMap] + '"');
        }
      }
    }
  };

  verifyNotInMap(keys, opt_attributes, 'attribute');
  verifyNotInMap(keys, opt_params, 'param');
};
