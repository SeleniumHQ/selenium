// Copyright 2006 Google Inc.
// All Rights Reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

/**
 * @fileoverview Class for parsing and formatting URIs.
 *
 * Use goog.Uri(string) to parse a URI string.  Use goog.Uri.create(...) to
 * create a new instance of the goog.Uri object from Uri parts.
 *
 * e.g: <code>var myUri = new goog.Uri(window.location);</code>
 *
 * Original implementation from google3/javascript by Mike Samuel.  The main
 * changes are to the interface (more like .NETs), though the internal
 * representation is now of un-encoded parts, this will change the behavior
 * slightly.
 *
 * Implements RFC 3986 for parsing/formatting URIs.
 */

goog.provide('goog.Uri');
goog.provide('goog.Uri.QueryData');

goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.structs');
goog.require('goog.structs.Map');


/**
 * This class contains setters and getters for the parts of the URI.
 * The <code>getXyz</code>/<code>setXyz</code> methods return the decoded part
 * -- so<code>goog.Uri.parse('/foo%20bar').getPath()</code> will return the
 * decoded path, <code>/foo bar</code>.
 *
 * The constructor accepts an optional unparsed, raw URI string.  The parser
 * is relaxed, so special characters that aren't escaped but don't cause
 * ambiguities will not cause parse failures.
 *
 * All setters return <code>this</code> and so may be chained, a la
 * <code>goog.Uri.parse('/foo').setFragment('part').toString()</code>.
 *
 * @param {string|goog.Uri} opt_uri Optional string URI to parse
 *        (use goog.Uri.create() to create a URI from parts), or if
 *        a goog.Uri is passed, a clone is created.
 * @param {boolean} opt_ignoreCase If true, #getParameterValue will ignore
 * the case of the parameter name.
 *
 * @constructor
 */
goog.Uri = function(opt_uri, opt_ignoreCase) {
  // Parse in the uri string
  var m;
  if (opt_uri instanceof goog.Uri) {
    this.setIgnoreCase(opt_ignoreCase == null ?
        opt_uri.getIgnoreCase() : opt_ignoreCase);
    this.setScheme(opt_uri.getScheme());
    this.setUserInfo(opt_uri.getUserInfo());
    this.setDomain(opt_uri.getDomain());
    this.setPort(opt_uri.getPort());
    this.setPath(opt_uri.getPath());
    this.setQueryData(opt_uri.getQueryData().clone());
    this.setFragment(opt_uri.getFragment());
  } else if (opt_uri && (m = String(opt_uri).match(goog.Uri.getRE_()))) {
    // Set the parts -- decoding as we do so
    this.setIgnoreCase(!!opt_ignoreCase);
    this.setScheme(m[1], true);
    this.setUserInfo(m[2], true);
    this.setDomain(m[3], true);
    this.setPort(m[4]);
    this.setPath(m[5], true);
    this.setQueryData(m[6]);
    this.setFragment(m[7], true);

  } else {
    this.setIgnoreCase(!!opt_ignoreCase);
    this.queryData_ = new goog.Uri.QueryData(null, this, this.ignoreCase_);
  }

};

/**
 * Parameter name added to stop caching
 * @type {string}
 */
goog.Uri.RANDOM_PARAM = 'zx';

/**
 * Scheme such as "http"
 * @type {string}
 * @private
 */
goog.Uri.prototype.scheme_ = '';

/**
 * User credentials in the form "username:password"
 * @type {string}
 * @private
 */
goog.Uri.prototype.userInfo_ = '';

/**
 * Domain part, e.g. "www.google.com"
 * @type {string}
 * @private
 */
goog.Uri.prototype.domain_ = '';

/**
 * Port, e.g. 8080.
 * @type {number?}
 * @private
 */
goog.Uri.prototype.port_ = null;

/**
 * Path, e.g. "/tests/img.png"
 * @type {string}
 * @private
 */
goog.Uri.prototype.path_ = '';

/**
 * Object representing query data
 * @type {goog.Uri.QueryData}
 * @private
 */
goog.Uri.prototype.queryData_ = null;

/**
 * The fragment without the #
 * @type {string}
 * @private
 */
goog.Uri.prototype.fragment_ = '';

/**
 * Whether or not this Uri should be treated as Read Only
 * @type {boolean}
 * @private
 */
goog.Uri.prototype.isReadOnly_ = false;

/**
 * Whether or not to ignore case when comparing query params
 * @type {boolean}
 * @private
 */
goog.Uri.prototype.ignoreCase_ = false;

/**
 * @return {string} The string form of the url.
 */
