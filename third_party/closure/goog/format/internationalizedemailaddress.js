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
 * @fileoverview Provides functions to parse and manipulate internationalized
 * email addresses. This is useful in the context of Email Address
 * Internationalization (EAI) as defined by RFC6530.
 *
 */

goog.provide('goog.format.InternationalizedEmailAddress');

goog.require('goog.format.EmailAddress');

goog.require('goog.string');



/**
 * Formats an email address string for display, and allows for extraction of
 * the individual components of the address.
 * @param {string=} opt_address The email address.
 * @param {string=} opt_name The name associated with the email address.
 * @constructor
 * @extends {goog.format.EmailAddress}
 */
goog.format.InternationalizedEmailAddress = function(opt_address, opt_name) {
  goog.format.InternationalizedEmailAddress.base(
      this, 'constructor', opt_address, opt_name);
};
goog.inherits(
    goog.format.InternationalizedEmailAddress, goog.format.EmailAddress);


/**
 * A string representing the RegExp for the local part of an EAI email address.
 * @private
 */
goog.format.InternationalizedEmailAddress.EAI_LOCAL_PART_REGEXP_STR_ =
    '((?!\\s)[+a-zA-Z0-9_.!#$%&\'*\\/=?^`{|}~\u0080-\uFFFFFF-])+';


/**
 * A string representing the RegExp for a label in the domain part of an EAI
 * email address.
 * @private
 */
goog.format.InternationalizedEmailAddress.EAI_LABEL_CHAR_REGEXP_STR_ =
    '(?!\\s)[a-zA-Z0-9\u0080-\u3001\u3003-\uFF0D\uFF0F-\uFF60\uFF62-\uFFFFFF-]';


/**
 * A string representing the RegExp for the domain part of an EAI email address.
 * @private
 */
goog.format.InternationalizedEmailAddress.EAI_DOMAIN_PART_REGEXP_STR_ =
    // A unicode character (ASCII or Unicode excluding periods)
    '(' + goog.format.InternationalizedEmailAddress.EAI_LABEL_CHAR_REGEXP_STR_ +
    // Such character 1+ times, followed by a Unicode period. All 1+ times.
    '+[\\.\\uFF0E\\u3002\\uFF61])+' +
    // And same thing but without a period in the end
    goog.format.InternationalizedEmailAddress.EAI_LABEL_CHAR_REGEXP_STR_ +
    '{2,63}';


/**
 * Match string for address separators. This list is the result of the
 * discussion in b/16241003.
 * @type {string}
 * @private
 */
goog.format.InternationalizedEmailAddress.ADDRESS_SEPARATORS_ =
    ',' + // U+002C ( , ) COMMA
    ';' + // U+003B ( ; ) SEMICOLON
    '\u055D' + // ( ՝ ) ARMENIAN COMMA
    '\u060C' + // ( ، ) ARABIC COMMA
    '\u1363' + // ( ፣ ) ETHIOPIC COMMA
    '\u1802' + // ( ᠂ ) MONGOLIAN COMMA
    '\u1808' + // ( ᠈ ) MONGOLIAN MANCHU COMMA
    '\u2E41' + // ( ⹁ ) REVERSED COMMA
    '\u3001' + // ( 、 ) IDEOGRAPHIC COMMA
    '\uFF0C' + // ( ， ) FULLWIDTH COMMA
    '\u061B' + // ( ‎؛‎ ) ARABIC SEMICOLON
    '\u1364' + // ( ፤ ) ETHIOPIC SEMICOLON
    '\uFF1B' + // ( ； ) FULLWIDTH SEMICOLON
    '\uFF64' + // ( ､ ) HALFWIDTH IDEOGRAPHIC COMMA
    '\u104A'; // ( ၊ ) MYANMAR SIGN LITTLE SECTION


/**
 * Match string for characters that, when in a display name, require it to be
 * quoted.
 * @type {string}
 * @private
 */
goog.format.InternationalizedEmailAddress.CHARS_REQUIRE_QUOTES_ =
    goog.format.EmailAddress.SPECIAL_CHARS +
    goog.format.InternationalizedEmailAddress.ADDRESS_SEPARATORS_;


/**
 * A RegExp to match the local part of an EAI email address.
 * @private {!RegExp}
 */
goog.format.InternationalizedEmailAddress.EAI_LOCAL_PART_ =
    new RegExp('^' +
        goog.format.InternationalizedEmailAddress.EAI_LOCAL_PART_REGEXP_STR_ +
        '$');


/**
 * A RegExp to match the domain part of an EAI email address.
 * @private {!RegExp}
 */
