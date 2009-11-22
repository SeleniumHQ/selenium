// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved.

/**
 * @fileoverview Functions for setting, getting and deleting cookies.
 *
 */


goog.provide('goog.net.cookies');

goog.require('goog.userAgent');

/**
 * Static constant for the size of cookies. Per the spec, there's a 4K limit
 * to the size of a cookie. To make sure users can't break this limit, we
 * should truncate long cookies at 3950 bytes, to be extra careful with dumb
 * browsers/proxies that interpret 4K as 4000 rather than 4096.
 * @type {number}
 */
goog.net.cookies.MAX_COOKIE_LENGTH = 3950;


/**
 * RegExp used to split the cookies string.
 * @type {RegExp}
 * @private
 */
goog.net.cookies.SPLIT_RE_ = /\s*;\s*/;


/**
 * Test cookie name.  Used for a temp cookie when testing if cookies are
 * enabled.
 * @type {string}
 * @private
 */
goog.net.cookies.TEST_COOKIE_NAME_ = 'COOKIES_TEST_';


/**
 * Returns true if cookies are enabled.
 * @return {boolean} True if cookies are enabled.
 */
goog.net.cookies.isEnabled = function() {
  var isEnabled = goog.net.cookies.isNavigatorCookieEnabled_();

  if (isEnabled && goog.userAgent.WEBKIT) {
    // Chrome has a bug where it will report cookies as enabled even if they
    // are not, see http://code.google.com/p/chromium/issues/detail?id=1850 .
    // To work around, we set a unique cookie, then check for it.
    var cookieName = goog.net.cookies.TEST_COOKIE_NAME_ + goog.now();
    goog.net.cookies.set(cookieName, '1');
    if (!goog.net.cookies.get(cookieName)) {
      return false;
    }
    // Remove temp cookie.
    goog.net.cookies.remove(cookieName);
  }

  return isEnabled;
};


/**
 * Sets a cookie.  The max_age can be -1 to set a session cookie. To remove and
 * expire cookies, use remove() instead.
 *
 * @param {string} name  The cookie name.
 * @param {string} value  The cookie value.
 * @param {number} opt_maxAge  The max age in seconds (from now). Use -1 to set
 *     a session cookie. If not provided, the default is -1 (i.e. set a session
 *     cookie).
 * @param {string} opt_path  The path of the cookie. If not present then this
 *     uses the full request path.
 * @param {string} opt_domain  The domain of the cookie, or null to not specify
 *     a domain attribute (browser will use the full request host name). If not
 *     provided, the default is null (i.e. let browser use full request host
 *     name).
 */
goog.net.cookies.set = function(name, value, opt_maxAge, opt_path, opt_domain) {
  // we do not allow '=' or ';' in the name
  if (/[;=]/.test(name)) {
    throw Error('Invalid cookie name "' + name + '"');
  }
  // we do not allow ';' in value
  if (/;/.test(value)) {
    throw Error('Invalid cookie value "' + value + '"');
  }

  if (!goog.isDef(opt_maxAge)) {
    opt_maxAge = -1;
  }

  var domainStr = opt_domain ? ';domain=' + opt_domain : '';
  var pathStr = opt_path ? ';path=' + opt_path : '';

  var expiresStr;

  // Case 1: Set a session cookie.
  if (opt_maxAge < 0) {
    expiresStr = '';

  // Case 2: Expire the cookie.
  // Note: We don't tell people about this option in the function doc because
  // we prefer people to use ExpireCookie() to expire cookies.
  } else if (opt_maxAge == 0) {
    // Note: Don't use Jan 1, 1970 for date because NS 4.76 will try to convert
    // it to local time, and if the local time is before Jan 1, 1970, then the
    // browser will ignore the Expires attribute altogether.
    var pastDate = new Date(1970, 1 /*Feb*/, 1);  // Feb 1, 1970
    expiresStr = ';expires=' + pastDate.toUTCString();

  // Case 3: Set a persistent cookie.
  } else {
    var futureDate = new Date((new Date).getTime() + opt_maxAge * 1000);
    expiresStr = ';expires=' + futureDate.toUTCString();
  }

  document.cookie = name + '=' + value + domainStr + pathStr + expiresStr;
};