goog.Uri.prototype.toString = function() {
  if (this.cachedToString_) {
    return this.cachedToString_;
  }

  var out = [];

  if (this.scheme_) {
    out.push(goog.Uri.encodeSpecialChars_(
        this.scheme_, goog.Uri.reDisallowedInSchemeOrUserInfo_), ':');
  }

  if (this.domain_) {
    out.push('//');

    if (this.userInfo_) {
      out.push(goog.Uri.encodeSpecialChars_(
          this.userInfo_, goog.Uri.reDisallowedInSchemeOrUserInfo_), '@');
    }

    out.push(goog.Uri.encodeString_(this.domain_));

    if (this.port_ != null) {
      out.push(':', String(this.getPort()));
    }
  }

  if (this.path_) {
    out.push(goog.Uri.encodeSpecialChars_(
        this.path_, goog.Uri.reDisallowedInPath_));
  }

  var query = String(this.queryData_);
  if (query) {
    out.push('?', query);
  }

  if (this.fragment_) {
    out.push('#', goog.Uri.encodeString_(this.fragment_));
  }
  return this.cachedToString_ = out.join('');
};


/**
 * Resolves a relative url string to a this base uri.
 *
 * There are several kinds of relative urls:<br>
 * 1. foo - replaces the last part of the path, the whole query and fragment<br>
 * 2. /foo - replaces the the path, the query and fragment<br>
 * 3. //foo - replaces everything from the domain on.  foo is a domain name<br>
 * 4. ?foo - replace the query and fragment<br>
 * 5. #foo - replace the fragment only
 *
 * @param {goog.Uri} relativeUri The relative url to resolve.
 * @return {goog.Uri} The resolved URI.
 */
goog.Uri.prototype.resolve = function(relativeUri) {

  var absoluteUri = this.clone();

  // we satisfy these conditions by looking for the first part of relativeUri
  // that is not blank and applying defaults to the rest

  var overridden = relativeUri.hasScheme();

  if (overridden) {
    absoluteUri.setScheme(relativeUri.getScheme());
  } else {
    overridden = relativeUri.hasUserInfo();
  }

  if (overridden) {
    absoluteUri.setUserInfo(relativeUri.getUserInfo());
  } else {
    overridden = relativeUri.hasDomain();
  }

  if (overridden) {
    absoluteUri.setDomain(relativeUri.getDomain());
  } else {
    overridden = relativeUri.hasPort();
  }

  var path = relativeUri.getPath();
  if (overridden) {
    absoluteUri.setPort(relativeUri.getPort());
  } else {
    overridden = relativeUri.hasPath();
    if (overridden) {
      // resolve path properly
      if (!new RegExp('^/').test(path)) {
        // path is relative
        path = absoluteUri.getPath().replace(
            new RegExp('/?[^/]*$'), '/' + path);
      }
    }
  }

  if (overridden) {
    absoluteUri.setPath(path);
  } else {
    overridden = relativeUri.hasQuery();
  }

  if (overridden) {
    absoluteUri.setQueryData(relativeUri.getQuery());
  } else {
    overridden = relativeUri.hasFragment();
  }

  if (overridden) {
    absoluteUri.setFragment(relativeUri.getFragment());
  }

  return absoluteUri;
};


/**
 * Clone the URI instance
 * @return {goog.Uri} New instance of the URI objcet.
 */
goog.Uri.prototype.clone = function() {
  return new goog.Uri.create(this.scheme_, this.userInfo_, this.domain_,
                             this.port_, this.path_, this.queryData_.clone(),
                             this.fragment_, this.ignoreCase_);
};


/**
 * @return {string} The encoded scheme/protocol for the URI.
 */
goog.Uri.prototype.getScheme = function() {
  return this.scheme_;
};


/**
 * Set the scheme/protocol
 * @param {string} newScheme New scheme value.
 * @param {boolean} opt_decode Optional param for whether to decode new value.
 * @return {goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setScheme = function(newScheme, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.scheme_ = opt_decode ? goog.Uri.decodeOrEmpty_(newScheme) : newScheme;

  // remove an : at the end of the scheme so somebody can pass in
  // window.location.protocol
  if (this.scheme_) {
    this.scheme_ = this.scheme_.replace(/:$/, '');
  }
  return this;
};


/**
 * @return {boolean} Whether the scheme has been set.
 */
goog.Uri.prototype.hasScheme = function() {
  return !!this.scheme_;
};


/**
 * @return {string} The decoded user info.
 */
goog.Uri.prototype.getUserInfo = function() {
  return this.userInfo_;
};


