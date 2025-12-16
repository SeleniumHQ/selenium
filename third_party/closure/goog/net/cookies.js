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
 * @fileoverview Functions for setting, getting and deleting cookies.
 */


goog.provide('goog.net.Cookies');
goog.provide('goog.net.cookies');

goog.require('goog.asserts');
goog.require('goog.string');



/**
 * A class for handling browser cookies.
 * @param {?Document} context The context document to get/set cookies on.
 * @constructor
 * @final
 */
goog.net.Cookies = function(context) {
  /**
  * The context document to get/set cookies on. If no document context is
  * passed, use a fake one with only the "cookie" attribute. This allows
  * this class to be instantiated safely in web worker environments.
  * @private {{cookie: string}}
  */
  this.document_ = context || {cookie: ''};
};


/**
 * Static constant for the size of cookies. Per the spec, there's a 4K limit
 * to the size of a cookie. To make sure users can't break this limit, we
 * should truncate long cookies at 3950 bytes, to be extra careful with dumb
 * browsers/proxies that interpret 4K as 4000 rather than 4096.
 * @const {number}
 */
goog.net.Cookies.MAX_COOKIE_LENGTH = 3950;


/**
 * Returns true if cookies are enabled.
 * @return {boolean} True if cookies are enabled.
 */
goog.net.Cookies.prototype.isEnabled = function() {
  return navigator.cookieEnabled;
};


/**
 * We do not allow '=', ';', or white space in the name.
 *
 * NOTE: The following are allowed by this method, but should be avoided for
 * cookies handled by the server.
 * - any name starting with '$'
 * - 'Comment'
 * - 'Domain'
 * - 'Expires'
 * - 'Max-Age'
 * - 'Path'
 * - 'Secure'
 * - 'Version'
 *
 * @param {string} name Cookie name.
 * @return {boolean} Whether name is valid.
 *
 * @see <a href="http://tools.ietf.org/html/rfc2109">RFC 2109</a>
 * @see <a href="http://tools.ietf.org/html/rfc2965">RFC 2965</a>
 */
goog.net.Cookies.prototype.isValidName = function(name) {
  return !(/[;=\s]/.test(name));
};


/**
 * We do not allow ';' or line break in the value.
 *
 * Spec does not mention any illegal characters, but in practice semi-colons
 * break parsing and line breaks truncate the name.
 *
 * @param {string} value Cookie value.
 * @return {boolean} Whether value is valid.
 *
 * @see <a href="http://tools.ietf.org/html/rfc2109">RFC 2109</a>
 * @see <a href="http://tools.ietf.org/html/rfc2965">RFC 2965</a>
 */
goog.net.Cookies.prototype.isValidValue = function(value) {
  return !(/[;\r\n]/.test(value));
};


/**
 * Sets a cookie.  The max_age can be -1 to set a session cookie. To remove and
 * expire cookies, use remove() instead.
 *
 * Neither the `name` nor the `value` are encoded in any way. It is
 * up to the callers of `get` and `set` (as well as all the other
 * methods) to handle any possible encoding and decoding.
 *
 * @throws {!Error} If the `name` fails #goog.net.cookies.isValidName.
 * @throws {!Error} If the `value` fails #goog.net.cookies.isValidValue.
 *
 * @param {string} name  The cookie name.
 * @param {string} value  The cookie value.
 * @param {number|!goog.net.Cookies.SetOptions=} opt_maxAge  The options object,
 *     or else (deprecated) the max age in seconds (from now). Use -1 to set a
 *     session cookie. If not provided, the default is -1 (i.e. set a session
 *     cookie).
 * @param {?string=} opt_path  The path of the cookie. If not present then this
 *     uses the full request path.
 * @param {?string=} opt_domain  The domain of the cookie, or null to not
 *     specify a domain attribute (browser will use the full request host name).
 *     If not provided, the default is null (i.e. let browser use full request
 *     host name).
 * @param {boolean=} opt_secure Whether the cookie should only be sent over
 *     a secure channel.
 */