/**
 * Returns the value for the first cookie with the given name.
 * @param {string} name  The name of the cookie to get.
 * @param {string} opt_default  If not found this is returned instead.
 * @return {string|undefined}  The value of the cookie. If no cookie is set this
 *     returns opt_default or undefined if opt_default is not provided.
 */
goog.net.cookies.get = function(name, opt_default) {
  var nameEq = name + '=';
  var parts = String(document.cookie).split(goog.net.cookies.SPLIT_RE_);
  for (var i = 0, part; part = parts[i]; i++) {
    if (part.indexOf(nameEq) == 0) {
      return part.substr(nameEq.length);
    }
  }
  return opt_default;
};


/**
 * Removes and expires a cookie.
 * @param {string} name  The cookie name.
 * @param {string} opt_path  The path of the cookie, or null to expire a cookie
 *     set at the full request path. If not provided, the default is '/'
 *     (i.e. path=/).
 * @param {string} opt_domain  The domain of the cookie, or null to expire a
 *     cookie set at the full request host name. If not provided, the default is
 *     null (i.e. cookie at full request host name).
 * @return {boolean} Whether the cookie existed before it was removed.
 */
goog.net.cookies.remove = function(name, opt_path, opt_domain) {
  var rv = goog.net.cookies.containsKey(name);
  goog.net.cookies.set(name, '', 0, opt_path, opt_domain);
  return rv;
};


/**
 * Returns navigator.cookieEnabled.  Overridden in unit tests.
 * @return {boolean} The value of navigator.cookieEnabled.
 * @private
 */
goog.net.cookies.isNavigatorCookieEnabled_ = function() {
  return navigator.cookieEnabled;
};


/**
 * Gets the names and values for all the cookies.
 * @return {Object} An object with keys and values.
 * @private
 */
goog.net.cookies.getKeyValues_ = function() {
  var parts = String(document.cookie).split(goog.net.cookies.SPLIT_RE_);
  var keys = [], values = [], index, part;
  for (var i = 0; part = parts[i]; i++) {
    index = part.indexOf('=');

    if (index == -1) { // empty name
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
 * Gets the names for all the cookies.
 * @return {Array.<string>} An array with the names of the cookies.
 */
goog.net.cookies.getKeys = function() {
  return goog.net.cookies.getKeyValues_().keys;
};


/**
 * Gets the values for all the cookies.
 * @return {Array.<string>} An array with the values of the cookies.
 */
goog.net.cookies.getValues = function() {
  return goog.net.cookies.getKeyValues_().values;
};


/**
 * @return {boolean} Whether there are any cookies for this document.
 */
goog.net.cookies.isEmpty = function() {
  return document.cookie == '';
};


/**
 * @return {number} The number of cookies for this document.
 */
goog.net.cookies.getCount = function() {
  var cookie = String(document.cookie);
  if (cookie == '') {
    return 0;
  }
  return cookie.split(goog.net.cookies.SPLIT_RE_).length;
};


/**
 * Returns whether there is a cookie with the given name.
 * @param {string} key The name of the cookie to test for.
 * @return {boolean} Whether there is a cookie by that name.
 */
goog.net.cookies.containsKey = function(key) {
  // substring will return empty string if the key is not found, so the get
  // function will only return undefined
  return goog.isDef(goog.net.cookies.get(key));
};


/**
 * Returns whether there is a cookie with the given value. (This is an O(n)
 * operation.)
 * @param {string} value  The value to check for.
 * @return {boolean} Whether there is a cookie with that value.
 */
goog.net.cookies.containsValue = function(value) {
  // this O(n) in any case so lets do the trivial thing.
  var values = goog.net.cookies.getKeyValues_().values;
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
goog.net.cookies.clear = function() {
  var keys = goog.net.cookies.getKeyValues_().keys;
  for (var i = keys.length - 1; i >= 0; i--) {
    goog.net.cookies.remove(keys[i]);
  }
};