/**
 * Set the userInfo
 * @param {string} newUserInfo New userInfo value.
 * @param {boolean} opt_decode Optional param for whether to decode new value.
 * @return {goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setUserInfo = function(newUserInfo, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.userInfo_ = opt_decode ? goog.Uri.decodeOrEmpty_(newUserInfo) :
                   newUserInfo;
  return this;
};


/**
 * @return {boolean} Whether the user info has been set.
 */
goog.Uri.prototype.hasUserInfo = function() {
  return !!this.userInfo_;
};


/**
 * @return {string} The decoded domain.
 */
goog.Uri.prototype.getDomain = function() {
  return this.domain_;
};


/**
 * Set the domain
 * @param {string} newDomain New domain value.
 * @param {boolean} opt_decode Optional param for whether to decode new value.
 * @return {goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setDomain = function(newDomain, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.domain_ = opt_decode ? goog.Uri.decodeOrEmpty_(newDomain) : newDomain;
  return this;
};


/**
 * @return {boolean} Whether the domain has been set.
 */
goog.Uri.prototype.hasDomain = function() {
  return !!this.domain_;
};


/**
 * @return {number} The port number.
 */
goog.Uri.prototype.getPort = function() {
  return this.port_;
};


/**
 * Sets the port number
 * @param {number} newPort Port number.
 * @return {goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setPort = function(newPort) {
  this.enforceReadOnly();
  delete this.cachedToString_;

  if (newPort) {
    newPort = Number(newPort);
    if (isNaN(newPort) || newPort < 0) {
     throw Error('Bad port number ' + newPort);
    }
    this.port_ = newPort;
  } else {
    this.port_ = null;
  }

  return this;
};


/**
 * @return {boolean} Whether the port has been set.
 */
goog.Uri.prototype.hasPort = function() {
  return this.port_ != null;
};


/**
  * @return {string} The decoded path.
 */
goog.Uri.prototype.getPath = function() {
  return this.path_;
};


/**
 * Set the path
 * @param {string} newPath New path value.
 * @param {boolean} opt_decode Optional param for whether to decode new value.
 * @return {goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setPath = function(newPath, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.path_ = opt_decode ? goog.Uri.decodeOrEmpty_(newPath) : newPath;
  return this;
};


/**
 * @return {boolean} Whether the path has been set.
 */
goog.Uri.prototype.hasPath = function() {
  return !!this.path_;
};


/**
 * @return {boolean} Whether the query string has been set.
 */
goog.Uri.prototype.hasQuery = function() {
  return this.queryData_ !== null && this.queryData_.toString() !== '';
};


/**
 * Sets the query data
 * @param {goog.Uri.QueryData|string} queryData QueryData object.
 * @return {goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setQueryData = function(queryData) {
  this.enforceReadOnly();
  delete this.cachedToString_;

  if (queryData instanceof goog.Uri.QueryData) {
    this.queryData_ = queryData;
    this.queryData_.uri_ = this;
    this.queryData_.setIgnoreCase(this.ignoreCase_);
  } else {
    this.queryData_ = new goog.Uri.QueryData(queryData, this, this.ignoreCase_);
  }

  return this;
};


/**
 * Returns the query data as as string
 * @return {string} The query data as a string.
 */
goog.Uri.prototype.getQuery = function() {
  return this.queryData_.toString();
};


/**
 * Returns the query data
 * @return {goog.Uri.QueryData} QueryData object.
 */
goog.Uri.prototype.getQueryData = function() {
  return this.queryData_;
};


/**
 * Sets the value of the named query parameters, clearing previous values for
 * that key.
 *
 * @param {string} key The parameter to set.
 * @param {string} value The new value.
 * @return {goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setParameterValue = function(key, value) {
  this.enforceReadOnly();
  delete this.cachedToString_;

  this.queryData_.set(key, value);
  return this;
};


/**
 * Sets the values of the named query parameters, clearing previous values for
 * that key.  Not new values will currently be moved to the end of the query
 * string.
 *
 * So, <code>goog.Uri.parse('foo?a=b&c=d&e=f').setParameterValues('c', ['new'])
 * </code> yields <tt>foo?a=b&e=f&c=new</tt>.</p>
 *
 * @param {string} key The parameter to set.
 * @param {Array.<string>} values The new values.  If values is a single string
 *     then it will be treated as the sole value.
 * @return {goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setParameterValues = function(key, values) {
  this.enforceReadOnly();
  delete this.cachedToString_;

  if (!goog.isArray(values)) {
    values = [String(values)];
  }

  this.queryData_.setValues(key, values);

  return this;
};


/**
 * Returns the value<b>s</b> for a given cgi parameter as a list of decoded
 * query parameter values.
 * @param {string} name The parameter to get values for.
 * @return {Array.<string>} The values for a given cgi parameter as a list of
 *     decoded query parameter values.
 */