goog.format.InternationalizedEmailAddress.EAI_DOMAIN_PART_ =
    new RegExp('^' +
        goog.format.InternationalizedEmailAddress.EAI_DOMAIN_PART_REGEXP_STR_ +
        '$');


/**
 * A RegExp to match an EAI email address.
 * @private {!RegExp}
 */
goog.format.InternationalizedEmailAddress.EAI_EMAIL_ADDRESS_ =
    new RegExp('^' +
        goog.format.InternationalizedEmailAddress.EAI_LOCAL_PART_REGEXP_STR_ +
        '@' +
        goog.format.InternationalizedEmailAddress.EAI_DOMAIN_PART_REGEXP_STR_ +
        '$');


/**
 * Checks if the provided string is a valid local part (part before the '@') of
 * an EAI email address.
 * @param {string} str The local part to check.
 * @return {boolean} Whether the provided string is a valid local part.
 */
goog.format.InternationalizedEmailAddress.isValidLocalPartSpec = function(str) {
  if (!goog.isDefAndNotNull(str)) {
    return false;
  }
  return goog.format.InternationalizedEmailAddress.EAI_LOCAL_PART_.test(str);
};


/**
 * Checks if the provided string is a valid domain part (part after the '@') of
 * an EAI email address.
 * @param {string} str The domain part to check.
 * @return {boolean} Whether the provided string is a valid domain part.
 */
goog.format.InternationalizedEmailAddress.isValidDomainPartSpec =
    function(str) {
  if (!goog.isDefAndNotNull(str)) {
    return false;
  }
  return goog.format.InternationalizedEmailAddress.EAI_DOMAIN_PART_.test(str);
};


/** @override */
goog.format.InternationalizedEmailAddress.prototype.isValid = function() {
  return goog.format.InternationalizedEmailAddress.isValidAddrSpec(
      this.address);
};


/**
 * Checks if the provided string is a valid email address. Supports both
 * simple email addresses (address specs) and addresses that contain display
 * names.
 * @param {string} str The email address to check.
 * @return {boolean} Whether the provided string is a valid address.
 */
goog.format.InternationalizedEmailAddress.isValidAddress = function(str) {
  if (!goog.isDefAndNotNull(str)) {
    return false;
  }
  return goog.format.InternationalizedEmailAddress.parse(str).isValid();
};


/**
 * Checks if the provided string is a valid address spec (local@domain.com).
 * @param {string} str The email address to check.
 * @return {boolean} Whether the provided string is a valid address spec.
 */
goog.format.InternationalizedEmailAddress.isValidAddrSpec = function(str) {
  if (!goog.isDefAndNotNull(str)) {
    return false;
  }

  // This is a fairly naive implementation, but it covers 99% of use cases.
  // For more details, see http://en.wikipedia.org/wiki/Email_address#Syntax
  return goog.format.InternationalizedEmailAddress.EAI_EMAIL_ADDRESS_.test(str);
};


/**
 * Parses a string containing email addresses of the form
 * "name" &lt;address&gt; into an array of email addresses.
 * @param {string} str The address list.
 * @return {!Array<!goog.format.EmailAddress>} The parsed emails.
 */
goog.format.InternationalizedEmailAddress.parseList = function(str) {
  return goog.format.EmailAddress.parseListInternal(
      str, goog.format.InternationalizedEmailAddress.parse,
      goog.format.InternationalizedEmailAddress.isAddressSeparator);
};


/**
 * Parses an email address of the form "name" &lt;address&gt; into
 * an email address.
 * @param {string} addr The address string.
 * @return {!goog.format.EmailAddress} The parsed address.
 */
goog.format.InternationalizedEmailAddress.parse = function(addr) {
  return goog.format.EmailAddress.parseInternal(
      addr, goog.format.InternationalizedEmailAddress);
};


/**
 * @param {string} ch The character to test.
 * @return {boolean} Whether the provided character is an address separator.
 */
goog.format.InternationalizedEmailAddress.isAddressSeparator = function(ch) {
  return goog.string.contains(
      goog.format.InternationalizedEmailAddress.ADDRESS_SEPARATORS_, ch);
};


/**
 * Return the address in a standard format:
 *  - remove extra spaces.
 *  - Surround name with quotes if it contains special characters.
 * @return {string} The cleaned address.
 * @override
 */
goog.format.InternationalizedEmailAddress.prototype.toString = function() {
  return this.toStringInternal(
      goog.format.InternationalizedEmailAddress.CHARS_REQUIRE_QUOTES_);
};
