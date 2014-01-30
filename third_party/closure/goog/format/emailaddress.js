// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides functions to parse and manipulate email addresses.
 *
 */

goog.provide('goog.format.EmailAddress');

goog.require('goog.string');



/**
 * Formats an email address string for display, and allows for extraction of
 * The individual componants of the address.
 * @param {string=} opt_address The email address.
 * @param {string=} opt_name The name associated with the email address.
 * @constructor
 */
goog.format.EmailAddress = function(opt_address, opt_name) {
  /**
   * The name or personal string associated with the address.
   * @type {string}
   * @private
   */
  this.name_ = opt_name || '';

  /**
   * The email address.
   * @type {string}
   * @private
   */
  this.address_ = opt_address || '';
};


/**
 * Match string for opening tokens.
 * @type {string}
 * @private
 */
goog.format.EmailAddress.OPENERS_ = '"<([';


/**
 * Match string for closing tokens.
 * @type {string}
 * @private
 */
goog.format.EmailAddress.CLOSERS_ = '">)]';


/**
 * A RegExp to check special characters to be quoted.  Used in cleanAddress().
 * @type {RegExp}
 * @private
 */
goog.format.EmailAddress.SPECIAL_CHARS_RE_ = /[()<>@,;:\\\".\[\]]/;


/**
 * A RegExp to match all double quotes.  Used in cleanAddress().
 * @type {RegExp}
 * @private
 */
goog.format.EmailAddress.ALL_DOUBLE_QUOTES_ = /\"/g;


/**
 * A RegExp to match escaped double quotes.  Used in parse().
 * @type {RegExp}
 * @private
 */
goog.format.EmailAddress.ESCAPED_DOUBLE_QUOTES_ = /\\\"/g;


/**
 * A RegExp to match all backslashes.  Used in cleanAddress().
 * @type {RegExp}
 * @private
 */
goog.format.EmailAddress.ALL_BACKSLASHES_ = /\\/g;


/**
 * A RegExp to match escaped backslashes.  Used in parse().
 * @type {RegExp}
 * @private
 */
goog.format.EmailAddress.ESCAPED_BACKSLASHES_ = /\\\\/g;


/**
 * Get the name associated with the email address.
 * @return {string} The name or personal portion of the address.
 */
goog.format.EmailAddress.prototype.getName = function() {
  return this.name_;
};


/**
 * Get the email address.
 * @return {string} The email address.
 */
goog.format.EmailAddress.prototype.getAddress = function() {
  return this.address_;
};


/**
 * Set the name associated with the email address.
 * @param {string} name The name to associate.
 */
goog.format.EmailAddress.prototype.setName = function(name) {
  this.name_ = name;
};


/**
 * Set the email address.
 * @param {string} address The email address.
 */
goog.format.EmailAddress.prototype.setAddress = function(address) {
  this.address_ = address;
};


/**
 * Return the address in a standard format:
 *  - remove extra spaces.
 *  - Surround name with quotes if it contains special characters.
 * @return {string} The cleaned address.
 * @override
 */
goog.format.EmailAddress.prototype.toString = function() {
  var name = this.getName();

  // We intentionally remove double quotes in the name because escaping
  // them to \" looks ugly.
  name = name.replace(goog.format.EmailAddress.ALL_DOUBLE_QUOTES_, '');

  // If the name has special characters, we need to quote it and escape \'s.
  var quoteNeeded = goog.format.EmailAddress.SPECIAL_CHARS_RE_.test(name);
  if (quoteNeeded) {
    name = '"' +
        name.replace(goog.format.EmailAddress.ALL_BACKSLASHES_, '\\\\') + '"';
  }

  if (name == '') {
    return this.address_;
  }
  if (this.address_ == '') {
    return name;
  }
  return name + ' <' + this.address_ + '>';
};


/**
 * Determines is the current object is a valid email address.
 * @return {boolean} Whether the email address is valid.
 */
goog.format.EmailAddress.prototype.isValid = function() {
  return goog.format.EmailAddress.isValidAddrSpec(this.address_);
};


/**
 * Checks if the provided string is a valid email address. Supports both
 * simple email addresses (address specs) and addresses that contain display
 * names.
 * @param {string} str The email address to check.
 * @return {boolean} Whether the provided string is a valid address.
 */
goog.format.EmailAddress.isValidAddress = function(str) {
  return goog.format.EmailAddress.parse(str).isValid();
};


/**
 * Checks if the provided string is a valid address spec (local@domain.com).
 * @param {string} str The email address to check.
 * @return {boolean} Whether the provided string is a valid address spec.
 */
goog.format.EmailAddress.isValidAddrSpec = function(str) {
  // This is a fairly naive implementation, but it covers 99% of use cases.
  // For more details, see http://en.wikipedia.org/wiki/Email_address#Syntax
  // TODO(mariakhomenko): we should also be handling i18n domain names as per
  // http://en.wikipedia.org/wiki/Internationalized_domain_name
  var filter =
      /^[+a-zA-Z0-9_.!#$%&'*\/=?^`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,6}$/;
  return filter.test(str);
};


/**
 * Parse an email address of the form "name" &lt;address&gt; into
 * an email address.
 * @param {string} addr The address string.
 * @return {goog.format.EmailAddress} The parsed address.
 */
goog.format.EmailAddress.parse = function(addr) {
  // TODO(ecattell): Strip bidi markers.
  var name = '';
  var address = '';
  for (var i = 0; i < addr.length;) {
    var token = goog.format.EmailAddress.getToken_(addr, i);
    if (token.charAt(0) == '<' && token.indexOf('>') != -1) {
      var end = token.indexOf('>');
      address = token.substring(1, end);
    } else if (address == '') {
      name += token;
    }
    i += token.length;
  }

  // Check if it's a simple email address of the form "jlim@google.com".
  if (address == '' && name.indexOf('@') != -1) {
    address = name;
    name = '';
  }

  name = goog.string.collapseWhitespace(name);
  name = goog.string.stripQuotes(name, '\'');
  name = goog.string.stripQuotes(name, '"');
  // Replace escaped quotes and slashes.
  name = name.replace(goog.format.EmailAddress.ESCAPED_DOUBLE_QUOTES_, '"');
  name = name.replace(goog.format.EmailAddress.ESCAPED_BACKSLASHES_, '\\');
  address = goog.string.collapseWhitespace(address);
  return new goog.format.EmailAddress(address, name);
};


/**
 * Parse a string containing email addresses of the form
 * "name" &lt;address&gt; into an array of email addresses.
 * @param {string} str The address list.
 * @return {Array.<goog.format.EmailAddress>} The parsed emails.
 */
goog.format.EmailAddress.parseList = function(str) {
  var result = [];
  var email = '';
  var token;

  for (var i = 0; i < str.length; ) {
    token = goog.format.EmailAddress.getToken_(str, i);
    if (token == ',' || token == ';' ||
        (token == ' ' && goog.format.EmailAddress.parse(email).isValid())) {
      if (!goog.string.isEmpty(email)) {
        result.push(goog.format.EmailAddress.parse(email));
      }
      email = '';
      i++;
      continue;
    }
    email += token;
    i += token.length;
  }

  // Add the final token.
  if (!goog.string.isEmpty(email)) {
    result.push(goog.format.EmailAddress.parse(email));
  }
  return result;
};


/**
 * Get the next token from a position in an address string.
 * @param {string} str the string.
 * @param {number} pos the position.
 * @return {string} the token.
 * @private
 */
goog.format.EmailAddress.getToken_ = function(str, pos) {
  var ch = str.charAt(pos);
  var p = goog.format.EmailAddress.OPENERS_.indexOf(ch);
  if (p == -1) {
    return ch;
  }
  if (goog.format.EmailAddress.isEscapedDlQuote_(str, pos)) {

    // If an opener is an escaped quote we do not treat it as a real opener
    // and keep accumulating the token.
    return ch;
  }
  var closerChar = goog.format.EmailAddress.CLOSERS_.charAt(p);
  var endPos = str.indexOf(closerChar, pos + 1);

  // If the closer is a quote we go forward skipping escaped quotes until we
  // hit the real closing one.
  while (endPos >= 0 &&
         goog.format.EmailAddress.isEscapedDlQuote_(str, endPos)) {
    endPos = str.indexOf(closerChar, endPos + 1);
  }
  var token = (endPos >= 0) ? str.substring(pos, endPos + 1) : ch;
  return token;
};


/**
 * Checks if the character in the current position is an escaped double quote
 * ( \" ).
 * @param {string} str the string.
 * @param {number} pos the position.
 * @return {boolean} true if the char is escaped double quote.
 * @private
 */
goog.format.EmailAddress.isEscapedDlQuote_ = function(str, pos) {
  if (str.charAt(pos) != '"') {
    return false;
  }
  var slashCount = 0;
  for (var idx = pos - 1; idx >= 0 && str.charAt(idx) == '\\'; idx--) {
    slashCount++;
  }
  return ((slashCount % 2) != 0);
};