goog.Uri.prototype.getParameterValues = function(name) {
    return this.queryData_.getValues(name);
};


/**
 * Returns the first value for a given cgi parameter or undefined if the given
 * parameter name does not appear in the query string.
 * @param {string} paramName Unescaped parameter name.
 * @return {string|undefined} The first value for a given cgi parameter or
 *     undefined if the given parameter name does not appear in the query
 *     string.
 */
goog.Uri.prototype.getParameterValue = function(paramName) {
  return this.queryData_.get(paramName);
};


/**
 * @return {string} The URI fragment, not including the #.
 */
goog.Uri.prototype.getFragment = function() {
  return this.fragment_;
};


/**
 * Set the URI fragment
 * @param {string} newFragment New fragment value.
 * @param {boolean} opt_decode Optional param for whether to decode new value.
 * @return {goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setFragment = function(newFragment, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.fragment_ = opt_decode ? goog.Uri.decodeOrEmpty_(newFragment) :
                   newFragment;
  return this;
};


/**

 * @return {boolean} Whether the URI has a fragment set.
 */
goog.Uri.prototype.hasFragment = function() {
  return !!this.fragment_;
};


/**
 * Returns true if this has the same domain as that of uri2
 * @param {goog.Uri} uri2 The URI object to compare to.
 * @return {boolean} true if same domain; false otherwise.
 */
goog.Uri.prototype.hasSameDomainAs = function(uri2) {
  return ((!this.hasDomain() && !uri2.hasDomain()) ||
          this.getDomain() == uri2.getDomain()) &&
      ((!this.hasPort() && !uri2.hasPort()) ||
          this.getPort() == uri2.getPort());
};


/**
 * Adds a random parameter to the Uri
 * @return {goog.Uri} Reference to this Uri object.
 */
goog.Uri.prototype.makeUnique = function() {
  this.enforceReadOnly();
  this.setParameterValue(goog.Uri.RANDOM_PARAM, goog.string.getRandomString());

  return this;
};


/**
 * Setter for isReadOnly_. If this goog.Uri is read-only, enforceReadOnly_ will
 * be called at the start of any function that may modify this Uri.
 * @param {boolean} isReadOnly whether this goog.Uri should be read only.
 */
goog.Uri.prototype.setReadOnly = function(isReadOnly) {
  this.isReadOnly_ = isReadOnly;
};


/**
 * Getter for isReadOnly_.
 * @return {boolean} true if this.isReadOnly_ is true.
 */
goog.Uri.prototype.isReadOnly = function() {
  return this.isReadOnly_;
};


/**
 * Checks if this Uri has been marked as read only, and if so, throws an error.
 * This should be called whenever any modifying function is called.
 */
goog.Uri.prototype.enforceReadOnly = function() {
  if (this.isReadOnly_) {
    throw Error('Tried to modify a read-only Uri');
  }
};


/**
 * Setter for ignoreCase_.
 * NOTE: If there are already key/value pairs in the QueryData, and
 * ignoreCase_ is set to false, the keys will all be lower-cased.
 * @param {boolean} ignoreCase whether this goog.Uri should ignore case.
 */
goog.Uri.prototype.setIgnoreCase = function(ignoreCase) {
  this.ignoreCase_ = ignoreCase;
  if (this.queryData_) {
    this.queryData_.setIgnoreCase(ignoreCase);
  }
};


/**
 * Getter for ignoreCase_.
 * @return {boolean} true if this.ignoreCase_ is true.
 */
goog.Uri.prototype.getIgnoreCase = function() {
  return this.ignoreCase_;
};


//==============================================================================
// Static members
//==============================================================================


/**
 * Creates a uri from the string form.  Basically an alias of new goog.Uri().
 * If a Uri object is passed to parse then it will return a clone of the object.
 *
 * @param {string|goog.Uri} uri Raw URI string or instance of Uri object.
 * @param {boolean} opt_ignoreCase Whether to ignore the case of parameter
 * names in #getParameterValue.
 * @return {goog.Uri} The new URI object.
 */
goog.Uri.parse = function(uri, opt_ignoreCase) {
  return uri instanceof goog.Uri ?
         uri.clone() : new goog.Uri(uri, opt_ignoreCase);
};


/**
 * Creates a new goog.Uri object from unencoded parts.
 *
 * @param {string} opt_scheme Scheme/protocol or full URI to parse.
 * @param {string} opt_userInfo username:password.
 * @param {string} opt_domain www.google.com.
 * @param {number} opt_port 9830.
 * @param {string} opt_path /some/path/to/a/file.html.
 * @param {string} opt_query a=1&b=2.
 * @param {string} opt_fragment The fragment without the #.
 * @param {boolean} opt_ignoreCase Whether to ignore parameter name case in
 *     #getParameterValue.
 *
 * @return {goog.Uri} The new URI object.
 */