goog.net.Cookies.prototype.set = function(
    name, value, opt_maxAge, opt_path, opt_domain, opt_secure) {
  /** @type {string|undefined} */
  var sameSite;
  if (typeof opt_maxAge === 'object') {
    goog.asserts.assert(opt_path == null);
    goog.asserts.assert(opt_domain == null);
    goog.asserts.assert(opt_secure == null);
    var options = opt_maxAge;
    sameSite = options.sameSite;
    opt_secure = options.secure;
    opt_domain = options.domain;
    opt_path = options.path;
    opt_maxAge = options.maxAge;
  }
  if (!this.isValidName(name)) {
    throw new Error('Invalid cookie name "' + name + '"');
  }
  if (!this.isValidValue(value)) {
    throw new Error('Invalid cookie value "' + value + '"');
  }

  if (opt_maxAge === undefined) {
    opt_maxAge = -1;
  }

  var domainStr = opt_domain ? ';domain=' + opt_domain : '';
  var pathStr = opt_path ? ';path=' + opt_path : '';
  var secureStr = opt_secure ? ';secure' : '';

  var expiresStr;

  // Case 1: Set a session cookie.
  if (opt_maxAge < 0) {
    expiresStr = '';

    // Case 2: Remove the cookie.
    // Note: We don't tell people about this option in the function doc because
    // we prefer people to use remove() to remove cookies.
  } else if (opt_maxAge == 0) {
    // Note: Don't use Jan 1, 1970 for date because NS 4.76 will try to convert
    // it to local time, and if the local time is before Jan 1, 1970, then the
    // browser will ignore the Expires attribute altogether.
    var pastDate = new Date(1970, 1 /*Feb*/, 1);  // Feb 1, 1970
    expiresStr = ';expires=' + pastDate.toUTCString();

    // Case 3: Set a persistent cookie.
  } else {
    var futureDate = new Date(goog.now() + opt_maxAge * 1000);
    expiresStr = ';expires=' + futureDate.toUTCString();
  }

  var sameSiteStr = sameSite != null ? ';samesite=' + sameSite : '';

  this.setCookie_(
      name + '=' + value + domainStr + pathStr + expiresStr + secureStr +
      sameSiteStr);
};


/**
 * Returns the value for the first cookie with the given name.
 * @param {string} name  The name of the cookie to get.
 * @param {string=} opt_default  If not found this is returned instead.
 * @return {string|undefined}  The value of the cookie. If no cookie is set this
 *     returns opt_default or undefined if opt_default is not provided.
 */
goog.net.Cookies.prototype.get = function(name, opt_default) {
  var nameEq = name + '=';
  var parts = this.getParts_();
  for (var i = 0, part; i < parts.length; i++) {
    part = goog.string.trim(parts[i]);
    // startsWith
    if (part.lastIndexOf(nameEq, 0) == 0) {
      return part.substr(nameEq.length);
    }
    if (part == name) {
      return '';
    }
  }
  return opt_default;
};


/**
 * Removes and expires a cookie.
 * @param {string} name  The cookie name.
 * @param {?string=} opt_path  The path of the cookie. If null or not present,
 *     expires the cookie set at the full request path.
 * @param {?string=} opt_domain  The domain of the cookie, or null to expire a
 *     cookie set at the full request host name. If not provided, the default is
 *     null (i.e. cookie at full request host name).
 * @return {boolean} Whether the cookie existed before it was removed.
 */
goog.net.Cookies.prototype.remove = function(name, opt_path, opt_domain) {
  var rv = this.containsKey(name);
  this.set(name, '', 0, opt_path, opt_domain);
  return rv;
};


/**
 * Gets the names for all the cookies.
 * @return {Array<string>} An array with the names of the cookies.
 */
goog.net.Cookies.prototype.getKeys = function() {
  return this.getKeyValues_().keys;
};


/**
 * Gets the values for all the cookies.
 * @return {Array<string>} An array with the values of the cookies.
 */
goog.net.Cookies.prototype.getValues = function() {
  return this.getKeyValues_().values;
};


/**
 * @return {boolean} Whether there are any cookies for this document.
 */
goog.net.Cookies.prototype.isEmpty = function() {
  return !this.getCookie_();
};


/**
 * @return {number} The number of cookies for this document.
 */
goog.net.Cookies.prototype.getCount = function() {
  var cookie = this.getCookie_();
  if (!cookie) {
    return 0;
  }
  return this.getParts_().length;
};


/**
 * Returns whether there is a cookie with the given name.
 * @param {string} key The name of the cookie to test for.
 * @return {boolean} Whether there is a cookie by that name.
 */
goog.net.Cookies.prototype.containsKey = function(key) {
  // substring will return empty string if the key is not found, so the get
  // function will only return undefined
  return this.get(key) !== undefined;
};