goog.Uri.create = function(opt_scheme, opt_userInfo, opt_domain, opt_port,
                           opt_path, opt_query, opt_fragment, opt_ignoreCase) {

  var uri = new goog.Uri(null, opt_ignoreCase);

  uri.setScheme(opt_scheme);
  uri.setUserInfo(opt_userInfo);
  uri.setDomain(opt_domain);
  uri.setPort(opt_port);
  uri.setPath(opt_path);
  uri.setQueryData(opt_query);
  uri.setFragment(opt_fragment);

  return uri;
};


/**
 * Resolves a relative Uri against a base Uri, accepting both strings and
 * Uri objects.
 *
 * @param {string|goog.Uri} base Base Uri.
 * @param {string|goog.Uri} rel Relative Uri.
 * @return {goog.Uri} Resolved uri.
 */
goog.Uri.resolve = function(base, rel) {
  if (!(base instanceof goog.Uri)) {
    base = goog.Uri.parse(base);
  }

  if (!(rel instanceof goog.Uri)) {
    rel = goog.Uri.parse(rel);
  }

  return base.resolve(rel);
};


/**
 * Decodes a value or returns null if it isn't defined or empty
 * @param {string} val Value to decode.
 * @return {string} Decoded value.
 * @private
 */
goog.Uri.decodeOrEmpty_ = function(val) {
  // Don't use UrlDecode() here because val is not a query parameter.
  return val ? decodeURIComponent(val) : '';
};


/**
 * URI encode a string, or return null if it's not a string
 * @param {string} unescapedPart Unescaped string.
 * @return {string?} Escaped string.
 * @private
 */
goog.Uri.encodeString_ = function(unescapedPart) {
  if (goog.isString(unescapedPart)) {
    return encodeURIComponent(unescapedPart);
  }
  return null;
};

/**
 * Regular expression used for determining if a string needs to be encoded.
 * @type {RegExp}
 * @private
 */
goog.Uri.encodeSpecialRegExp_ = /^[a-zA-Z0-9\-_.!~*'():\/;?]*$/;

/**
 * If unescapedPart is non null, then escapes any characters in it that aren't
 * valid characters in a url and also escapes any special characters that
 * appear in extra.
 *
 * @param {string} unescapedPart The string to encode.
 * @param {RegExp} extra A character set of characters in [\01-\177].
 * @return {string} null iff unescapedPart == null.
 * @private
 */
goog.Uri.encodeSpecialChars_ = function(unescapedPart, extra) {
  var ret = null;
  if (goog.isString(unescapedPart)) {
    ret = unescapedPart;
    // checking if the search matches before calling encodeURI avoids an extra
    // allocation in IE6
    if (!goog.Uri.encodeSpecialRegExp_.test(ret)) {
      ret = encodeURI(unescapedPart);
    }
    // checking if the search matches before calling replace avoids an extra
    // allocation in IE6
    if (ret.search(extra) >= 0) {
      ret = ret.replace(extra, goog.Uri.encodeChar_);
    }
  }
  return ret;
};


/**
 * Converts a character in [\01-\177] to its unicode character equivalent.
 * @param {string} ch One character string.
 * @return {string} Encoded string.
 * @private
 */
goog.Uri.encodeChar_ = function(ch) {
  var n = ch.charCodeAt(0);
  return '%' + ((n >> 4) & 0xf).toString(16) + (n & 0xf).toString(16);
};


/**
 * A regular expression for breaking a URI into its component parts.
 *
 * {@link http://www.gbiv.com/protocols/uri/rfc/rfc3986.html#RFC2234} says
 * As the "first-match-wins" algorithm is identical to the "greedy"
 * disambiguation method used by POSIX regular expressions, it is natural and
 * commonplace to use a regular expression for parsing the potential five
 * components of a URI reference.
 *
 * The following line is the regular expression for breaking-down a
 * well-formed URI reference into its components.
 *
 * <pre>
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 * </pre>
 *
 * The numbers in the second line above are only to assist readability; they
 * indicate the reference points for each subexpression (i.e., each paired
 * parenthesis). We refer to the value matched for subexpression <n> as $<n>.
 * For example, matching the above expression to
 * <pre>
 *     http://www.ics.uci.edu/pub/ietf/uri/#Related
 * </pre>
 * results in the following subexpression matches:
 * <pre>
 *    $1 = http:
 *    $2 = http
 *    $3 = //www.ics.uci.edu
 *    $4 = www.ics.uci.edu
 *    $5 = /pub/ietf/uri/
 *    $6 = <undefined>
 *    $7 = <undefined>
 *    $8 = #Related
 *    $9 = Related
 * </pre>
 * where <undefined> indicates that the component is not present, as is the
 * case for the query component in the above example. Therefore, we can
 * determine the value of the five components as
 * <pre>
 *    scheme    = $2
 *    authority = $4
 *    path      = $5
 *    query     = $7
 *    fragment  = $9
 * </pre>
 *
 * msamuel: I have modified the regular expression slightly to expose the
 * userInfo, domain, and port separately from the authority.
 * The modified version yields
 * <pre>
 *    $1 = http              scheme
 *    $2 = <undefined>       userInfo -\
 *    $3 = www.ics.uci.edu   domain       | authority
 *    $4 = <undefined>       port        -/
 *    $5 = /pub/ietf/uri/    path
 *    $6 = <undefined>       query without ?
 *    $7 = Related           fragment without #
 * </pre>
 * @private
 */
goog.Uri.re_ = null;


/**
 * @return {RegExp} The URI regular expression, which is lazy loaded.
 * @private
 */
goog.Uri.getRE_ = function() {

  if (!goog.Uri.re_) {
    goog.Uri.re_ = new RegExp(
      '^' +
      '(?:' +
        '([^:/?#]+)' +         // scheme
      ':)?' +
      '(?://' +
        '(?:([^/?#]*)@)?' +    // userInfo
        '([^/?#:@]*)' +        // domain
        '(?::([0-9]+))?' +     // port
      ')?' +
      '([^?#]+)?' +            // path
      '(?:\\?([^#]*))?' +      // query
      '(?:#(.*))?' +           // fragment
      '$');
  }

  return /** @type {RegExp} */ (goog.Uri.re_);
};


/**
 * Regular expression for characters that are disallowed in the scheme or
 * userInfo part of the URI
 * @private
 */
goog.Uri.reDisallowedInSchemeOrUserInfo_ = /[#\/\?@]/g;


/**
 * Regular expression for characters that are disallowed in the path
 * @private
 */
goog.Uri.reDisallowedInPath_ = /[\#\?]/g;

/**
 * Checks whether two URIs have the same domain
 * @param {string} uri1String First URI string.
 * @param {string} uri2String Second URI string.
 * @return {boolean} true if the two URIs have the same domain; false otherwise.
 */
goog.Uri.haveSameDomain = function(uri1String, uri2String) {
  var uri1 = new goog.Uri(uri1String);
  var uri2 = new goog.Uri(uri2String);
  return uri1.hasSameDomainAs(uri2);
};




/**
 * Class used to represent URI query parameters.  It is essentially a hash of
 * name-value pairs, though a name can be present more than once.
 *
 * Has the same interface as the collections in goog.structs.
 *
 * @param {string} opt_query Optional query string to parse into the object.
 * @param {goog.Uri} opt_uri Optional uri object that should have it's cache
 * invalidated when this object updates.
 * @param {boolean} opt_ignoreCase If true, ignore the case of the parameter
 *     name in #get.
 * @constructor
 */
goog.Uri.QueryData = function(opt_query, opt_uri, opt_ignoreCase) {
  /**
   * We need to use a Map because we cannot guarantee that the key names will
   * not be problematic for IE
   * @type {Object}
   */
  this.keyMap_ = new goog.structs.Map();

  /**
   * Reference to a uri object which uses the query data.  This allows the
   * QueryData object to invalidate the cache
   * @type {goog.Uri}
   */
  this.uri_ = opt_uri;

  /**
   * If true, ignore the case of the parameter name in #get
   * @type {boolean}
   */
  this.ignoreCase_ = !!opt_ignoreCase;

  // Parse the query string
  if (opt_query) {
    var pairs = opt_query.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var indexOfEquals = pairs[i].indexOf('=');
      var name, value;
      if (indexOfEquals >= 0) {
        name = pairs[i].substring(0, indexOfEquals);
        value = pairs[i].substring(indexOfEquals + 1);
      } else {
        name = pairs[i];
      }
      name = goog.string.urlDecode(name);
      name = this.getKeyName_(name);
      this.add(name, value ? goog.string.urlDecode(value) : '');
    }
  }
};


/**
 * The number of params
 * @private
 * @type {number}
 */
goog.Uri.QueryData.prototype.count_ = 0;


/**
 * @return {Number} The number of parameters.
 */
goog.Uri.QueryData.prototype.getCount = function() {
  return this.count_;
};


/**
 * Adds a key value pair.
 * @param {string} key Name.
 * @param {string} value Value.
 * @return {goog.Uri.QueryData} Instance of this object.
 */
goog.Uri.QueryData.prototype.add = function(key, value) {
  this.invalidateCache_();

  key = this.getKeyName_(key);
  if (!this.containsKey(key)) {
    this.keyMap_.set(key, value);
  } else {
    var current = this.keyMap_.get(key);
    if (goog.isArray(current)) {
      current.push(value);
    } else {
      this.keyMap_.set(key, [current, value]);
    }
  }

  this.count_++;

  return this;
};


/**
 * Removes all the params with the given key.
 * @param {string} key Name.
 * @return {boolean} Whether any parameter was removed.
 */
goog.Uri.QueryData.prototype.remove = function(key) {
  key = this.getKeyName_(key);
  if (this.keyMap_.containsKey(key)) {
    this.invalidateCache_();

    // we need to get it to know how many to decrement the count with
    var old = this.keyMap_.get(key);
    if (goog.isArray(old)) {
      this.count_ -= old.length;
    } else {
      this.count_--;
    }
    return this.keyMap_.remove(key);
  }
  return false;
};


/**
 * Clears the parameters
 */
goog.Uri.QueryData.prototype.clear = function() {
  this.invalidateCache_();
  this.keyMap_.clear();
  this.count_ = 0;
};


/**
 * Whether we have any parameters
 */
goog.Uri.QueryData.prototype.isEmpty = function() {
  return this.count_ == 0;
};


/**
 * Whether there is a parameter with the given name
 * @param {string} key The parameter name to check for.
 * @return {boolean} Whether there is a parameter with the given name.
 */
goog.Uri.QueryData.prototype.containsKey = function(key) {
  key = this.getKeyName_(key);
  return this.keyMap_.containsKey(key);
};


/**
 * Whether there is a parameter with the given value.
 * @param {string} value The value to check for.
 * @return {boolean} Whether there is a parameter with the given value.
 */
goog.Uri.QueryData.prototype.containsValue = function(value) {
  // NOTE(arv): This solution goes through all the params even if it was the
  // first param. We can get around this by not reusing code or by switching to
  // iterators.
  var vals = this.getValues();
  return goog.array.contains(vals, value);
};


/**
 * Returns all the keys of the parameters. If a key is used multiple times
 * it will be included multiple times in the returned array
 * @return {Array} All the keys of the parameters.
 */
goog.Uri.QueryData.prototype.getKeys = function() {
  // We need to get the values to know how many keys to add.
  var vals = this.keyMap_.getValues(); // Array.<Array|String>
  var keys = this.keyMap_.getKeys(); // Array.<String>
  var rv = [];
  for (var i = 0; i < keys.length; i++) {
    var val = vals[i];
    if (goog.isArray(val)) {
      for (var j = 0; j < val.length; j++) {
        rv.push(keys[i]);
      }
    } else {
      rv.push(keys[i]);
    }
  }
  return rv
};


/**
 * Returns all the values of the parameters with the given name. If the query
 * data has no such key this will return an empty array. If no key is given
 * all values wil be returned.
 * @param {string} opt_key The name of the parameter to get the values for.
 * @return {Array} All the values of the parameters with the given name.
 */
goog.Uri.QueryData.prototype.getValues = function(opt_key) {
  var rv;
  if (opt_key) {
    var key = this.getKeyName_(opt_key);
    if (this.containsKey(key)) {
      var value = this.keyMap_.get(key);
      if (goog.isArray(value)) {
        return value;
      } else {
        rv = [];
        rv.push(value);
      }
    } else {
      rv = [];
    }
  } else {
    // return all values
    var vals = this.keyMap_.getValues(); // Array.<Array|String>
    rv = [];
    for (var i = 0; i < vals.length; i++) {
      var val = vals[i];
      if (goog.isArray(val)) {
        goog.array.extend(rv, val);
      } else {
        rv.push(val);
      }
    }
  }
  return rv;
};


/**
 * Sets a key value pair and removes all other keys with the same value.
 *
 * @param {string} key Name.
 * @param {string} value Value.
 * @return {goog.Uri.QueryData} Instance of this object.
 */
goog.Uri.QueryData.prototype.set = function(key, value) {
  this.invalidateCache_();

  key = this.getKeyName_(key);
  if (this.containsKey(key)) {
    var old = this.keyMap_.get(key);
    if (goog.isArray(old)) {
      this.count_ -= old.length;
    } else {
      this.count_--;
    }
  }

  this.keyMap_.set(key, value);
  this.count_++;
  return this;
};


/**
 * Returns the first value associated with the key. If the query data has no
 * such key this will return undefined or the optional default.
 * @param {string} key The name of the parameter to get the value for.
 * @param {string} opt_default The default value to return if the query data
 *     has no such key.
 * @return {string|undefined} The first value associated with the key.
 */
goog.Uri.QueryData.prototype.get = function(key, opt_default) {
  key = this.getKeyName_(key);
  if (this.containsKey(key)) {
    var val = this.keyMap_.get(key);
    if (goog.isArray(val)) {
      return val[0];
    } else {
      return val;
    }
  } else {
    return opt_default;
  }
};


/**
 * Sets the values for a key, if the key has already got values defined, this
 * will override the existing values then remove any left over
 * @param {string} key The key to set values for.
 * @param {Array} values The values to set.
 */
goog.Uri.QueryData.prototype.setValues = function(key, values) {
  this.invalidateCache_();

  key = this.getKeyName_(key);
  if (this.containsKey(key)) {
    var old = this.keyMap_.get(key);
    if (goog.isArray(old)) {
      this.count_ -= old.length;
    } else {
      this.count_--;
    }
  }

  if (values.length > 0) {
    this.keyMap_.set(key, values);
    this.count_ += values.length;
  }
};


/**
 * @return {string} The query data encoded as application/x-www-url-encoded.
 */
goog.Uri.QueryData.prototype.toString = function() {
  if (this.cachedToString_) {
    return this.cachedToString_;
  }

  var sb = [];

  // this used to use this.getKeys and this.getVals but that generates a lot
  // allocations than just iterating over the keys
  var count = 0;
  var keys = this.keyMap_.getKeys();
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var encodedKey = goog.string.urlEncode(key);
    var val = this.keyMap_.get(key);
    if (goog.isArray(val)) {
      for (var j = 0; j < val.length; j++) {
        if (count > 0) {
          sb.push('&');
        }
        sb.push(encodedKey, '=', goog.string.urlEncode(val[j]));
        count++;
      }
    } else {
      if (count > 0) {
        sb.push('&');
      }
      sb.push(encodedKey, '=', goog.string.urlEncode(val));
      count++;
    }
  }

  return this.cachedToString_ = sb.join('');
};


/**
 * Invalidate the cache.
 * @private
 */
goog.Uri.QueryData.prototype.invalidateCache_ = function() {
  delete this.cachedToString_;
  if (this.uri_) {
    delete this.uri_.cachedToString_;
  }
};


/**
 * Removes all keys that are not in the provided list. (Modifies this object.)
 * @param {Array.<string>} keys The desired keys.
 * @return {goog.Uri.QueryData} a reference to this object.
 */
goog.Uri.QueryData.prototype.filterKeys = function(keys) {
  goog.structs.forEach(this.keyMap_, function(value, key, map) {
    if (!goog.array.contains(keys, key)) {
      this.remove(key);
    }
  }, this);
  return this;
};


/**
 * Clone the query data instance.
 * @return {goog.Uri.QueryData} New instance of the QueryData object.
 */
goog.Uri.QueryData.prototype.clone = function() {
  var rv = new goog.Uri.QueryData();
  rv.keyMap_ = this.keyMap_.clone();
  return rv;
};


/**
 * Helper function to get the key name from a JavaScript object. Converts
 * the object to a string, and to lower case if necessary.
 * @private
 * @param {Object} arg The object to get a key name from.
 * @return {string} valid key name which can be looked up in #keyMap_.
 */
goog.Uri.QueryData.prototype.getKeyName_ = function(arg) {
  var keyName = String(arg);
  if (this.ignoreCase_) {
    keyName = keyName.toLowerCase();
  }
  return keyName;
};


/**
 * Ignore case in parameter names.
 * NOTE: If there are already key/value pairs in the QueryData, and
 * ignoreCase_ is set to false, the keys will all be lower-cased.
 * @param {boolean} ignoreCase whether this goog.Uri should ignore case.
 */
goog.Uri.QueryData.prototype.setIgnoreCase = function(ignoreCase) {
  var resetKeys = ignoreCase && !this.ignoreCase_;
  if (resetKeys) {
    this.invalidateCache_();
    goog.structs.forEach(this.keyMap_, function(value, key, map) {
      var lowerCase = key.toLowerCase();
      if (key != lowerCase) {
        this.remove(key);
        this.add(lowerCase, value);
      }
    }, this);
  }
  this.ignoreCase_ = ignoreCase;
};


/**
 * Extends a query data object with another query data or map like object. This
 * operates 'in-place', it does not create a new QueryData object.
 *
 * @param {goog.Uri.QueryData|goog.structs.Map|Object} var_args The object from
 *     which key value pairs will be copied.
 */
goog.Uri.QueryData.prototype.extend = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    var data = arguments[i];
    goog.structs.forEach(data, function(value, key) {
      this.add(key, value);
    }, this);
  }
};