/**
 * Returns whether there is a cookie with the given value. (This is an O(n)
 * operation.)
 * @param {string} value  The value to check for.
 * @return {boolean} Whether there is a cookie with that value.
 */
goog.net.Cookies.prototype.containsValue = function(value) {
  // this O(n) in any case so lets do the trivial thing.
  var values = this.getKeyValues_().values;
  for (var i = 0; i < values.length; i++) {
    if (values[i] == value) {
      return true;
    }
  }
  return false;
};


/**
 * Removes all cookies for this document.  Note that this will only remove
 * cookies from the current path and domain.  If there are cookies set using a
 * subpath and/or another domain these will still be there.
 */
goog.net.Cookies.prototype.clear = function() {
  var keys = this.getKeyValues_().keys;
  for (var i = keys.length - 1; i >= 0; i--) {
    this.remove(keys[i]);
  }
};


/**
 * Private helper function to allow testing cookies without depending on the
 * browser.
 * @param {string} s The cookie string to set.
 * @private
 */
goog.net.Cookies.prototype.setCookie_ = function(s) {
  this.document_.cookie = s;
};


/**
 * Private helper function to allow testing cookies without depending on the
 * browser. IE6 can return null here.
 * @return {string} Returns the `document.cookie`.
 * @private
 */
goog.net.Cookies.prototype.getCookie_ = function() {
  return this.document_.cookie;
};


/**
 * @return {!Array<string>} The cookie split on semi colons.
 * @private
 */
goog.net.Cookies.prototype.getParts_ = function() {
  return (this.getCookie_() || '').split(';');
};


/**
 * Gets the names and values for all the cookies.
 * @return {{keys:!Array<string>, values:!Array<string>}} An object with keys
 *     and values.
 * @private
 */
goog.net.Cookies.prototype.getKeyValues_ = function() {
  var parts = this.getParts_();
  var keys = [], values = [], index, part;
  for (var i = 0; i < parts.length; i++) {
    part = goog.string.trim(parts[i]);
    index = part.indexOf('=');

    if (index == -1) {  // empty name
      keys.push('');
      values.push(part);
    } else {
      keys.push(part.substring(0, index));
      values.push(part.substring(index + 1));
    }
  }
  return {keys: keys, values: values};
};


/**
 * Options object for calls to Cookies.prototype.set.
 * @record
 */
goog.net.Cookies.SetOptions = function() {
  /**
   * The max age in seconds (from now). Use -1 to set a session cookie. If not
   * provided, the default is -1 (i.e. set a session cookie).
   * @type {number|undefined}
   */
  this.maxAge;
  /**
   * The path of the cookie. If not present then this uses the full request
   * path.
   * @type {?string|undefined}
   */
  this.path;
  /**
   * The domain of the cookie, or null to not specify a domain attribute
   * (browser will use the full request host name). If not provided, the default
   * is null (i.e. let browser use full request host name).
   * @type {?string|undefined}
   */
  this.domain;
  /**
   * Whether the cookie should only be sent over a secure channel.
   * @type {boolean|undefined}
   */
  this.secure;
  /**
   * The SameSite attribute for the cookie (default is NONE).
   * @type {!goog.net.Cookies.SameSite|undefined}
   */
  this.sameSite;
};


/**
 * Valid values for the SameSite cookie attribute.  In 2019, browsers began the
 * process of changing the default from NONE to LAX.
 *
 * @see https://web.dev/samesite-cookies-explained
 * @see https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-5.3.7
 * @enum {string}
 */
goog.net.Cookies.SameSite = {
  /**
   * The cookie will be sent in first-party contexts, including initial
   * navigation from external referrers.
   */
  LAX: 'lax',
  /**
   * The cookie will be sent in all first-party or third-party contexts. This
   * was the original default behavior of the web, but will need to be set
   * explicitly starting in 2020.
   */
  NONE: 'none',
  /**
   * The cookie will only be sent in first-party contexts. It will not be sent
   * on initial navigation from external referrers.
   */
  STRICT: 'strict',
};


// TODO(closure-team): This should be a singleton getter instead of a static
// instance.
/**
 * A static default instance.
 * @const {!goog.net.Cookies}
 */
goog.net.cookies =
    new goog.net.Cookies(typeof document == 'undefined' ? null : document);


/**
 * Getter for the static instance of goog.net.Cookies.
 * @return {!goog.net.Cookies}
 */
goog.net.Cookies.getInstance = function() {
  return goog.net.cookies;
};
